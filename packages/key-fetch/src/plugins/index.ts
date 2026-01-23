/**
 * Key-Fetch Plugins
 * 
 * 导出所有内置插件
 */

// 新版插件
export { useHttp } from './http'
export type { UseHttpOptions } from './http'
export { useInterval } from './interval'
export { useDedupe, DedupeThrottledError } from './dedupe'

// 兼容旧版名称
export { useInterval as interval } from './interval'
export { useDedupe as dedupe } from './dedupe'

// 保留的插件
export { ttl } from './ttl'
export { tag } from './tag'
export { etag } from './etag'
export { throttleError, errorMatchers } from './throttle-error'
export { apiKey } from './api-key'
export { transform } from './transform'
export { cache, MemoryCacheStorage, IndexedDBCacheStorage } from './cache'
export { unwrap, walletApiUnwrap, etherscanApiUnwrap } from './unwrap'
export { searchParams, postBody, pathParams } from './params'
