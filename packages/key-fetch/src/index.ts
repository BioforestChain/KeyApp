/**
 * @biochain/key-fetch v2
 * 
 * Schema-first 插件化响应式 Fetch
 */

import { create, superjson } from './core'
import { fallback } from './fallback'

// ==================== 导出类型 ====================

export type {
  Context,
  Plugin,
  KeyFetchDefineOptions,
  KeyFetchInstance,
  SubscribeCallback,
  UseStateOptions,
  UseStateResult,
  InferInput,
  InferOutput,
} from './types'

// ==================== 核心插件 ====================

export { useHttp } from './plugins/http'
export type { UseHttpOptions } from './plugins/http'

export { useInterval } from './plugins/interval'

export { useDedupe, DedupeThrottledError } from './plugins/dedupe'

// ==================== 工具插件 ====================

export { throttleError, errorMatchers } from './plugins/throttle-error'
export { apiKey } from './plugins/api-key'

// ==================== Combine & Fallback ====================

export { combine } from './combine'
export type { CombineSourceConfig, CombineOptions } from './combine'

export { fallback, NoSupportError } from './fallback'

// ==================== 错误类型 ====================

export { ServiceLimitedError } from './errors'

// ==================== 主 API ====================

export const keyFetch = {
  create,
  merge: fallback,
  superjson,
}

export default keyFetch
