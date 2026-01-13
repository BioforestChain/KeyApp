/**
 * Key-Fetch 缓存规则配置
 * 
 * 为 BioChain 系列链配置响应式缓存规则
 */

import { keyFetch, interval, deps, dedupe, tag } from '@biochain/key-fetch'

// 默认出块间隔（毫秒）
const DEFAULT_FORGE_INTERVAL = 15_000

// 存储各链的出块间隔
const forgeIntervals = new Map<string, number>()

/**
 * 设置链的出块间隔
 */
export function setForgeInterval(chainId: string, intervalMs: number): void {
  forgeIntervals.set(chainId, intervalMs)
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
function extractChainId(url: string): string | undefined {
  const match = url.match(/\/wallet\/(\w+)\//)
  return match?.[1]
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
      interval((ctx) => {
        // 从 URL 中提取 chainId 并获取对应的出块间隔
        // 注意：这里需要在实际请求时动态获取
        return DEFAULT_FORGE_INTERVAL
      }),
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

  // 地址信息（二次签名等）- 较长缓存
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
