/**
 * Effect 原生数据源
 * 
 * 使用 SubscriptionRef + Stream 实现响应式数据流
 * - createPollingSource: 定时轮询 + 事件触发
 * - createDependentSource: 依赖变化触发
 * - createEventBus: 外部事件总线
 * 
 * @see https://context7.com/effect-ts/effect/llms.txt - Effect Stream 创建和转换
 */

import { Effect, Stream, Schedule, SubscriptionRef, Duration, PubSub, Fiber } from "effect"
import type { FetchError } from "./http"
import type { EventBusService, WalletEventType } from "./event-bus"

// ==================== Event Bus ====================

export interface EventBus {
  /** 发送事件 */
  emit: (event: string) => Effect.Effect<boolean>
  /** 事件流 */
  stream: Stream.Stream<string>
  /** 关闭 */
  shutdown: Effect.Effect<void>
}

/**
 * 创建事件总线
 * 
 * @example
 * ```ts
 * const eventBus = yield* createEventBus()
 * yield* eventBus.emit('tx:confirmed')
 * ```
 */
export const createEventBus = (): Effect.Effect<EventBus> =>
  Effect.gen(function* () {
    const pubsub = yield* PubSub.unbounded<string>()
    
    return {
      emit: (event: string) => PubSub.publish(pubsub, event),
      stream: Stream.fromPubSub(pubsub),
      shutdown: PubSub.shutdown(pubsub),
    }
  })

// ==================== Polling Source ====================

export interface PollingSourceOptions<T, E = FetchError> {
  /** 数据源名称（用于调试） */
  name: string
  /** 获取数据的 Effect */
  fetch: Effect.Effect<T, E>
  /** 轮询间隔（基于完成时间） */
  interval: Duration.DurationInput
  /** 外部事件触发流（可选，简单字符串事件） */
  events?: Stream.Stream<string>
  /** 钱包事件配置（可选，用于跨 source 通信） */
  walletEvents?: {
    /** EventBus 服务实例 */
    eventBus: EventBusService
    /** 链 ID */
    chainId: string
    /** 钱包地址 */
    address: string
    /** 监听的事件类型 */
    types: WalletEventType[]
  }
  /** 立即执行第一次（默认 true） */
  immediate?: boolean
}

export interface DataSource<T> {
  /** 当前值（可订阅变化） */
  ref: SubscriptionRef.SubscriptionRef<T | null>
  /** 驱动 Fiber */
  fiber: Fiber.RuntimeFiber<void, FetchError>
  /** 获取当前值 */
  get: Effect.Effect<T | null>
  /** 订阅变化流 */
  changes: Stream.Stream<T>
  /** 强制刷新 */
  refresh: Effect.Effect<T, FetchError>
  /** 停止 */
  stop: Effect.Effect<void>
}

/**
 * 创建轮询数据源
 * 
 * - 使用 Schedule.spaced 实现基于完成时间的间隔轮询
 * - 支持外部事件触发
 * - 使用 Stream.changes 自动去重
 * 
 * @example
 * ```ts
 * const txHistory = yield* createPollingSource({
 *   name: 'txHistory',
 *   fetch: fetchTransactions(),
 *   interval: Duration.minutes(4),
 *   events: eventBus.stream.pipe(Stream.filter(e => e === 'tx:confirmed')),
 * })
 * ```
 */
export const createPollingSource = <T>(
  options: PollingSourceOptions<T>
): Effect.Effect<DataSource<T>, never, never> =>
  Effect.gen(function* () {
    const { fetch, interval, events, walletEvents, immediate = true } = options
    
    const ref = yield* SubscriptionRef.make<T | null>(null)
    
    // 轮询流：Schedule.spaced 自动基于完成时间计算下次
    const pollingStream = Stream.repeatEffect(fetch).pipe(
      Stream.schedule(Schedule.spaced(interval))
    )
    
    // 立即执行第一次
    const immediateStream = immediate
      ? Stream.fromEffect(fetch)
      : Stream.empty
    
    // 简单字符串事件触发流
    const simpleEventStream = events
      ? events.pipe(Stream.mapEffect(() => fetch))
      : Stream.empty
    
    // 钱包事件触发流（按 chainId + address 过滤）
    const walletEventStream = walletEvents
      ? walletEvents.eventBus
          .forWalletEvents(walletEvents.chainId, walletEvents.address, walletEvents.types)
          .pipe(Stream.mapEffect(() => fetch))
      : Stream.empty
    
    // 合并所有触发源
    const combinedStream = Stream.merge(
      Stream.merge(
        Stream.concat(immediateStream, pollingStream),
        simpleEventStream
      ),
      walletEventStream
    )
    
    // 使用 Stream.changes 去重（只有值变化才继续）
    const driver = combinedStream.pipe(
      Stream.changes
    )
    
    // 驱动 ref 更新
    const fiber = yield* driver.pipe(
      Stream.runForEach((value) => SubscriptionRef.set(ref, value)),
      Effect.fork
    )
    
    return {
      ref,
      fiber,
      get: SubscriptionRef.get(ref),
      changes: ref.changes.pipe(
        Stream.filter((v): v is T => v !== null)
      ),
      refresh: Effect.gen(function* () {
        const value = yield* fetch
        yield* SubscriptionRef.set(ref, value)
        return value
      }),
      stop: Fiber.interrupt(fiber).pipe(Effect.asVoid),
    }
  })

// ==================== Dependent Source ====================

export interface DependentSourceOptions<TDep, T, E = FetchError> {
  /** 数据源名称 */
  name: string
  /** 依赖的数据源 */
  dependsOn: SubscriptionRef.SubscriptionRef<TDep | null>
  /** 判断依赖是否真的变化了 */
  hasChanged: (prev: TDep | null, next: TDep) => boolean
  /** 根据依赖值获取数据 */
  fetch: (dep: TDep) => Effect.Effect<T, E>
}

/**
 * 创建依赖数据源
 * 
 * - 监听依赖变化，只有 hasChanged 返回 true 时才触发请求
 * - 依赖不变则永远命中缓存
 * 
 * @example
 * ```ts
 * const balance = yield* createDependentSource({
 *   name: 'balance',
 *   dependsOn: txHistory.ref,
 *   hasChanged: (prev, next) => 
 *     prev?.length !== next.length || prev?.[0]?.hash !== next[0]?.hash,
 *   fetch: (txList) => fetchBalance(txList[0]?.from),
 * })
 * ```
 */
export const createDependentSource = <TDep, T>(
  options: DependentSourceOptions<TDep, T>
): Effect.Effect<DataSource<T>, never, never> =>
  Effect.gen(function* () {
    const { dependsOn, hasChanged, fetch } = options
    
    const ref = yield* SubscriptionRef.make<T | null>(null)
    let prevDep: TDep | null = null
    
    // 监听依赖变化
    const driver = dependsOn.changes.pipe(
      // 过滤掉 null
      Stream.filter((value): value is TDep => value !== null),
      // 检查是否真的变化了
      Stream.filter((next) => {
        const changed = hasChanged(prevDep, next)
        if (changed) {
          prevDep = next
        }
        return changed
      }),
      // 获取数据
      Stream.mapEffect((dep) => fetch(dep))
    )
    
    // 驱动 ref 更新
    const fiber = yield* driver.pipe(
      Stream.runForEach((value) => SubscriptionRef.set(ref, value)),
      Effect.fork
    )
    
    return {
      ref,
      fiber,
      get: SubscriptionRef.get(ref),
      changes: ref.changes.pipe(
        Stream.filter((v): v is T => v !== null)
      ),
      refresh: Effect.gen(function* () {
        const dep = yield* SubscriptionRef.get(dependsOn)
        if (dep === null) {
          return yield* Effect.fail(new Error("Dependency not available") as unknown as FetchError)
        }
        const value = yield* fetch(dep)
        yield* SubscriptionRef.set(ref, value)
        return value
      }),
      stop: Fiber.interrupt(fiber).pipe(Effect.asVoid),
    }
  })

// ==================== Hybrid Source ====================

export interface HybridSourceOptions<TDep, T, E = FetchError> {
  /** 数据源名称 */
  name: string
  /** 依赖的数据源（变化时触发） */
  dependsOn?: {
    source: SubscriptionRef.SubscriptionRef<TDep | null>
    hasChanged: (prev: TDep | null, next: TDep) => boolean
  }
  /** 兜底轮询间隔（可选） */
  interval?: Duration.DurationInput
  /** 外部事件触发（可选） */
  events?: Stream.Stream<string>
  /** 获取数据 */
  fetch: Effect.Effect<T, E>
}

/**
 * 创建混合数据源
 * 
 * 支持多种触发策略的组合：
 * - 依赖变化触发
 * - 定时轮询（兜底）
 * - 外部事件触发
 * 
 * 任何触发都会重置定时器
 */
export const createHybridSource = <TDep, T>(
  options: HybridSourceOptions<TDep, T>
): Effect.Effect<DataSource<T>, never, never> =>
  Effect.gen(function* () {
    const { dependsOn, interval, events, fetch } = options
    
    const ref = yield* SubscriptionRef.make<T | null>(null)
    let prevDep: TDep | null = null
    
    // 依赖触发流
    const depStream = dependsOn
      ? dependsOn.source.changes.pipe(
          Stream.filter((v): v is TDep => v !== null),
          Stream.filter((next) => {
            const changed = dependsOn.hasChanged(prevDep, next)
            if (changed) prevDep = next
            return changed
          }),
          Stream.mapEffect(() => fetch)
        )
      : Stream.empty
    
    // 轮询流
    const pollingStream = interval
      ? Stream.repeatEffect(fetch).pipe(
          Stream.schedule(Schedule.spaced(interval))
        )
      : Stream.empty
    
    // 事件触发流
    const eventStream = events
      ? events.pipe(Stream.mapEffect(() => fetch))
      : Stream.empty
    
    // 立即执行
    const immediateStream = Stream.fromEffect(fetch)
    
    // 合并所有流 + 去重
    const driver = Stream.merge(
      Stream.merge(
        Stream.merge(immediateStream, depStream),
        pollingStream
      ),
      eventStream
    ).pipe(
      Stream.changes
    )
    
    const fiber = yield* driver.pipe(
      Stream.runForEach((value) => SubscriptionRef.set(ref, value)),
      Effect.fork
    )
    
    return {
      ref,
      fiber,
      get: SubscriptionRef.get(ref),
      changes: ref.changes.pipe(
        Stream.filter((v): v is T => v !== null)
      ),
      refresh: Effect.gen(function* () {
        const value = yield* fetch
        yield* SubscriptionRef.set(ref, value)
        return value
      }),
      stop: Fiber.interrupt(fiber).pipe(Effect.asVoid),
    }
  })
