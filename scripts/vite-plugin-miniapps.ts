/**
 * Vite Plugin: Miniapps
 *
 * 自动管理内置 miniapps 的开发与构建：
 * - Dev 模式：启动各 miniapp 的 vite dev server（https + 动态端口），fetch /manifest.json 获取元数据
 * - Build 模式：构建所有 miniapps 到 dist/miniapps/，生成 ecosystem.json
 */

import { createServer, build as viteBuild, type Plugin, type ViteDevServer } from 'vite';
import { resolve, join } from 'node:path';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import detectPort from 'detect-port';
import https from 'node:https';
import { getRemoteMiniappsForEcosystem } from './vite-plugin-remote-miniapps';

// ==================== Types ====================

type MiniappRuntime = 'iframe' | 'wujie';

interface MiniappRuntimeConfig {
  server?: MiniappRuntime;
  build?: MiniappRuntime;
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
  baseUrl: string;
}

interface MiniappsPluginOptions {
  miniappsDir?: string;
  apps?: Record<string, MiniappRuntimeConfig>;
}

// ==================== Plugin ====================

export function miniappsPlugin(options: MiniappsPluginOptions = {}): Plugin {
  const { miniappsDir = 'miniapps', apps = {} } = options;

  let root: string;
  let isBuild = false;
  const miniappServers: MiniappServer[] = [];

  return {
    name: 'vite-plugin-miniapps',

    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
    },

    async writeBundle(options) {
      if (isBuild && options.dir) {
        await buildAllMiniapps(root, miniappsDir, options.dir);

        const ecosystem = generateEcosystemDataForBuild(root, miniappsDir, apps);
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
            baseUrl: `https://localhost:${port}`,
          });

          console.log(`[miniapps] ${manifest.name} (${manifest.id}) started at https://localhost:${port}`);
        }),
      );

      // 等待所有 miniapp 启动后，fetch 各自的 /manifest.json 生成 ecosystem
      const generateEcosystem = async (): Promise<EcosystemJson> => {
        const localApps = await Promise.all(
          miniappServers.map(async (s) => {
            try {
              const manifest = await fetchManifest(s.port);
              const appConfig = apps[manifest.id];
              const runtime = appConfig?.server ?? 'iframe';
              return {
                ...manifest,
                dirName: s.dirName,
                icon: new URL(manifest.icon, s.baseUrl).href,
                url: new URL('/', s.baseUrl).href,
                screenshots: manifest.screenshots.map((sc) => new URL(sc, s.baseUrl).href),
                runtime,
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

function generateEcosystemDataForBuild(
  root: string,
  miniappsDir: string,
  apps: Record<string, MiniappRuntimeConfig>,
): EcosystemJson {
  const miniappsPath = resolve(root, miniappsDir);
  const manifests = scanMiniapps(miniappsPath);

  const localApps = manifests.map((manifest) => {
    const shortId = manifest.id.split('.').pop() || '';
    const screenshots = scanScreenshots(root, shortId);
    const appConfig = apps[manifest.id];
    const runtime = appConfig?.build ?? 'iframe';

    const { dirName, ...rest } = manifest;
    return {
      ...rest,
      dirName,
      url: `./${dirName}/`,
      icon: `./${dirName}/icon.svg`,
      screenshots: screenshots.map((s) => `./${dirName}/${s}`),
      runtime,
    };
  });

  const remoteApps = scanRemoteMiniappsForBuild(miniappsPath);

  return {
    name: 'Bio 官方生态',
    version: '1.0.0',
    updated: new Date().toISOString().split('T')[0],
    icon: '../logos/logo-256.webp',
    apps: [...localApps, ...remoteApps],
  };
}

function scanRemoteMiniappsForBuild(miniappsPath: string): Array<MiniappManifest & { url: string }> {
  if (!existsSync(miniappsPath)) return [];

  const remoteApps: Array<MiniappManifest & { url: string }> = [];
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
      remoteApps.push({
        ...manifest,
        dirName: entry.name,
        url: baseUrl,
        icon: manifest.icon.startsWith('http') ? manifest.icon : new URL(manifest.icon, baseUrl).href,
        screenshots: manifest.screenshots?.map((s) => (s.startsWith('http') ? s : new URL(s, baseUrl).href)) ?? [],
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
