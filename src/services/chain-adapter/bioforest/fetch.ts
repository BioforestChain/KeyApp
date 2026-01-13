/**
 * BioForest KeyFetch 定义
 * 
 * Schema-first 响应式数据获取实例
 */

import { z } from 'zod'
import { keyFetch, interval, deps } from '@biochain/key-fetch'

// ==================== Schemas ====================

/** 最新区块响应 Schema */
export const LastBlockSchema = z.object({
  success: z.boolean(),
  result: z.object({
    height: z.number(),
    timestamp: z.number(),
    signature: z.string().optional(),
  }),
})

/** 余额响应 Schema */
export const BalanceSchema = z.object({
  success: z.boolean(),
  result: z.object({
    assets: z.array(z.object({
      symbol: z.string(),
      balance: z.string(),
    })).optional(),
  }).optional(),
})

/** 交易查询响应 Schema */
export const TransactionQuerySchema = z.object({
  success: z.boolean(),
  result: z.object({
    trs: z.array(z.object({
      height: z.number(),
      signature: z.string(),
      tIndex: z.number(),
      transaction: z.object({
        signature: z.string(),
        senderId: z.string(),
        recipientId: z.string().optional(),
        fee: z.string(),
        timestamp: z.number(),
        type: z.string().optional(),
        asset: z.object({
          transferAsset: z.object({
            amount: z.string(),
            assetType: z.string().optional(),
          }).optional(),
        }).optional(),
      }),
    })).optional(),
    count: z.number().optional(),
  }).optional(),
})

/** Genesis Block Schema */
export const GenesisBlockSchema = z.object({
  genesisBlock: z.object({
    forgeInterval: z.number(),
    beginEpochTime: z.number().optional(),
  }),
})

// ==================== 类型导出 ====================

export type LastBlockResponse = z.infer<typeof LastBlockSchema>
export type BalanceResponse = z.infer<typeof BalanceSchema>
export type TransactionQueryResponse = z.infer<typeof TransactionQuerySchema>
export type GenesisBlockResponse = z.infer<typeof GenesisBlockSchema>

// ==================== 出块间隔管理 ====================

const forgeIntervals = new Map<string, number>()
const DEFAULT_FORGE_INTERVAL = 15_000

export function setForgeInterval(chainId: string, intervalMs: number): void {
  forgeIntervals.set(chainId, intervalMs)
  console.log(`[bioforest-fetch] Set forgeInterval for ${chainId}: ${intervalMs}ms`)
}

export function getForgeInterval(chainId: string): number {
  return forgeIntervals.get(chainId) ?? DEFAULT_FORGE_INTERVAL
}

// ==================== KeyFetch 实例工厂 ====================

/**
 * 创建链的 lastBlock KeyFetch 实例
 */
export function createLastBlockFetch(chainId: string, baseUrl: string) {
  return keyFetch.create({
    name: `${chainId}.lastblock`,
    schema: LastBlockSchema,
    url: `${baseUrl}/lastblock`,
    method: 'GET',
    use: [
      interval(() => getForgeInterval(chainId)),
    ],
  })
}

/**
 * 创建链的余额查询 KeyFetch 实例
 */
export function createBalanceFetch(chainId: string, baseUrl: string, lastBlockFetch: ReturnType<typeof createLastBlockFetch>) {
  return keyFetch.create({
    name: `${chainId}.balance`,
    schema: BalanceSchema,
    url: `${baseUrl}/address/asset`,
    method: 'POST',
    use: [
      deps(lastBlockFetch),
    ],
  })
}

/**
 * 创建链的交易查询 KeyFetch 实例
 */
export function createTransactionQueryFetch(chainId: string, baseUrl: string, lastBlockFetch: ReturnType<typeof createLastBlockFetch>) {
  return keyFetch.create({
    name: `${chainId}.txQuery`,
    schema: TransactionQuerySchema,
    url: `${baseUrl}/transactions/query`,
    method: 'POST',
    use: [
      deps(lastBlockFetch),
    ],
  })
}

// ==================== 链实例缓存 ====================

interface ChainFetchInstances {
  lastBlock: ReturnType<typeof createLastBlockFetch>
  balance: ReturnType<typeof createBalanceFetch>
  transactionQuery: ReturnType<typeof createTransactionQueryFetch>
}

const chainInstances = new Map<string, ChainFetchInstances>()

/**
 * 获取或创建链的 KeyFetch 实例集合
 */
export function getChainFetchInstances(chainId: string, baseUrl: string): ChainFetchInstances {
  let instances = chainInstances.get(chainId)
  if (!instances) {
    const lastBlock = createLastBlockFetch(chainId, baseUrl)
    const balance = createBalanceFetch(chainId, baseUrl, lastBlock)
    const transactionQuery = createTransactionQueryFetch(chainId, baseUrl, lastBlock)
    
    instances = { lastBlock, balance, transactionQuery }
    chainInstances.set(chainId, instances)
    
    console.log(`[bioforest-fetch] Created fetch instances for chain: ${chainId}`)
  }
  return instances
}

/**
 * 清理链的 KeyFetch 实例（用于测试）
 */
export function clearChainFetchInstances(): void {
  chainInstances.clear()
}
