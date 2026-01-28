/**
 * Vite Plugin: Miniapps
 *
 * 自动管理内置 miniapps 的开发与构建：
 * - Dev 模式：启动各 miniapp 的 vite dev server（https + 动态端口），fetch /manifest.json 获取元数据
 * - Build 模式：构建所有 miniapps 到 dist/miniapps/，生成 ecosystem.json
 */

import { createServer, build as viteBuild, type Plugin, type ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve, join, basename } from 'node:path';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import detectPort from 'detect-port';
import https from 'node:https';
import type { RollupWatcher } from 'rollup';
import sirv from 'sirv';
import { getRemoteMiniappsForEcosystem, type RemoteMiniappConfig } from './vite-plugin-remote-miniapps';
import type { WujieRuntimeConfig } from '../src/services/ecosystem/types';

// ==================== Types ====================

type MiniappRuntime = 'iframe' | 'wujie';

interface MiniappRuntimeConfig {
  server?: MiniappRuntime | { runtime: MiniappRuntime; wujieConfig?: WujieRuntimeConfig };
  build?: MiniappRuntime | { runtime: MiniappRuntime; wujieConfig?: WujieRuntimeConfig };
}

type MiniappDevMode = 'proxy' | 'build';

function parseRuntimeConfig(config?: MiniappRuntime | { runtime: MiniappRuntime; wujieConfig?: WujieRuntimeConfig }): {
  runtime: MiniappRuntime;
  wujieConfig?: WujieRuntimeConfig;
} {
  if (!config) return { runtime: 'iframe' };
  if (typeof config === 'string') return { runtime: config };
  return { runtime: config.runtime, wujieConfig: config.wujieConfig };
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
  runtime?: MiniappRuntime;
}

interface EcosystemJson {
  name: string;
  version: string;
  updated: string;
  icon: string;
  apps: Array<MiniappManifest & { url: string }>;
}

interface MiniappServer {
  id: string;
  dirName: string;
  port: number;
  server: ViteDevServer;
}

interface MiniappsPluginOptions {
  miniappsDir?: string;
  apps?: Record<string, MiniappRuntimeConfig>;
  remoteMiniapps?: RemoteMiniappConfig[];
  devMode?: MiniappDevMode;
}

// ==================== Plugin ====================

export function miniappsPlugin(options: MiniappsPluginOptions = {}): Plugin {
  const { miniappsDir = 'miniapps', apps = {}, remoteMiniapps = [], devMode } = options;
  const resolvedDevMode: MiniappDevMode =
    devMode ?? (process.env.MINIAPPS_DEV_MODE === 'build' ? 'build' : 'proxy');

  let root: string;
  let isBuild = false;
  const miniappServers: MiniappServer[] = [];
  const miniappBuildWatchers: RollupWatcher[] = [];
  let miniappsDevDistDir: string | null = null;

  return {
    name: 'vite-plugin-miniapps',

    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
    },

    async writeBundle(options) {
      if (isBuild && options.dir) {
        await buildAllMiniapps(root, miniappsDir, options.dir);

        const ecosystem = generateEcosystemDataForBuild(root, miniappsDir, apps, remoteMiniapps);
        const miniappsOutputDir = resolve(options.dir, 'miniapps');
        mkdirSync(miniappsOutputDir, { recursive: true });
        const outputPath = resolve(miniappsOutputDir, 'ecosystem.json');
        writeFileSync(outputPath, JSON.stringify(ecosystem, null, 2));
        console.log(`[miniapps] Generated ${outputPath}`);
      }
    },

    async configureServer(server: ViteDevServer) {
      const miniappsPath = resolve(root, miniappsDir);
      const manifests = scanMiniapps(miniappsPath);

      if (resolvedDevMode === 'build') {
        miniappsDevDistDir = resolve(root, 'public', 'miniapps');
        mkdirSync(miniappsDevDistDir, { recursive: true });

        await Promise.all(
          manifests.map(async (manifest) => {
            const miniappPath = join(miniappsPath, manifest.dirName);
            const outputDir = resolve(miniappsDevDistDir!, manifest.dirName);
            const result = await viteBuild({
              root: miniappPath,
              configFile: join(miniappPath, 'vite.config.ts'),
              base: './',
              build: {
                outDir: outputDir,
                emptyOutDir: true,
                watch: {},
                minify: false,
                sourcemap: true,
              },
              logLevel: 'warn',
            });

            if (result && typeof (result as RollupWatcher).on === 'function') {
              miniappBuildWatchers.push(result as RollupWatcher);
            }

            console.log(`[miniapps] ${manifest.name} built (watch mode)`);
          }),
        );

        server.middlewares.use(
          '/miniapps',
          sirv(miniappsDevDistDir, {
            dev: true,
            single: false,
          }),
        );

        const localApps = manifests.map((manifest) => {
          const appConfig = apps[manifest.id];
          const { runtime, wujieConfig } = parseRuntimeConfig(appConfig?.server);
          return {
            ...manifest,
            dirName: manifest.dirName,
            icon: resolveMiniappDevAsset(manifest.icon, manifest.dirName),
            url: `/miniapps/${manifest.dirName}/`,
            screenshots: manifest.screenshots.map((sc) => resolveMiniappDevAsset(sc, manifest.dirName)),
            runtime,
            wujieConfig,
          };
        });

        const remoteApps = getRemoteMiniappsForEcosystem();
        const ecosystemData: EcosystemJson = {
          name: 'Bio 官方生态',
          version: '1.0.0',
          updated: new Date().toISOString().split('T')[0],
          icon: '/logos/logo-256.webp',
          apps: [...localApps, ...remoteApps],
        };
        const ecosystemCache = JSON.stringify(ecosystemData, null, 2);

        server.middlewares.use((req, res, next) => {
          if (req.url === '/miniapps/ecosystem.json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(ecosystemCache);
            return;
          }
          next();
        });

        const cleanup = async () => {
          await Promise.all(miniappBuildWatchers.map((watcher) => watcher.close()));
        };
        server.httpServer?.on('close', cleanup);
        return;
      }

      // 预分配端口
      const portAssignments: Array<{ manifest: MiniappManifest; port: number }> = [];
      for (const manifest of manifests) {
        const port = await detectPort(0);
        portAssignments.push({ manifest, port });
      }

      // 并行启动所有 miniapp dev servers
      await Promise.all(
        portAssignments.map(async ({ manifest, port }) => {
          const miniappPath = join(miniappsPath, manifest.dirName);
          const miniappServer = await createMiniappServer(manifest.id, miniappPath, port);

          miniappServers.push({
            id: manifest.id,
            dirName: manifest.dirName,
            port,
            server: miniappServer,
          });

          console.log(`[miniapps] ${manifest.name} (${manifest.id}) started at https://localhost:${port}`);
        }),
      );

      // 同源代理：/miniapps/{dirName}/ -> miniapp dev server
      const proxyRoutes: Array<{ prefix: string; miniapp: MiniappServer }> = [];
      for (const miniapp of miniappServers) {
        proxyRoutes.push({ prefix: `/miniapps/${miniapp.dirName}`, miniapp });
      }
      const proxyMiddleware = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
        const url = req.url ?? '';
        for (const route of proxyRoutes) {
          if (url === route.prefix) {
            res.statusCode = 302;
            res.setHeader('Location', `${route.prefix}/`);
            res.end();
            return;
          }
          if (!url.startsWith(`${route.prefix}/`)) {
            continue;
          }
          const nextUrl = url.slice(route.prefix.length) || '/';
          void proxyMiniappRequest(req, res, route, nextUrl).catch(next);
          return;
        }
        next();
      };

      prependMiddleware(server, proxyMiddleware);

      // 等待所有 miniapp 启动后，fetch 各自的 /manifest.json 生成 ecosystem
      const generateEcosystem = async (): Promise<EcosystemJson> => {
        const localApps = await Promise.all(
          miniappServers.map(async (s) => {
            try {
              const manifest = await fetchManifest(s.port);
              const appConfig = apps[manifest.id];
              const { runtime, wujieConfig } = parseRuntimeConfig(appConfig?.server);
              return {
                ...manifest,
                dirName: s.dirName,
                icon: resolveMiniappDevAsset(manifest.icon, s.dirName),
                url: `/miniapps/${s.dirName}/`,
                screenshots: manifest.screenshots.map((sc) => resolveMiniappDevAsset(sc, s.dirName)),
                runtime,
                wujieConfig,
              };
            } catch (e) {
              console.error(`[miniapps] Failed to fetch manifest for ${s.id}:`, e);
              return null;
            }
          }),
        );

        const remoteApps = getRemoteMiniappsForEcosystem();

        return {
          name: 'Bio 官方生态',
          version: '1.0.0',
          updated: new Date().toISOString().split('T')[0],
          icon: '/logos/logo-256.webp',
          apps: [...localApps.filter((a): a is NonNullable<typeof a> => a !== null), ...remoteApps],
        };
      };

      // 预生成 ecosystem
      const ecosystemData = await generateEcosystem();
      let ecosystemCache = JSON.stringify(ecosystemData, null, 2);

      // 拦截 /miniapps/ecosystem.json 请求
      server.middlewares.use((req, res, next) => {
        if (req.url === '/miniapps/ecosystem.json') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(ecosystemCache);
          return;
        }
        next();
      });

      // 清理服务器
      const cleanup = async () => {
        await Promise.all(miniappServers.map((s) => s.server.close()));
      };

      server.httpServer?.on('close', cleanup);
    },

    async closeBundle() {
      await Promise.all(miniappServers.map((s) => s.server.close()));
      await Promise.all(miniappBuildWatchers.map((watcher) => watcher.close()));
    },
  };
}

// ==================== Helpers ====================

function scanMiniapps(miniappsPath: string): MiniappManifest[] {
  if (!existsSync(miniappsPath)) return [];

  const manifests: MiniappManifest[] = [];
  const entries = readdirSync(miniappsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = join(miniappsPath, entry.name, 'manifest.json');
    if (!existsSync(manifestPath)) {
      console.warn(`[miniapps] ${entry.name}: missing manifest.json, skipping`);
      continue;
    }

    // 跳过远程 miniapps (没有 vite.config.ts 的是已构建的远程 miniapp)
    const viteConfigPath = join(miniappsPath, entry.name, 'vite.config.ts');
    if (!existsSync(viteConfigPath)) {
      // 远程 miniapp，由 vite-plugin-remote-miniapps 处理
      continue;
    }

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as MiniappManifest;
      manifests.push({ ...manifest, dirName: entry.name });
    } catch (e) {
      console.warn(`[miniapps] ${entry.name}: invalid manifest.json, skipping`);
    }
  }

  return manifests;
}

async function createMiniappServer(_id: string, root: string, port: number): Promise<ViteDevServer> {
  const server = await createServer({
    root,
    configFile: join(root, 'vite.config.ts'),
    server: {
      cors: true,
      port,
      strictPort: true,
      https: true as any, // Type compatibility workaround
    },
    logLevel: 'warn',
  });

  await server.listen();
  return server;
}

async function fetchManifest(port: number): Promise<MiniappManifest> {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://localhost:${port}/manifest.json`, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

function scanScreenshots(root: string, shortId: string): string[] {
  const e2eDir = resolve(root, 'e2e/__screenshots__/Desktop-Chrome/miniapp-ui.mock.spec.ts');
  if (!existsSync(e2eDir)) return [];

  return readdirSync(e2eDir)
    .filter((f) => f.startsWith(`${shortId}-`) && f.endsWith('.png'))
    .slice(0, 2)
    .map((f) => `screenshots/${f}`);
}

function resolveMiniappDevAsset(path: string, dirName: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const normalized = path.replace(/^\.\//, '').replace(/^\//, '');
  return `/miniapps/${dirName}/${normalized}`;
}

function getRewriteMode(url: string, req: IncomingMessage): 'html' | 'js' | null {
  const accept = req.headers.accept ?? '';
  const path = url.split('?', 1)[0] ?? '';

  if (path.endsWith('/') || path.endsWith('.html') || accept.includes('text/html')) {
    return 'html';
  }

  if (
    path.includes('/@') ||
    path.includes('/@id/') ||
    path.endsWith('.js') ||
    path.endsWith('.ts') ||
    path.endsWith('.tsx') ||
    path.endsWith('.jsx')
  ) {
    return 'js';
  }

  return null;
}

function rewriteMiniappBody(body: string, prefix: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/(['"])\/@/g, `$1${prefix}/@`],
    [/(['"])\/@id\//g, `$1${prefix}/@id/`],
    [/(['"])\/src\//g, `$1${prefix}/src/`],
    [/(['"])\/node_modules\//g, `$1${prefix}/node_modules/`],
    [/(['"])\/@fs\//g, `$1${prefix}/@fs/`],
  ];

  let output = body;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

async function proxyMiniappRequest(
  req: IncomingMessage,
  res: ServerResponse,
  route: { prefix: string; miniapp: MiniappServer },
  nextUrl: string,
): Promise<void> {
  const rewriteMode = getRewriteMode(`${route.prefix}${nextUrl}`, req);
  const body = await readRequestBody(req);
  const headers = buildProxyHeaders(req, body, rewriteMode !== null);

  await new Promise<void>((resolve, reject) => {
    const proxyReq = https.request(
      {
        hostname: 'localhost',
        port: route.miniapp.port,
        path: nextUrl,
        method: req.method,
        headers,
        rejectUnauthorized: false,
      },
      (proxyRes) => {
        res.statusCode = proxyRes.statusCode ?? 502;

        const outgoingHeaders = normalizeProxyHeaders(proxyRes.headers, rewriteMode !== null);
        for (const [key, value] of Object.entries(outgoingHeaders)) {
          if (typeof value !== 'undefined') {
            res.setHeader(key, value);
          }
        }

        if (!rewriteMode) {
          proxyRes.pipe(res);
          proxyRes.on('end', resolve);
          proxyRes.on('error', reject);
          return;
        }

        const chunks: Buffer[] = [];
        proxyRes.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        proxyRes.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          const rewritten = rewriteMiniappBody(rawBody, route.prefix);
          res.setHeader('Content-Length', Buffer.byteLength(rewritten));
          res.end(rewritten);
          resolve();
        });
        proxyRes.on('error', reject);
      },
    );

    proxyReq.on('error', reject);

    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

async function readRequestBody(req: IncomingMessage): Promise<Buffer | null> {
  const method = req.method?.toUpperCase();
  if (!method || method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return null;
  return Buffer.concat(chunks);
}

function buildProxyHeaders(
  req: IncomingMessage,
  body: Buffer | null,
  disableCompression: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.startsWith(':')) continue;
    if (key === 'host') continue;
    if (key === 'connection') continue;
    if (key === 'content-length') continue;
    if (key === 'transfer-encoding') continue;
    if (key === 'accept-encoding' && disableCompression) continue;
    if (typeof value === 'undefined') continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }

  if (disableCompression) {
    headers['accept-encoding'] = 'identity';
  }
  if (body) {
    headers['content-length'] = String(body.length);
  }
  return headers;
}

function normalizeProxyHeaders(
  headers: IncomingMessage['headers'],
  stripEncoding: boolean,
): Record<string, string | string[] | undefined> {
  const output: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'undefined') continue;
    if (stripEncoding && (key === 'content-encoding' || key === 'content-length' || key === 'transfer-encoding')) {
      continue;
    }
    output[key] = value;
  }
  return output;
}

function prependMiddleware(
  server: ViteDevServer,
  middleware: (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void,
): void {
  const stack = (
    server.middlewares as {
      stack?: Array<{ route: string; handle: typeof middleware }>;
    }
  ).stack;
  if (stack) {
    stack.unshift({ route: '', handle: middleware });
    return;
  }
  server.middlewares.use(middleware);
}

function generateEcosystemDataForBuild(
  root: string,
  miniappsDir: string,
  apps: Record<string, MiniappRuntimeConfig>,
  remoteConfigs: RemoteMiniappConfig[],
): EcosystemJson {
  const miniappsPath = resolve(root, miniappsDir);
  const manifests = scanMiniapps(miniappsPath);

  const localApps = manifests.map((manifest) => {
    const shortId = manifest.id.split('.').pop() || '';
    const screenshots = scanScreenshots(root, shortId);
    const appConfig = apps[manifest.id];
    const { runtime, wujieConfig } = parseRuntimeConfig(appConfig?.build);

    const { dirName, ...rest } = manifest;
    return {
      ...rest,
      dirName,
      url: `./${dirName}/`,
      icon: `./${dirName}/icon.svg`,
      screenshots: screenshots.map((s) => `./${dirName}/${s}`),
      runtime,
      wujieConfig,
    };
  });

  const remoteApps = scanRemoteMiniappsForBuild(miniappsPath, remoteConfigs);

  return {
    name: 'Bio 官方生态',
    version: '1.0.0',
    updated: new Date().toISOString().split('T')[0],
    icon: '../logos/logo-256.webp',
    apps: [...localApps, ...remoteApps],
  };
}

function scanRemoteMiniappsForBuild(
  miniappsPath: string,
  remoteConfigs: RemoteMiniappConfig[],
): Array<MiniappManifest & { url: string; runtime?: MiniappRuntime; wujieConfig?: WujieRuntimeConfig }> {
  if (!existsSync(miniappsPath)) return [];

  const configByDirName = new Map(
    remoteConfigs
      .map((c) => (c.build?.locale ? [c.build.locale.dirName, c] : null))
      .filter((item): item is [string, RemoteMiniappConfig] => item !== null),
  );
  const remoteApps: Array<
    MiniappManifest & { url: string; runtime?: MiniappRuntime; wujieConfig?: WujieRuntimeConfig }
  > = [];
  const entries = readdirSync(miniappsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = join(miniappsPath, entry.name, 'manifest.json');
    const viteConfigPath = join(miniappsPath, entry.name, 'vite.config.ts');

    if (!existsSync(manifestPath)) continue;
    if (existsSync(viteConfigPath)) continue;

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as MiniappManifest;
      const baseUrl = `./${entry.name}/`;
      const config = configByDirName.get(entry.name);
      remoteApps.push({
        ...manifest,
        dirName: entry.name,
        url: baseUrl,
        icon: manifest.icon.startsWith('http') ? manifest.icon : new URL(manifest.icon, baseUrl).href,
        screenshots: manifest.screenshots?.map((s) => (s.startsWith('http') ? s : new URL(s, baseUrl).href)) ?? [],
        runtime: config?.build?.runtime ?? 'wujie',
        wujieConfig: config?.build?.wujieConfig,
      });
    } catch {
      console.warn(`[miniapps] ${entry.name}: invalid remote manifest.json, skipping`);
    }
  }

  return remoteApps;
}

async function buildAllMiniapps(root: string, miniappsDir: string, distDir: string): Promise<void> {
  const miniappsPath = resolve(root, miniappsDir);
  const manifests = scanMiniapps(miniappsPath);
  const miniappsDistDir = resolve(distDir, 'miniapps');

  mkdirSync(miniappsDistDir, { recursive: true });

  console.log(`[miniapps] Building ${manifests.length} miniapps...`);

  for (const manifest of manifests) {
    const miniappPath = join(miniappsPath, manifest.dirName);
    const outputDir = resolve(miniappsDistDir, manifest.dirName);
    const shortId = manifest.id.split('.').pop() || '';

    console.log(`[miniapps] Building ${manifest.name} (${manifest.id})...`);

    await viteBuild({
      root: miniappPath,
      configFile: join(miniappPath, 'vite.config.ts'),
      base: './',
      build: {
        outDir: outputDir,
        emptyOutDir: true,
      },
      logLevel: 'warn',
    });

    // 复制 public 目录静态资源（icon 等）
    const publicDir = join(miniappPath, 'public');
    if (existsSync(publicDir)) {
      cpSync(publicDir, outputDir, { recursive: true });
    }

    // 复制 e2e 截图
    const e2eScreenshotsDir = resolve(root, 'e2e/__screenshots__/Desktop-Chrome/miniapp-ui.mock.spec.ts');
    const screenshots = scanScreenshots(root, shortId);

    if (screenshots.length > 0 && existsSync(e2eScreenshotsDir)) {
      const screenshotsOutputDir = resolve(outputDir, 'screenshots');
      mkdirSync(screenshotsOutputDir, { recursive: true });

      for (const screenshot of screenshots) {
        const filename = screenshot.replace('screenshots/', '');
        const src = resolve(e2eScreenshotsDir, filename);
        const dest = resolve(screenshotsOutputDir, filename);
        if (existsSync(src)) {
          cpSync(src, dest);
        }
      }
    }

    console.log(`[miniapps] ${manifest.name} built`);
  }

  console.log(`[miniapps] All miniapps built successfully`);
}

export default miniappsPlugin;
