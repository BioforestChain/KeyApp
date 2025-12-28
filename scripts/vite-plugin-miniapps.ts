/**
 * Vite Plugin: Miniapps
 *
 * 自动管理内置 miniapps 的开发与构建：
 * - Dev 模式：启动各 miniapp 的 vite dev server，拦截 /ecosystem.json
 * - Build 模式：构建所有 miniapps，生成静态 ecosystem.json
 */

import { createServer, build as viteBuild, type Plugin, type ViteDevServer } from 'vite'
import { resolve, join } from 'node:path'
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import detectPort from 'detect-port'

// ==================== Types ====================

interface MiniappManifest {
  id: string
  dirName: string  // 目录名，用于路径访问
  name: string
  description: string
  longDescription?: string
  icon: string
  version: string
  author: string
  website?: string
  category: 'tools' | 'exchange' | 'social' | 'games' | 'other'
  tags: string[]
  permissions: string[]
  chains: string[]
  screenshots: string[]
  publishedAt: string
  updatedAt: string
  beta: boolean
  themeColor: string
}

interface EcosystemJson {
  name: string
  version: string
  updated: string
  icon: string
  apps: Array<MiniappManifest & { url: string }>
}

interface MiniappServer {
  id: string
  port: number
  server: ViteDevServer
  baseUrl: string
}

interface MiniappsPluginOptions {
  miniappsDir?: string
  startPort?: number
}

// ==================== Plugin ====================

export function miniappsPlugin(options: MiniappsPluginOptions = {}): Plugin {
  const { miniappsDir = 'miniapps', startPort = 5180 } = options

  let root: string
  let isBuild = false
  const miniappServers: MiniappServer[] = []

  return {
    name: 'vite-plugin-miniapps',

    configResolved(config) {
      root = config.root
      isBuild = config.command === 'build'
    },

    async buildStart() {
      if (isBuild) {
        await buildAllMiniapps(root, miniappsDir)
      }
    },

    async writeBundle(options) {
      if (isBuild && options.dir) {
        const ecosystem = generateEcosystemData(root, miniappsDir, null)
        const outputPath = resolve(options.dir, 'ecosystem.json')
        writeFileSync(outputPath, JSON.stringify(ecosystem, null, 2))
        console.log(`[miniapps] Generated ${outputPath}`)
      }
    },

    async configureServer(server: ViteDevServer) {
      const miniappsPath = resolve(root, miniappsDir)
      const manifests = scanMiniapps(miniappsPath)

      // 预分配端口
      const portAssignments: Array<{ manifest: MiniappManifest; port: number }> = []
      let currentPort = startPort
      for (const manifest of manifests) {
        const port = await detectPort(currentPort)
        currentPort = port + 1
        portAssignments.push({ manifest, port })
      }

      // 并行启动所有 miniapp dev servers（使用 Vite API）
      await Promise.all(
        portAssignments.map(async ({ manifest, port }) => {
          const miniappPath = join(miniappsPath, manifest.dirName)
          const miniappServer = await createMiniappServer(manifest.id, miniappPath, port)

          miniappServers.push({
            id: manifest.id,
            port,
            server: miniappServer,
            baseUrl: `https://localhost:${port}`,
          })

          console.log(`[miniapps] ${manifest.name} (${manifest.id}) started at https://localhost:${port}`)
        }),
      )

      // 拦截 /ecosystem.json 请求
      server.middlewares.use((req, res, next) => {
        if (req.url === '/ecosystem.json') {
          const portMap = new Map(miniappServers.map((s) => [s.id, s.port]))
          const ecosystem = generateEcosystemData(root, miniappsDir, portMap)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(ecosystem, null, 2))
          return
        }
        next()
      })

      // 清理服务器
      const cleanup = async () => {
        await Promise.all(miniappServers.map((s) => s.server.close()))
      }

      server.httpServer?.on('close', cleanup)
    },

    async closeBundle() {
      // Build 完成后清理
      await Promise.all(miniappServers.map((s) => s.server.close()))
    },
  }
}

// ==================== Helpers ====================

function scanMiniapps(miniappsPath: string): MiniappManifest[] {
  if (!existsSync(miniappsPath)) return []

  const manifests: MiniappManifest[] = []
  const entries = readdirSync(miniappsPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const manifestPath = join(miniappsPath, entry.name, 'manifest.json')
    if (!existsSync(manifestPath)) {
      console.warn(`[miniapps] ${entry.name}: missing manifest.json, skipping`)
      continue
    }

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as MiniappManifest
      manifests.push({ ...manifest, dirName: entry.name })
    } catch (e) {
      console.warn(`[miniapps] ${entry.name}: invalid manifest.json, skipping`)
    }
  }

  return manifests
}

async function createMiniappServer(id: string, root: string, port: number): Promise<ViteDevServer> {
  const server = await createServer({
    root,
    configFile: join(root, 'vite.config.ts'),
    server: {
      port,
      strictPort: true,
    },
    logLevel: 'warn',
  })

  await server.listen()
  return server
}

function generateEcosystemData(
  root: string,
  miniappsDir: string,
  portMap: Map<string, number> | null,
): EcosystemJson {
  const miniappsPath = resolve(root, miniappsDir)
  const manifests = scanMiniapps(miniappsPath)

  const apps = manifests.map((manifest) => {
    let url: string
    if (portMap) {
      // Dev 模式：使用 localhost 端口
      const port = portMap.get(manifest.id)
      url = port ? `https://localhost:${port}/` : `/miniapps/${manifest.dirName}/`
    } else {
      // Build 模式：使用相对路径
      url = `/miniapps/${manifest.dirName}/`
    }

    // 返回时移除 dirName（内部使用）
    const { dirName, ...rest } = manifest
    return {
      ...rest,
      url,
      icon: `/miniapps/${dirName}/icon.svg`,
      screenshots: manifest.screenshots.map((s) =>
        s.startsWith('/') ? s : `/miniapps/${dirName}/${s}`,
      ),
    }
  })

  return {
    name: 'Bio 官方生态',
    version: '1.0.0',
    updated: new Date().toISOString().split('T')[0],
    icon: '/logo.svg',
    apps,
  }
}

async function buildAllMiniapps(root: string, miniappsDir: string): Promise<void> {
  const miniappsPath = resolve(root, miniappsDir)
  const manifests = scanMiniapps(miniappsPath)

  console.log(`[miniapps] Building ${manifests.length} miniapps...`)

  // 并行构建所有 miniapps
  await Promise.all(
    manifests.map(async (manifest) => {
      const miniappPath = join(miniappsPath, manifest.dirName)
      console.log(`[miniapps] Building ${manifest.name} (${manifest.id})...`)

      await viteBuild({
        root: miniappPath,
        configFile: join(miniappPath, 'vite.config.ts'),
        logLevel: 'warn',
      })

      console.log(`[miniapps] ${manifest.name} built`)
    }),
  )

  console.log(`[miniapps] All miniapps built successfully`)
}

export default miniappsPlugin
