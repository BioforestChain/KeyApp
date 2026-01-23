/**
 * Stream utilities for chain data
 * 
 * 提供轮询、依赖触发等常用 Stream 模式
 * 
 * 注意：去重功能推荐使用原生 Stream.changes
 */

import { Stream, Effect, Schedule, Duration } from "effect"
import { httpFetch, type FetchOptions, type FetchError } from "./http"

// ==================== Polling Stream ====================

export interface PollingOptions<T> {
  /** HTTP 请求配置 */
  fetch: FetchOptions<T>
  /** 轮询间隔（毫秒）*/
  interval: number
  /** 是否立即执行第一次（默认 true）*/
  immediate?: boolean
}

/**
 * 创建轮询 Stream
 * 
 * @example
 * ```ts
 * const blockHeight$ = polling({
 *   fetch: { url: '/blocks/tip/height', schema: BlockHeightSchema },
 *   interval: 30000,
 * })
 * ```
 */
export function polling<T>(options: PollingOptions<T>): Stream.Stream<T, FetchError> {
  const { fetch: fetchOptions, interval, immediate = true } = options

  const fetchEffect = httpFetch(fetchOptions)

  const scheduledStream = Stream.repeatEffect(fetchEffect).pipe(
    Stream.schedule(Schedule.spaced(Duration.millis(interval)))
  )

  if (immediate) {
    return Stream.concat(Stream.fromEffect(fetchEffect), scheduledStream)
  }
  
  return scheduledStream
}

// ==================== Triggered Stream ====================

export interface TriggeredOptions<TTrigger, TOutput> {
  /** 触发源 Stream */
  trigger: Stream.Stream<TTrigger, FetchError>
  /** 触发时执行的请求 */
  fetch: FetchOptions<TOutput> | ((triggerValue: TTrigger) => FetchOptions<TOutput>)
}

/**
 * 创建触发式 Stream（类似 switchMap）
 * 
 * @example
 * ```ts
 * const balance$ = triggered({
 *   trigger: blockHeight$,
 *   fetch: (blockHeight) => ({
 *     url: '/balance/:address',
 *     pathParams: { address },
 *   }),
 * })
 * ```
 */
export function triggered<TTrigger, TOutput>(
  options: TriggeredOptions<TTrigger, TOutput>
): Stream.Stream<TOutput, FetchError> {
  const { trigger, fetch: fetchConfig } = options

  return trigger.pipe(
    Stream.mapEffect((triggerValue) => {
      const fetchOptions = typeof fetchConfig === "function"
        ? fetchConfig(triggerValue)
        : fetchConfig
      return httpFetch(fetchOptions)
    })
  )
}

// ==================== Transform Utilities ====================

/**
 * 对 Stream 应用转换函数
 */
export function transform<TInput, TOutput, E>(
  stream: Stream.Stream<TInput, E>,
  fn: (input: TInput) => TOutput | Promise<TOutput>
): Stream.Stream<TOutput, E> {
  return stream.pipe(
    Stream.mapEffect((input) =>
      Effect.tryPromise({
        try: async () => fn(input),
        catch: (e) => e as E,
      })
    )
  )
}

/**
 * 对 Stream 应用同步转换函数
 */
export function map<TInput, TOutput, E>(
  stream: Stream.Stream<TInput, E>,
  fn: (input: TInput) => TOutput
): Stream.Stream<TOutput, E> {
  return Stream.map(stream, fn)
}

/**
 * 过滤 Stream
 */
export function filter<T, E>(
  stream: Stream.Stream<T, E>,
  predicate: (value: T) => boolean
): Stream.Stream<T, E> {
  return Stream.filter(stream, predicate)
}

// ==================== Re-export Effect Stream utilities ====================

/**
 * 去重：使用原生 Stream.changes
 * 
 * @example
 * ```ts
 * const deduped$ = myStream.pipe(Stream.changes)
 * ```
 */
export const changes = Stream.changes
