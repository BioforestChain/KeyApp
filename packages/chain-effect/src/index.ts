/**
 * @biochain/chain-effect
 *
 * Effect TS based reactive chain data fetching
 * 
 * @see https://context7.com/effect-ts/effect/llms.txt - Effect 官方文档
 * @see https://context7.com/tim-smart/effect-atom/llms.txt - Effect Atom React 集成参考
 */

// Re-export Effect core types for convenience
export { Effect, Stream, Schedule, Duration, Ref, SubscriptionRef, PubSub, Fiber } from "effect"
export { Schema } from "effect"

// SuperJSON for serialization (handles BigInt, Amount, etc.)
import { SuperJSON } from "superjson"
export const superjson = new SuperJSON({ dedupe: true })
export { SuperJSON } from "superjson"

// Schema definitions
export * from "./schema"

// HTTP utilities
export {
  httpFetch,
  httpFetchWithRetry,
  defaultRetrySchedule,
  rateLimitRetrySchedule,
  HttpError,
  RateLimitError,
  SchemaError,
  NoSupportError,
  ServiceLimitedError,
  type FetchOptions,
  type FetchError,
} from "./http"

// Stream utilities
export {
  polling,
  triggered,
  transform,
  map,
  filter,
  changes,
  type PollingOptions,
  type TriggeredOptions,
} from "./stream"

// Data Source (Effect native pattern)
export {
  createEventBus,
  createPollingSource,
  createDependentSource,
  createHybridSource,
  type EventBus,
  type DataSource,
  type PollingSourceOptions,
  type DependentSourceOptions,
  type HybridSourceOptions,
} from "./source"

// EventBus Service (钱包事件总线)
export {
  createEventBusService,
  txConfirmedEvent,
  txSentEvent,
  balanceChangedEvent,
  type EventBusService,
  type WalletEvent,
  type WalletEventType,
} from "./event-bus"

// Stream Instance (React bridge)
export {
  createStreamInstance,
  createStreamInstanceFromSource,
  type StreamInstance,
} from "./instance"
