/**
 * Vite Plugin: Remote Miniapps
 *
 * 下载并 serve 远程 miniapps：
 * - Dev 模式：下载 manifest + zip，解压，启动静态服务器
 * - Build 模式：下载 manifest + zip，解压，复制到 dist/miniapps/
 *
 * 使用 fetchWithEtag 实现基于 ETag 的缓存
 */

import { type Plugin } from 'vite';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import type JSZipType from 'jszip';
import { fetchWithEtag, type FetchWithEtagOptions } from './utils/fetch-with-etag';

// ==================== Types ====================

type MiniappRuntime = 'iframe' | 'wujie';

interface MiniappServerConfig {
  runtime?: MiniappRuntime;
}

interface MiniappBuildConfig {
  runtime?: MiniappRuntime;
  /**
   * 重写 index.html 的 <base> 标签
   * - true: 自动推断为 '/miniapps/{dirName}/'
   * - string: 自定义路径
   * - undefined/false: 不重写
   */
  rewriteBase?: boolean | string;
}

interface RemoteMiniappConfig {
  metadataUrl: string;
  dirName: string;
  server?: MiniappServerConfig;
  build?: MiniappBuildConfig;
}

interface RemoteMetadata {
  id: string;
  name: string;
  version: string;
  zipUrl: string;
  manifestUrl: string;
  updatedAt: string;
}

interface RemoteMiniappsPluginOptions {
  miniapps: RemoteMiniappConfig[];
  miniappsDir?: string;
  timeout?: number;
  retries?: number;
}

interface MiniappManifest {
  id: string;
  dirName: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  version: string;
  author: string;
  website?: string;
  category: 'tools' | 'exchange' | 'social' | 'games' | 'other';
  tags: string[];
  permissions: string[];
  chains: string[];
  screenshots: string[];
  publishedAt: string;
  updatedAt: string;
  beta: boolean;
  themeColor: string;
  officialScore?: number;
  communityScore?: number;
}

interface RemoteMiniappServer {
  id: string;
  dirName: string;
  port: number;
  server: ReturnType<typeof createServer>;
  baseUrl: string;
  manifest: MiniappManifest;
  config: RemoteMiniappConfig;
}

// ==================== Plugin ====================

export function remoteMiniappsPlugin(options: RemoteMiniappsPluginOptions): Plugin {
  const { miniapps, miniappsDir = 'miniapps', timeout = 60000, retries = 3 } = options;
  const fetchOptions: FetchWithEtagOptions = { timeout, retries };

  let root: string;
  let isBuild = false;
  const servers: RemoteMiniappServer[] = [];
  const downloadFailures: string[] = [];

  return {
    name: 'vite-plugin-remote-miniapps',

    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
    },

    async buildStart() {
      if (miniapps.length === 0) return;

      const miniappsPath = resolve(root, miniappsDir);

      for (const config of miniapps) {
        try {
          await downloadAndExtract(config, miniappsPath, fetchOptions);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[remote-miniapps] ❌ Failed to download ${config.dirName}: ${errorMsg}`);
          downloadFailures.push(config.dirName);
        }
      }

      if (downloadFailures.length > 0 && isBuild) {
        throw new Error(
          `[remote-miniapps] Build aborted: failed to download remote miniapps: ${downloadFailures.join(', ')}. ` +
            `Check network connectivity to remote servers.`,
        );
      }
    },

    async writeBundle(outputOptions) {
      if (!isBuild || !outputOptions.dir) return;

      const miniappsPath = resolve(root, miniappsDir);
      const miniappsOutputDir = resolve(outputOptions.dir, 'miniapps');
      const missing: string[] = [];

      for (const config of miniapps) {
        const srcDir = join(miniappsPath, config.dirName);
        const destDir = join(miniappsOutputDir, config.dirName);

        if (existsSync(srcDir)) {
          mkdirSync(destDir, { recursive: true });
          cpSync(srcDir, destDir, { recursive: true });
          console.log(`[remote-miniapps] ✅ Copied ${config.dirName} to dist`);

          if (config.build?.rewriteBase) {
            const basePath =
              typeof config.build.rewriteBase === 'string' ? config.build.rewriteBase : `/miniapps/${config.dirName}/`;
            rewriteHtmlBase(destDir, basePath);
          }
        } else {
          missing.push(config.dirName);
        }
      }

      if (missing.length > 0) {
        throw new Error(
          `[remote-miniapps] Build failed: missing miniapps in output: ${missing.join(', ')}. ` +
            `Remote miniapps were not downloaded successfully.`,
        );
      }
    },

    async configureServer(server) {
      if (miniapps.length === 0) return;

      const miniappsPath = resolve(root, miniappsDir);

      for (const config of miniapps) {
        try {
          await downloadAndExtract(config, miniappsPath, fetchOptions);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[remote-miniapps] ⚠️ Failed to download ${config.dirName} (dev mode): ${errorMsg}`);
          continue;
        }
      }

      // 启动静态服务器为每个远程 miniapp
      for (const config of miniapps) {
        const miniappDir = join(miniappsPath, config.dirName);
        const manifestPath = join(miniappDir, 'manifest.json');

        if (!existsSync(manifestPath)) {
          console.warn(`[remote-miniapps] ${config.dirName}: manifest.json not found, skipping`);
          continue;
        }

        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as MiniappManifest;

        // 启动静态服务器
        const { server: httpServer, port } = await startStaticServer(miniappDir);
        const baseUrl = `http://localhost:${port}`;

        const serverInfo: RemoteMiniappServer = {
          id: manifest.id,
          dirName: config.dirName,
          port,
          server: httpServer,
          baseUrl,
          manifest,
          config,
        };

        servers.push(serverInfo);
        globalRemoteServers.push(serverInfo);

        console.log(`[remote-miniapps] ${manifest.name} (${manifest.id}) serving at ${baseUrl}`);
      }

      // 清理服务器
      const cleanup = async () => {
        for (const s of servers) {
          await new Promise<void>((resolve) => s.server.close(() => resolve()));
        }
      };

      server.httpServer?.on('close', cleanup);
    },

    async closeBundle() {
      // 关闭所有静态服务器
      for (const s of servers) {
        await new Promise<void>((resolve) => s.server.close(() => resolve()));
      }
    },
  };
}

// ==================== Helpers ====================

async function downloadAndExtract(
  config: RemoteMiniappConfig,
  miniappsPath: string,
  fetchOptions: FetchWithEtagOptions = {},
): Promise<void> {
  const targetDir = join(miniappsPath, config.dirName);

  console.log(`[remote-miniapps] Syncing ${config.dirName}...`);

  const metadataBuffer = await fetchWithEtag(config.metadataUrl, fetchOptions);
  const metadata = JSON.parse(metadataBuffer.toString('utf-8')) as RemoteMetadata;

  const localManifestPath = join(targetDir, 'manifest.json');
  if (existsSync(localManifestPath)) {
    const localManifest = JSON.parse(readFileSync(localManifestPath, 'utf-8')) as MiniappManifest & {
      _zipEtag?: string;
    };
    if (localManifest.version === metadata.version && localManifest._zipEtag) {
      const baseUrl = config.metadataUrl.replace(/\/[^/]+$/, '');
      const zipUrl = metadata.zipUrl.startsWith('.') ? `${baseUrl}/${metadata.zipUrl.slice(2)}` : metadata.zipUrl;
      try {
        const headResponse = await fetch(zipUrl, { method: 'HEAD' });
        const remoteEtag = headResponse.headers.get('etag') || '';
        if (remoteEtag === localManifest._zipEtag) {
          console.log(`[remote-miniapps] ${config.dirName} is up-to-date (v${metadata.version}, etag match)`);
          return;
        }
        console.log(
          `[remote-miniapps] ${config.dirName} zip changed (etag: ${localManifest._zipEtag} -> ${remoteEtag})`,
        );
      } catch {
        // HEAD request failed, continue with download
      }
    }
  }

  const baseUrl = config.metadataUrl.replace(/\/[^/]+$/, '');
  const manifestUrl = metadata.manifestUrl.startsWith('.')
    ? `${baseUrl}/${metadata.manifestUrl.slice(2)}`
    : metadata.manifestUrl;
  const zipUrl = metadata.zipUrl.startsWith('.') ? `${baseUrl}/${metadata.zipUrl.slice(2)}` : metadata.zipUrl;

  const manifestBuffer = await fetchWithEtag(manifestUrl, fetchOptions);
  const manifest = JSON.parse(manifestBuffer.toString('utf-8')) as MiniappManifest;

  const zipHeadResponse = await fetch(zipUrl, { method: 'HEAD' });
  const zipEtag = zipHeadResponse.headers.get('etag') || '';
  const zipBuffer = await fetchWithEtag(zipUrl, fetchOptions);

  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }
  mkdirSync(targetDir, { recursive: true });

  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipBuffer);
  for (const [relativePath, file] of Object.entries(zip.files) as [string, JSZipType.JSZipObject][]) {
    if (file.dir) {
      mkdirSync(join(targetDir, relativePath), { recursive: true });
    } else {
      const content = await file.async('nodebuffer');
      const filePath = join(targetDir, relativePath);
      mkdirSync(join(targetDir, relativePath, '..'), { recursive: true });
      writeFileSync(filePath, content);
    }
  }

  const manifestWithDir = { ...manifest, dirName: config.dirName, _zipEtag: zipEtag };
  writeFileSync(localManifestPath, JSON.stringify(manifestWithDir, null, 2));

  console.log(`[remote-miniapps] ${config.dirName} updated to v${manifest.version} (etag: ${zipEtag})`);
}

function rewriteHtmlBase(targetDir: string, basePath: string): void {
  const indexPath = join(targetDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn(`[remote-miniapps] index.html not found in ${targetDir}, skipping base rewrite`);
    return;
  }

  let html = readFileSync(indexPath, 'utf-8');
  html = html.replace(/<base[^>]*>/gi, '');

  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const baseTag = `<base href="${normalizedBase}">`;

  if (html.includes('<head>')) {
    html = html.replace(/<head>/i, `<head>\n    ${baseTag}`);
  } else if (html.includes('<HEAD>')) {
    html = html.replace(/<HEAD>/i, `<HEAD>\n    ${baseTag}`);
  } else {
    html = html.replace(/<html[^>]*>/i, `$&\n  <head>\n    ${baseTag}\n  </head>`);
  }

  // Convert absolute paths to relative paths (base tag only works with relative paths)
  // /assets/xxx -> assets/xxx, /css/xxx -> css/xxx, /images/xxx -> images/xxx
  html = html.replace(/(src|href)="\/(?!\/)/g, '$1="');

  writeFileSync(indexPath, html);
  console.log(`[remote-miniapps] Rewrote <base> and converted absolute paths to relative in ${indexPath}`);
}

/**
 * 启动简单的静态文件服务器
 */
async function startStaticServer(root: string): Promise<{ server: ReturnType<typeof createServer>; port: number }> {
  const sirv = (await import('sirv')).default;
  const handler = sirv(root, { dev: true, single: true });

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      handler(req, res, () => {
        res.writeHead(404);
        res.end('Not found');
      });
    });

    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        resolve({ server, port: address.port });
      } else {
        reject(new Error('Failed to get server address'));
      }
    });

    server.on('error', reject);
  });
}

// ==================== 共享状态 ====================

/** 全局注册的远程 miniapp 服务器 */
const globalRemoteServers: RemoteMiniappServer[] = [];

/**
 * 获取远程 miniapps 的服务器信息 (供 ecosystem.json 生成使用)
 */
export function getRemoteMiniappServers(): RemoteMiniappServer[] {
  return [...globalRemoteServers];
}

/**
 * 获取远程 miniapps 用于 ecosystem.json 的数据
 */
export function getRemoteMiniappsForEcosystem(): Array<
  MiniappManifest & { url: string; runtime?: 'iframe' | 'wujie' }
> {
  return globalRemoteServers.map((s) => ({
    ...s.manifest,
    dirName: s.dirName,
    icon: new URL(s.manifest.icon, s.baseUrl).href,
    url: new URL('/', s.baseUrl).href,
    screenshots: s.manifest.screenshots?.map((sc) => new URL(sc, s.baseUrl).href) ?? [],
    runtime: s.config.server?.runtime ?? 'iframe',
  }));
}

export default remoteMiniappsPlugin;
