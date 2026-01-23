/**
 * @biochain/chain-effect
 *
 * Effect TS based reactive chain data fetching
 */

// Re-export Effect core types for convenience
export { Effect, Stream, Schedule, Duration, Ref, SubscriptionRef, PubSub, Fiber } from "effect"
export { Schema } from "effect"

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
