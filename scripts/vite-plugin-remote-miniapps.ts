/**
 * Vite Plugin: Remote Miniapps
 *
 * 下载并 serve 远程 miniapps：
 * - Dev 模式：下载 manifest + zip，解压，启动静态服务器
 * - Build 模式：下载 manifest + zip，解压，复制到 dist/miniapps/
 *
 * 使用 fetchWithEtag 实现基于 ETag 的缓存
 */

import { type Plugin } from 'vite'
import { resolve, join } from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import type JSZipType from 'jszip'
import { fetchWithEtag } from './utils/fetch-with-etag'

// ==================== Types ====================

interface RemoteMiniappConfig {
  /** 远程 metadata.json URL (包含 version, zipUrl, manifestUrl) */
  metadataUrl: string
  /** 解压到 miniapps/ 下的目录名 */
  dirName: string
}

interface RemoteMetadata {
  id: string
  name: string
  version: string
  zipUrl: string
  manifestUrl: string
  updatedAt: string
}

interface RemoteMiniappsPluginOptions {
  /** 远程 miniapp 配置列表 */
  miniapps: RemoteMiniappConfig[]
  /** miniapps 目录 (相对于项目根目录) */
  miniappsDir?: string
}

interface MiniappManifest {
  id: string
  dirName: string
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
  officialScore?: number
  communityScore?: number
}

interface RemoteMiniappServer {
  id: string
  dirName: string
  port: number
  server: ReturnType<typeof createServer>
  baseUrl: string
  manifest: MiniappManifest
}

// ==================== Plugin ====================

export function remoteMiniappsPlugin(options: RemoteMiniappsPluginOptions): Plugin {
  const { miniapps, miniappsDir = 'miniapps' } = options

  let root: string
  let isBuild = false
  const servers: RemoteMiniappServer[] = []

  return {
    name: 'vite-plugin-remote-miniapps',

    configResolved(config) {
      root = config.root
      isBuild = config.command === 'build'
    },

    async buildStart() {
      if (miniapps.length === 0) return

      const miniappsPath = resolve(root, miniappsDir)

      // 下载并解压所有远程 miniapps
      for (const config of miniapps) {
        await downloadAndExtract(config, miniappsPath)
      }
    },

    async writeBundle(outputOptions) {
      if (!isBuild || !outputOptions.dir) return

      const miniappsPath = resolve(root, miniappsDir)
      const miniappsOutputDir = resolve(outputOptions.dir, 'miniapps')

      // 复制远程 miniapps 到 dist
      for (const config of miniapps) {
        const srcDir = join(miniappsPath, config.dirName)
        const destDir = join(miniappsOutputDir, config.dirName)

        if (existsSync(srcDir)) {
          mkdirSync(destDir, { recursive: true })
          cpSync(srcDir, destDir, { recursive: true })
          console.log(`[remote-miniapps] Copied ${config.dirName} to dist`)
        }
      }
    },

    async configureServer(server) {
      if (miniapps.length === 0) return

      const miniappsPath = resolve(root, miniappsDir)

      // 先下载所有远程 miniapps (dev 模式下 buildStart 之后才执行 configureServer)
      for (const config of miniapps) {
        await downloadAndExtract(config, miniappsPath)
      }

      // 启动静态服务器为每个远程 miniapp
      for (const config of miniapps) {
        const miniappDir = join(miniappsPath, config.dirName)
        const manifestPath = join(miniappDir, 'manifest.json')

        if (!existsSync(manifestPath)) {
          console.warn(`[remote-miniapps] ${config.dirName}: manifest.json not found, skipping`)
          continue
        }

        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as MiniappManifest

        // 启动静态服务器
        const { server: httpServer, port } = await startStaticServer(miniappDir)
        const baseUrl = `http://localhost:${port}`

        const serverInfo: RemoteMiniappServer = {
          id: manifest.id,
          dirName: config.dirName,
          port,
          server: httpServer,
          baseUrl,
          manifest,
        }

        servers.push(serverInfo)
        globalRemoteServers.push(serverInfo)

        console.log(`[remote-miniapps] ${manifest.name} (${manifest.id}) serving at ${baseUrl}`)
      }

      // 清理服务器
      const cleanup = async () => {
        for (const s of servers) {
          await new Promise<void>((resolve) => s.server.close(() => resolve()))
        }
      }

      server.httpServer?.on('close', cleanup)
    },

    async closeBundle() {
      // 关闭所有静态服务器
      for (const s of servers) {
        await new Promise<void>((resolve) => s.server.close(() => resolve()))
      }
    },
  }
}

// ==================== Helpers ====================

/**
 * 下载并解压远程 miniapp
 */
async function downloadAndExtract(
  config: RemoteMiniappConfig,
  miniappsPath: string
): Promise<void> {
  const targetDir = join(miniappsPath, config.dirName)

  console.log(`[remote-miniapps] Syncing ${config.dirName}...`)

  // 1. 下载 metadata.json (获取最新版本信息)
  const metadataBuffer = await fetchWithEtag(config.metadataUrl)
  const metadata = JSON.parse(metadataBuffer.toString('utf-8')) as RemoteMetadata

  // 检查是否需要更新
  const localManifestPath = join(targetDir, 'manifest.json')
  if (existsSync(localManifestPath)) {
    const localManifest = JSON.parse(readFileSync(localManifestPath, 'utf-8')) as MiniappManifest
    if (localManifest.version === metadata.version) {
      console.log(`[remote-miniapps] ${config.dirName} is up-to-date (v${metadata.version})`)
      return
    }
  }

  // 2. 解析相对 URL
  const baseUrl = config.metadataUrl.replace(/\/[^/]+$/, '')
  const manifestUrl = metadata.manifestUrl.startsWith('.')
    ? `${baseUrl}/${metadata.manifestUrl.slice(2)}`
    : metadata.manifestUrl
  const zipUrl = metadata.zipUrl.startsWith('.')
    ? `${baseUrl}/${metadata.zipUrl.slice(2)}`
    : metadata.zipUrl

  // 3. 下载 manifest.json
  const manifestBuffer = await fetchWithEtag(manifestUrl)
  const manifest = JSON.parse(manifestBuffer.toString('utf-8')) as MiniappManifest

  // 4. 下载 zip
  const zipBuffer = await fetchWithEtag(zipUrl)

  // 5. 清理旧目录
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true })
  }
  mkdirSync(targetDir, { recursive: true })

  // 6. 解压 zip
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(zipBuffer)
  for (const [relativePath, file] of Object.entries(zip.files) as [
    string,
    JSZipType.JSZipObject,
  ][]) {
    if (file.dir) {
      mkdirSync(join(targetDir, relativePath), { recursive: true })
    } else {
      const content = await file.async('nodebuffer')
      const filePath = join(targetDir, relativePath)
      mkdirSync(join(targetDir, relativePath, '..'), { recursive: true })
      writeFileSync(filePath, content)
    }
  }

  // 7. 写入 manifest.json (确保包含 dirName)
  const manifestWithDir = { ...manifest, dirName: config.dirName }
  writeFileSync(localManifestPath, JSON.stringify(manifestWithDir, null, 2))

  console.log(`[remote-miniapps] ${config.dirName} updated to v${manifest.version}`)
}

/**
 * 启动简单的静态文件服务器
 */
async function startStaticServer(
  root: string
): Promise<{ server: ReturnType<typeof createServer>; port: number }> {
  const sirv = (await import('sirv')).default
  const handler = sirv(root, { dev: true, single: true })

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      handler(req, res, () => {
        res.writeHead(404)
        res.end('Not found')
      })
    })

    server.listen(0, () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        resolve({ server, port: address.port })
      } else {
        reject(new Error('Failed to get server address'))
      }
    })

    server.on('error', reject)
  })
}

// ==================== 共享状态 ====================

/** 全局注册的远程 miniapp 服务器 */
const globalRemoteServers: RemoteMiniappServer[] = []

/**
 * 获取远程 miniapps 的服务器信息 (供 ecosystem.json 生成使用)
 */
export function getRemoteMiniappServers(): RemoteMiniappServer[] {
  return [...globalRemoteServers]
}

/**
 * 获取远程 miniapps 用于 ecosystem.json 的数据
 */
export function getRemoteMiniappsForEcosystem(): Array<MiniappManifest & { url: string }> {
  return globalRemoteServers.map((s) => ({
    ...s.manifest,
    dirName: s.dirName,
    icon: new URL(s.manifest.icon, s.baseUrl).href,
    url: new URL('/', s.baseUrl).href,
    screenshots: s.manifest.screenshots?.map((sc) => new URL(sc, s.baseUrl).href) ?? [],
  }))
}

export default remoteMiniappsPlugin
