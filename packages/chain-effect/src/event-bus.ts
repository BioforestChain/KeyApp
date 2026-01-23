/**
 * EventBus Service - 钱包事件总线
 *
 * 用于跨数据源通信，支持按钱包（chainId + address）过滤事件
 */

import { Effect, PubSub, Stream } from "effect"

// ==================== Event Types ====================

export type WalletEventType = "tx:confirmed" | "tx:sent" | "tx:failed" | "balance:changed"

export interface WalletEvent {
  /** 事件类型 */
  type: WalletEventType
  /** 链 ID */
  chainId: string
  /** 钱包地址 */
  address: string
  /** 交易哈希（可选） */
  txHash?: string
  /** 时间戳 */
  timestamp: number
}

// ==================== EventBus Service ====================

export interface EventBusService {
  /** 发送事件 */
  readonly emit: (event: WalletEvent) => Effect.Effect<boolean>
  /** 全局事件流 */
  readonly stream: Stream.Stream<WalletEvent>
  /** 过滤特定钱包的事件流 */
  readonly forWallet: (chainId: string, address: string) => Stream.Stream<WalletEvent>
  /** 过滤特定钱包 + 事件类型的事件流 */
  readonly forWalletEvents: (
    chainId: string,
    address: string,
    types: WalletEventType[]
  ) => Stream.Stream<WalletEvent>
  /** 关闭 */
  readonly shutdown: Effect.Effect<void>
}

/**
 * 创建 EventBus 服务实例
 *
 * @example
 * ```ts
 * const eventBus = yield* createEventBusService
 *
 * // 发送事件
 * yield* eventBus.emit({
 *   type: "tx:confirmed",
 *   chainId: "ethereum",
 *   address: "0x1234...",
 *   txHash: "0xabcd...",
 *   timestamp: Date.now(),
 * })
 *
 * // 监听特定钱包的事件
 * const walletEvents = eventBus.forWalletEvents("ethereum", "0x1234...", ["tx:confirmed"])
 * ```
 */
export const createEventBusService: Effect.Effect<EventBusService> = Effect.gen(function* () {
  const pubsub = yield* PubSub.unbounded<WalletEvent>()

  const baseStream = Stream.fromPubSub(pubsub)

  return {
    emit: (event: WalletEvent) => PubSub.publish(pubsub, event),

    stream: baseStream,

    forWallet: (chainId: string, address: string) =>
      baseStream.pipe(
        Stream.filter(
          (e) => e.chainId === chainId && e.address.toLowerCase() === address.toLowerCase()
        )
      ),

    forWalletEvents: (chainId: string, address: string, types: WalletEventType[]) =>
      baseStream.pipe(
        Stream.filter(
          (e) =>
            e.chainId === chainId &&
            e.address.toLowerCase() === address.toLowerCase() &&
            types.includes(e.type)
        )
      ),

    shutdown: PubSub.shutdown(pubsub),
  }
})

// ==================== Helper Functions ====================

/**
 * 创建 tx:confirmed 事件
 */
export const txConfirmedEvent = (
  chainId: string,
  address: string,
  txHash?: string
): WalletEvent => ({
  type: "tx:confirmed",
  chainId,
  address,
  txHash,
  timestamp: Date.now(),
})

/**
 * 创建 tx:sent 事件
 */
export const txSentEvent = (chainId: string, address: string, txHash?: string): WalletEvent => ({
  type: "tx:sent",
  chainId,
  address,
  txHash,
  timestamp: Date.now(),
})

/**
 * 创建 balance:changed 事件
 */
export const balanceChangedEvent = (chainId: string, address: string): WalletEvent => ({
  type: "balance:changed",
  chainId,
  address,
  timestamp: Date.now(),
})
