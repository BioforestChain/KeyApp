/**
 * 全局 Source 注册表
 * 
 * 实现按 chainId:address 的全局单例 + 引用计数管理
 * - 首次订阅时创建 source 并启动轮询
 * - 引用计数归零时立即停止轮询并清理
 * - 支持恢复轮询计划（从 IndexedDB 读取 nextPollTime）
 */

import { Effect, Fiber, Duration, SubscriptionRef, Stream, Schedule } from "effect"
import type { FetchError } from "./http"
import type { DataSource } from "./source"
import { updateNextPollTime, getDelayUntilNextPoll } from "./poll-meta"

// ==================== 类型定义 ====================

export interface SourceEntry<T> {
  source: DataSource<T>
  refCount: number
  pollFiber: Fiber.RuntimeFiber<void, never> | null
}

export interface AcquireSourceOptions<T> {
  /** 获取数据的 Effect（建议使用 httpFetchCached 以自动缓存） */
  fetch: Effect.Effect<T, FetchError>
  /** 轮询间隔 */
  interval: Duration.DurationInput
}

// ==================== 全局注册表 ====================

const registry = new Map<string, SourceEntry<unknown>>()
// 用于防止并发创建的 Promise 锁
const pendingCreations = new Map<string, Promise<DataSource<unknown>>>()

/**
 * 生成注册表 key
 */
export function makeRegistryKey(
  chainId: string,
  address: string,
  sourceType: string
): string {
  return `${chainId}:${address.toLowerCase()}:${sourceType}`
}

/**
 * 获取或创建共享的 DataSource
 * 
 * - 首次调用：创建 source，启动轮询 fiber，refCount = 1
 * - 后续调用：返回已有 source，refCount++
 * - 使用 Promise 锁防止并发创建
 */
export function acquireSource<T>(
  key: string,
  options: AcquireSourceOptions<T>
): Effect.Effect<DataSource<T>> {
  return Effect.promise(async () => {
    // 1. 检查是否已存在
    const existing = registry.get(key) as SourceEntry<T> | undefined
    if (existing) {
      existing.refCount++
      console.log(`[SourceRegistry] acquireSource existing: ${key}, refCount: ${existing.refCount}`)
      return existing.source
    }
    
    // 2. 检查是否有正在创建的 Promise（防止并发）
    const pending = pendingCreations.get(key)
    if (pending) {
      console.log(`[SourceRegistry] acquireSource waiting for pending: ${key}`)
      const source = await pending as DataSource<T>
      // 增加引用计数
      const entry = registry.get(key) as SourceEntry<T>
      if (entry) {
        entry.refCount++
        console.log(`[SourceRegistry] acquireSource after wait: ${key}, refCount: ${entry.refCount}`)
      }
      return source
    }
    
    console.log(`[SourceRegistry] acquireSource NEW: ${key}`)
    
    // 3. 创建 Promise 锁
    const createPromise = createSourceInternal<T>(key, options)
    pendingCreations.set(key, createPromise as Promise<DataSource<unknown>>)
    
    try {
      const source = await createPromise
      return source
    } finally {
      pendingCreations.delete(key)
    }
  })
}

/**
 * 内部创建函数
 */
async function createSourceInternal<T>(
  key: string,
  options: AcquireSourceOptions<T>
): Promise<DataSource<T>> {
  return Effect.runPromise(Effect.gen(function* () {
    // 创建新的 SubscriptionRef
    const ref = yield* SubscriptionRef.make<T | null>(null)
    
    // 创建轮询 fiber（延迟启动，基于持久化的 nextPollTime）
    const intervalMs = Duration.toMillis(Duration.decode(options.interval))
    const pollKey = key
    
    const pollEffect = Effect.gen(function* () {
      // 计算初始延迟（基于持久化的 nextPollTime）
      const delay = yield* getDelayUntilNextPoll(pollKey)
      if (delay > 0) {
        yield* Effect.sleep(Duration.millis(delay))
      }
      
      // 开始轮询循环
      yield* Stream.repeatEffect(
        Effect.gen(function* () {
          const result = yield* Effect.catchAll(options.fetch, (error) => {
            console.error(`[SourceRegistry] Poll error for ${pollKey}:`, error)
            return Effect.succeed(null as T | null)
          })
          
          if (result !== null) {
            yield* SubscriptionRef.set(ref, result)
            yield* updateNextPollTime(pollKey, intervalMs)
          }
          
          return result
        })
      ).pipe(
        Stream.schedule(Schedule.spaced(options.interval)),
        Stream.runDrain
      )
    })
    
    const pollFiber = yield* Effect.fork(pollEffect)
    
    // 执行立即获取
    const immediateResult = yield* Effect.catchAll(options.fetch, (error) => {
      console.error(`[SourceRegistry] Immediate fetch error for ${key}:`, error)
      return Effect.succeed(null as T | null)
    })
    if (immediateResult !== null) {
      yield* SubscriptionRef.set(ref, immediateResult)
      yield* updateNextPollTime(pollKey, intervalMs)
    }
    
    // 构建 DataSource
    const source: DataSource<T> = {
      ref,
      fiber: pollFiber as Fiber.RuntimeFiber<void, FetchError>,
      get: SubscriptionRef.get(ref),
      changes: Stream.concat(
        Stream.fromEffect(SubscriptionRef.get(ref)),
        ref.changes
      ).pipe(
        Stream.filter((v): v is T => v !== null)
      ),
      refresh: Effect.gen(function* () {
        const value = yield* options.fetch
        yield* SubscriptionRef.set(ref, value)
        yield* updateNextPollTime(pollKey, intervalMs)
        return value
      }),
      stop: Fiber.interrupt(pollFiber).pipe(Effect.asVoid),
    }
    
    // 注册到全局表
    const entry: SourceEntry<T> = {
      source,
      refCount: 1,
      pollFiber,
    }
    registry.set(key, entry as SourceEntry<unknown>)
    
    return source
  }))
}

/**
 * 释放 DataSource 引用
 * 
 * - refCount--
 * - refCount 归零时：停止轮询 fiber，从注册表删除
 */
export function releaseSource(key: string): Effect.Effect<void> {
  return Effect.gen(function* () {
    const entry = registry.get(key)
    if (!entry) return
    
    entry.refCount--
    
    if (entry.refCount <= 0) {
      // 停止轮询
      if (entry.pollFiber) {
        yield* Fiber.interrupt(entry.pollFiber)
      }
      // 从注册表删除
      registry.delete(key)
    }
  })
}

/**
 * 获取当前注册表状态（用于调试）
 */
export function getRegistryStatus(): Map<string, { refCount: number }> {
  const status = new Map<string, { refCount: number }>()
  for (const [key, entry] of registry) {
    status.set(key, { refCount: entry.refCount })
  }
  return status
}

/**
 * 清空所有注册的 source（用于测试/清理）
 */
export function clearRegistry(): Effect.Effect<void> {
  return Effect.gen(function* () {
    for (const [key, entry] of registry) {
      if (entry.pollFiber) {
        yield* Fiber.interrupt(entry.pollFiber)
      }
    }
    registry.clear()
  })
}
