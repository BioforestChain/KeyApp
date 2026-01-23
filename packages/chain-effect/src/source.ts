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
    const { name, fetch, interval, events, walletEvents, immediate = true } = options
    
    const ref = yield* SubscriptionRef.make<T | null>(null)
    
    // 轮询流：Schedule.spaced 自动基于完成时间计算下次
    const pollingStream = Stream.repeatEffect(fetch).pipe(
      Stream.schedule(Schedule.spaced(interval))
    )
    
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
    
    // 合并所有触发源（不包括 immediate，因为我们会同步执行）
    const ongoingStream = Stream.merge(
      Stream.merge(pollingStream, simpleEventStream),
      walletEventStream
    )
    
    // 使用 Stream.changes 去重（只有值变化才继续）
    const driver = ongoingStream.pipe(Stream.changes)
    
    // 驱动 ref 更新
    const fiber = yield* driver.pipe(
      Stream.runForEach((value) => SubscriptionRef.set(ref, value)),
      Effect.forkDaemon
    )
    
    // 立即执行第一次并等待完成（同步）
    if (immediate) {
      const initialValue = yield* Effect.catchAll(fetch, () => Effect.succeed(null as T | null))
      if (initialValue !== null) {
        yield* SubscriptionRef.set(ref, initialValue)
      }
    }
    
    return {
      ref,
      fiber,
      get: SubscriptionRef.get(ref),
      // 先发射当前值，再发射后续变化（SubscriptionRef.changes 只发射未来变化）
      changes: Stream.concat(
        Stream.fromEffect(SubscriptionRef.get(ref)),
        ref.changes
      ).pipe(
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
  /** 数据源名称（用于调试） */
  name: string
  /** 依赖的数据源 */
  dependsOn: SubscriptionRef.SubscriptionRef<TDep | null>
  /** 判断依赖是否真的变化了 */
  hasChanged: (prev: TDep | null, next: TDep) => boolean
  /** 
   * 根据依赖值获取数据
   * @param dep 依赖的当前值
   * @param forceRefresh 是否强制刷新（true=依赖变化触发应使用network-first，false=首次加载可使用cache-first）
   */
  fetch: (dep: TDep, forceRefresh?: boolean) => Effect.Effect<T, E>
}

/**
 * 创建依赖数据源
 * 
 * - 监听依赖变化，只有 hasChanged 返回 true 时才触发请求
 * - 依赖不变则永远命中缓存
 * 
 * ## 重要：竞态条件避免
 * 
 * 官方文档说明：SubscriptionRef.changes 会在订阅时发射当前值。
 * 但 Effect.fork 会导致 fiber 调度延迟，造成以下竞态：
 * 
 * 1. Effect.fork(driver) 创建 fiber，但 fiber 还没开始执行
 * 2. Initial fetch 先执行，设置 prevDep = currentValue
 * 3. Fiber 开始后，changes 发射 currentValue
 * 4. hasChanged(currentValue, currentValue) → false（错误地跳过更新）
 * 
 * 解决方案：使用 Stream.scanEffect 将状态追踪内化到 Stream 中，
 * 不依赖外部 mutable 变量（let prevDep），避免竞态条件。
 * 
 * @see https://effect.website/docs/state-management/subscriptionref
 * @see https://github.com/pauljphilp/effectpatterns - Race Condition with Plain Variables
 * 
 * @example
 * ```ts
 * const balance = yield* createDependentSource({
 *   name: 'balance',
 *   dependsOn: txHistory.ref,
 *   hasChanged: (prev, next) => 
 *     prev?.length !== next.length || prev?.[0]?.hash !== next[0]?.hash,
 *   fetch: (txList, _forceRefresh) => fetchBalance(txList[0]?.from),
 * })
 * ```
 */
export const createDependentSource = <TDep, T>(
  options: DependentSourceOptions<TDep, T>
): Effect.Effect<DataSource<T>, never, never> =>
  Effect.gen(function* () {
    const { name, dependsOn, hasChanged, fetch } = options
    
    const ref = yield* SubscriptionRef.make<T | null>(null)
    
    const currentDep = yield* SubscriptionRef.get(dependsOn)

    // 使用 Stream.scanEffect 内化状态追踪
    // 关键：不使用外部 mutable 变量（let prevDep），避免与 Effect.fork 的竞态
    // 
    // ## 重要：Effect.fork 调度延迟问题
    // 官方文档说明：Effect.fork 后 fiber 不会立即执行，需要等待调度。
    // 但 SubscriptionRef.changes 只有在 stream 真正运行时才发射当前值。
    // 所以我们需要：
    // 1. 保留 initial fetch 确保首次数据加载
    // 2. 用 scanEffect 内化状态追踪，让 stream 独立管理 prev 状态
    // 3. initial fetch 不影响 stream 的状态（stream 从 null 开始）
    const driver = dependsOn.changes.pipe(
      Stream.filter((value): value is TDep => value !== null),
      Stream.scanEffect(
        { prev: currentDep as TDep | null },
        (acc, next) =>
          Effect.gen(function* () {
            const changed = hasChanged(acc.prev, next)
            
            if (changed) {
              // acc.prev !== null 说明是依赖变化触发，需要强制刷新（network-first）
              // acc.prev === null 说明是首次，可以用缓存（cache-first）
              const forceRefresh = acc.prev !== null
              const result = yield* Effect.catchAll(fetch(next, forceRefresh), (error) => {
                console.error(`[DependentSource] ${name} fetch error:`, error)
                return Effect.succeed(null as T | null)
              })
              if (result !== null) {
                yield* SubscriptionRef.set(ref, result)
              }
            }
            
            // 总是更新 prev，确保状态追踪正确
            return { prev: next }
          })
      ),
      Stream.runDrain
    )
    
    // Fork driver - 状态在 stream 内部，不受 initial fetch 影响
    const fiber = yield* Effect.forkDaemon(driver)
    
    // Initial fetch：确保首次数据加载（forceRefresh=false，可使用缓存）
    // Stream 的 scanEffect 会从当前依赖值开始追踪，避免首个 changes 触发重复拉取
    if (currentDep !== null) {
      const initialValue = yield* Effect.catchAll(fetch(currentDep, false), (error) => {
        console.error(`[DependentSource] Initial fetch error for ${name}:`, error)
        return Effect.succeed(null as T | null)
      })
      if (initialValue !== null) {
        yield* SubscriptionRef.set(ref, initialValue)
      }
    }
    
    return {
      ref,
      fiber,
      get: SubscriptionRef.get(ref),
      // 先发射当前值，再发射后续变化
      changes: Stream.concat(
        Stream.fromEffect(SubscriptionRef.get(ref)),
        ref.changes
      ).pipe(
        Stream.filter((v): v is T => v !== null)
      ),
      refresh: Effect.gen(function* () {
        const dep = yield* SubscriptionRef.get(dependsOn)
        if (dep === null) {
          return yield* Effect.fail(new Error("Dependency not available") as unknown as FetchError)
        }
        // refresh 是用户主动触发，应该强制刷新
        const value = yield* fetch(dep, true)
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
      // 先发射当前值，再发射后续变化
      changes: Stream.concat(
        Stream.fromEffect(SubscriptionRef.get(ref)),
        ref.changes
      ).pipe(
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
