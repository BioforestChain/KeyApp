/**
 * Key-Fetch 缓存规则配置
 * 
 * 为 BioChain 系列链配置响应式缓存规则
 */

import { keyFetch, interval, deps, dedupe, tag } from '@biochain/key-fetch'

// 默认出块间隔（毫秒）- 15秒
const DEFAULT_FORGE_INTERVAL = 15_000

// 存储各链的出块间隔（从 genesis block 获取后缓存）
const forgeIntervals = new Map<string, number>()

/**
 * 设置链的出块间隔
 */
export function setForgeInterval(chainId: string, intervalMs: number): void {
  forgeIntervals.set(chainId, intervalMs)
  console.log(`[key-fetch] Set forgeInterval for ${chainId}: ${intervalMs}ms`)
}

/**
 * 获取链的出块间隔
 */
export function getForgeInterval(chainId: string): number {
  return forgeIntervals.get(chainId) ?? DEFAULT_FORGE_INTERVAL
}

/**
 * 从 URL 提取 chainId
 */
function extractChainIdFromUrl(url: string): string | undefined {
  // 匹配 /wallet/{chainId}/lastblock 格式
  const match = url.match(/\/wallet\/(\w+)\//)
  return match?.[1]
}

/**
 * 根据 URL 获取轮询间隔
 */
function getPollingIntervalByUrl(url: string): number {
  const chainId = extractChainIdFromUrl(url)
  if (chainId) {
    const interval = forgeIntervals.get(chainId)
    if (interval) {
      return interval * 1000 // 转换为毫秒
    }
  }
  return DEFAULT_FORGE_INTERVAL
}

/**
 * 初始化 BioChain 缓存规则
 * 
 * 规则层级：
 * 1. lastblock - 轮询源头，基于出块间隔
 * 2. balance, txHistory 等 - 依赖 lastblock，区块更新时自动刷新
 */
export function initBioChainCacheRules(): void {
  // 区块高度 - 各链独立的轮询源头
  // 使用通配符匹配所有 BioChain 系列链
  keyFetch.define({
    name: 'biochain.lastblock',
    pattern: /\/wallet\/\w+\/lastblock/,
    use: [
      dedupe(),
      interval(getPollingIntervalByUrl),
      tag('biochain', 'lastblock'),
    ],
  })

  // 余额查询 - 依赖区块高度
  keyFetch.define({
    name: 'biochain.balance',
    pattern: /\/wallet\/\w+\/address\/asset/,
    use: [
      dedupe(),
      deps('biochain.lastblock'),
      tag('biochain', 'balance'),
    ],
  })

  // 交易历史查询 - 依赖区块高度
  keyFetch.define({
    name: 'biochain.txHistory',
    pattern: /\/wallet\/\w+\/transactions\/query/,
    use: [
      dedupe(),
      deps('biochain.lastblock'),
      tag('biochain', 'txHistory'),
    ],
  })

  // 地址信息（二次签名等）- 依赖区块高度
  keyFetch.define({
    name: 'biochain.addressInfo',
    pattern: /\/wallet\/\w+\/address\/info/,
    use: [
      dedupe(),
      deps('biochain.lastblock'),
      tag('biochain', 'addressInfo'),
    ],
  })

  console.log('[key-fetch] BioChain cache rules initialized')
}

/**
 * 为特定链配置独立的区块高度轮询
 * 
 * @param chainId 链ID（如 bfmetav2, pmchain）
 * @param forgeIntervalMs 出块间隔（毫秒）
 */
export function defineBioChainRules(chainId: string, forgeIntervalMs: number): void {
  setForgeInterval(chainId, forgeIntervalMs)

  // 该链的区块高度轮询
  keyFetch.define({
    name: `${chainId}.lastblock`,
    pattern: new RegExp(`/wallet/${chainId}/lastblock`),
    use: [
      dedupe(),
      interval(forgeIntervalMs),
      tag('biochain', chainId, 'lastblock'),
    ],
  })

  // 该链的余额
  keyFetch.define({
    name: `${chainId}.balance`,
    pattern: new RegExp(`/wallet/${chainId}/address/asset`),
    use: [
      dedupe(),
      deps(`${chainId}.lastblock`),
      tag('biochain', chainId, 'balance'),
    ],
  })

  // 该链的交易历史
  keyFetch.define({
    name: `${chainId}.txHistory`,
    pattern: new RegExp(`/wallet/${chainId}/transactions/query`),
    use: [
      dedupe(),
      deps(`${chainId}.lastblock`),
      tag('biochain', chainId, 'txHistory'),
    ],
  })

  console.log(`[key-fetch] Rules defined for chain: ${chainId} (interval: ${forgeIntervalMs}ms)`)
}
