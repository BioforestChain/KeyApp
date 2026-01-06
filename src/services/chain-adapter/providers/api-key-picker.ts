/**
 * API Key Picker
 * 
 * 支持逗号分隔的多个 API key，应用启动时随机选择一个并锁定。
 * 用于 Etherscan、TronGrid 等需要 API key 的服务。
 */

const lockedKeys = new Map<string, string>()

/**
 * 从逗号分隔的 API key 字符串中随机选择一个
 * 
 * - 首次调用时随机选择并缓存（应用启动后锁定）
 * - 后续调用返回相同的 key
 * - 支持格式: "key1" 或 "key1,key2,key3"
 * 
 * @param apiKeyString - 逗号分隔的 API key 字符串
 * @param cacheKey - 缓存键，用于区分不同服务（如 'etherscan', 'trongrid'）
 * @returns 选中的单个 API key，如果输入为空则返回 undefined
 */
export function pickApiKey(apiKeyString: string | undefined, cacheKey: string): string | undefined {
  if (!apiKeyString || apiKeyString.trim() === '') {
    return undefined
  }

  // 检查缓存
  if (lockedKeys.has(cacheKey)) {
    return lockedKeys.get(cacheKey)
  }

  // 解析并选择
  const keys = apiKeyString
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0)

  if (keys.length === 0) {
    return undefined
  }

  // 随机选择一个
  const selectedKey = keys[Math.floor(Math.random() * keys.length)]
  
  // 缓存选择结果
  lockedKeys.set(cacheKey, selectedKey)

  return selectedKey
}

/**
 * 清除缓存的 API key（仅用于测试）
 */
export function clearApiKeyCache(): void {
  lockedKeys.clear()
}

/**
 * 获取当前缓存的 API key（仅用于调试）
 */
export function getLockedApiKey(cacheKey: string): string | undefined {
  return lockedKeys.get(cacheKey)
}
