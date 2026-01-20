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
 * - 支持超时和重试机制
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const CACHE_DIR = join(tmpdir(), 'fetch')

const DEFAULT_TIMEOUT = 30000
const DEFAULT_RETRIES = 3
const RETRY_DELAY = 2000

export interface FetchWithEtagOptions {
  timeout?: number
  retries?: number
}

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { ...fetchOptions, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId))
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
export async function fetchWithEtag(url: string, options: FetchWithEtagOptions = {}): Promise<Buffer> {
  const { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = options
  ensureCacheDir()

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const headResponse = await fetchWithTimeout(url, { method: 'HEAD', timeout })
      if (!headResponse.ok) {
        throw new Error(`HEAD request failed: ${headResponse.status} ${headResponse.statusText}`)
      }

      const etag = headResponse.headers.get('etag') || headResponse.headers.get('last-modified') || url
      const cachePath = getCachePath(etag)
      const tempPath = getTempPath(etag)

      if (existsSync(cachePath)) {
        console.log(`[fetchWithEtag] Cache hit: ${url}`)
        return readFileSync(cachePath)
      }

      console.log(`[fetchWithEtag] Downloading (attempt ${attempt}/${retries}): ${url}`)
      const response = await fetchWithTimeout(url, { timeout })
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      try {
        if (existsSync(tempPath)) {
          unlinkSync(tempPath)
        }
        writeFileSync(tempPath, buffer)
        renameSync(tempPath, cachePath)
        console.log(`[fetchWithEtag] Cached: ${cachePath}`)
      } catch (error) {
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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const isAbortError = lastError.name === 'AbortError' || lastError.message.includes('aborted')
      const errorType = isAbortError ? 'timeout' : 'network error'

      console.error(`[fetchWithEtag] Attempt ${attempt}/${retries} failed (${errorType}): ${url}`)
      console.error(`[fetchWithEtag] Error: ${lastError.message}`)

      if (attempt < retries) {
        console.log(`[fetchWithEtag] Retrying in ${RETRY_DELAY}ms...`)
        await sleep(RETRY_DELAY)
      }
    }
  }

  throw new Error(`[fetchWithEtag] All ${retries} attempts failed for ${url}: ${lastError?.message}`)
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
