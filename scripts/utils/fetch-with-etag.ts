/**
 * 基于 ETag 的缓存下载工具
 *
 * 缓存路径: /tmp/fetch/{sha256(etag)}.bin
 * 临时路径: /tmp/fetch/{sha256(etag)}.bin.tmp (下载中)
 *
 * 特性:
 * - ETag 匹配时直接返回缓存
 * - 下载完成后原子重命名
 * - 支持断点续传场景的安全写入
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const CACHE_DIR = join(tmpdir(), 'fetch')

/**
 * 计算 SHA256 哈希
 */
function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * 确保缓存目录存在
 */
function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

/**
 * 获取缓存文件路径
 */
function getCachePath(etag: string): string {
  const hash = sha256(etag)
  return join(CACHE_DIR, `${hash}.bin`)
}

/**
 * 获取临时文件路径
 */
function getTempPath(etag: string): string {
  const hash = sha256(etag)
  return join(CACHE_DIR, `${hash}.bin.tmp`)
}

/**
 * 基于 ETag 的缓存下载
 *
 * @param url 要下载的 URL
 * @returns 文件内容的 Buffer
 *
 * 流程:
 * 1. HEAD 请求获取 ETag
 * 2. 计算 hash = sha256(etag)
 * 3. 检查 /tmp/fetch/{hash}.bin 是否存在
 *    - 存在 → 直接返回缓存内容
 *    - 不存在 → 下载到 .tmp，完成后重命名为 .bin
 */
export async function fetchWithEtag(url: string): Promise<Buffer> {
  ensureCacheDir()

  // 1. HEAD 请求获取 ETag
  const headResponse = await fetch(url, { method: 'HEAD' })
  if (!headResponse.ok) {
    throw new Error(`HEAD request failed: ${headResponse.status} ${headResponse.statusText}`)
  }

  const etag = headResponse.headers.get('etag') || headResponse.headers.get('last-modified') || url
  const cachePath = getCachePath(etag)
  const tempPath = getTempPath(etag)

  // 2. 检查缓存
  if (existsSync(cachePath)) {
    console.log(`[fetchWithEtag] Cache hit: ${url}`)
    return readFileSync(cachePath)
  }

  // 3. 下载文件
  console.log(`[fetchWithEtag] Downloading: ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 4. 写入临时文件
  try {
    // 清理可能存在的旧临时文件
    if (existsSync(tempPath)) {
      unlinkSync(tempPath)
    }
    writeFileSync(tempPath, buffer)

    // 5. 原子重命名
    renameSync(tempPath, cachePath)
    console.log(`[fetchWithEtag] Cached: ${cachePath}`)
  } catch (error) {
    // 清理临时文件
    if (existsSync(tempPath)) {
      try {
        unlinkSync(tempPath)
      } catch {
        // ignore cleanup errors
      }
    }
    throw error
  }

  return buffer
}

/**
 * 清理指定 URL 的缓存
 */
export async function clearCache(url: string): Promise<void> {
  const headResponse = await fetch(url, { method: 'HEAD' })
  if (!headResponse.ok) return

  const etag = headResponse.headers.get('etag') || headResponse.headers.get('last-modified') || url
  const cachePath = getCachePath(etag)

  if (existsSync(cachePath)) {
    unlinkSync(cachePath)
    console.log(`[fetchWithEtag] Cleared cache: ${cachePath}`)
  }
}

/**
 * 清理所有缓存
 */
export function clearAllCache(): void {
  if (existsSync(CACHE_DIR)) {
    const { readdirSync, rmSync } = require('node:fs')
    const files = readdirSync(CACHE_DIR)
    for (const file of files) {
      rmSync(join(CACHE_DIR, file))
    }
    console.log(`[fetchWithEtag] Cleared all cache (${files.length} files)`)
  }
}

export default fetchWithEtag
