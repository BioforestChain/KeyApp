/**
 * 轮询元数据管理
 * 
 * 使用 IndexedDB 持久化轮询时间，确保重建 source 后能恢复轮询计划
 */

import { Effect } from "effect"

// ==================== 类型定义 ====================

export interface PollMeta {
  /** 缓存 key: chainId:address:sourceType */
  key: string
  /** 下次轮询时间戳 */
  nextPollTime: number
  /** 上次成功时间戳 */
  lastSuccessTime: number
  /** 轮询间隔（毫秒） */
  interval: number
}

// ==================== IndexedDB 配置 ====================

const DB_NAME = "chain-effect-poll-meta"
const DB_VERSION = 1
const STORE_NAME = "poll-meta"

let dbPromise: Promise<IDBDatabase> | null = null

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.addEventListener("error", () => reject(request.error))
    request.addEventListener("success", () => resolve(request.result))
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" })
      }
    }
  })
  
  return dbPromise
}

// ==================== Effect 包装的 API ====================

/**
 * 获取轮询元数据
 */
export const getPollMeta = (key: string): Effect.Effect<PollMeta | null> =>
  Effect.tryPromise({
    try: async () => {
      const db = await getDB()
      return new Promise<PollMeta | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly")
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(key)
        
        request.addEventListener("error", () => reject(request.error))
        request.addEventListener("success", () => resolve(request.result ?? null))
      })
    },
    catch: (error) => new Error(`Failed to get poll meta: ${error}`),
  }).pipe(
    Effect.catchAll(() => Effect.succeed(null))
  )

/**
 * 设置轮询元数据
 */
export const setPollMeta = (meta: PollMeta): Effect.Effect<void> =>
  Effect.tryPromise({
    try: async () => {
      const db = await getDB()
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite")
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(meta)
        
        request.addEventListener("error", () => reject(request.error))
        request.addEventListener("success", () => resolve())
      })
    },
    catch: (error) => new Error(`Failed to set poll meta: ${error}`),
  }).pipe(
    Effect.catchAll(() => Effect.void)
  )

/**
 * 删除轮询元数据
 */
export const deletePollMeta = (key: string): Effect.Effect<void> =>
  Effect.tryPromise({
    try: async () => {
      const db = await getDB()
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite")
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(key)
        
        request.addEventListener("error", () => reject(request.error))
        request.addEventListener("success", () => resolve())
      })
    },
    catch: (error) => new Error(`Failed to delete poll meta: ${error}`),
  }).pipe(
    Effect.catchAll(() => Effect.void)
  )

/**
 * 更新下次轮询时间（成功请求后调用）
 */
export const updateNextPollTime = (
  key: string,
  interval: number
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const now = Date.now()
    const meta: PollMeta = {
      key,
      nextPollTime: now + interval,
      lastSuccessTime: now,
      interval,
    }
    yield* setPollMeta(meta)
  })

/**
 * 计算距离下次轮询的延迟时间
 * 
 * - 如果有持久化的 nextPollTime 且未过期，返回剩余延迟
 * - 否则返回 0（立即执行）
 */
export const getDelayUntilNextPoll = (
  key: string,
  currentInterval?: number
): Effect.Effect<number> =>
  Effect.gen(function* () {
    const meta = yield* getPollMeta(key)
    if (!meta) return 0
    
    const now = Date.now()
    const delay = meta.nextPollTime - now
    // 若持久化的 nextPollTime 异常偏大（例如时钟漂移），直接触发轮询
    const interval = currentInterval ?? meta.interval
    if (delay > interval) return 0
    return Math.max(0, delay)
  })

/**
 * 生成轮询 key
 */
export function makePollKey(
  chainId: string,
  address: string,
  sourceType: string
): string {
  return `${chainId}:${address.toLowerCase()}:${sourceType}`
}
