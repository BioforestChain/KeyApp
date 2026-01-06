/**
 * Provider 查询结果类型
 * 
 * 用于区分"查询成功但数据为空"与"所有 providers 都失败（fallback 到默认值）"
 */

/**
 * Provider 查询结果
 * - supported: true  → 至少一个 provider 成功返回数据
 * - supported: false → 所有 providers 失败，data 是 fallback 默认值
 */
export type ProviderResult<T> =
  | { supported: true; data: T }
  | { supported: false; data: T; reason: string }

/**
 * 创建成功结果
 */
export function createSupportedResult<T>(data: T): ProviderResult<T> {
  return { supported: true, data }
}

/**
 * 创建 fallback 结果
 */
export function createFallbackResult<T>(data: T, reason: string): ProviderResult<T> {
  return { supported: false, data, reason }
}

/**
 * 类型守卫：检查是否查询成功
 */
export function isSupported<T>(result: ProviderResult<T>): result is { supported: true; data: T } {
  return result.supported === true
}

/**
 * 解包 ProviderResult，返回 data（无论是否 supported）
 */
export function unwrapResult<T>(result: ProviderResult<T>): T {
  return result.data
}
