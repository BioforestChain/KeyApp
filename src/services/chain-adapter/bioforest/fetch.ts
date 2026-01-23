/**
 * BioForest Effect-TS 数据源
 * 
 * Schema-first 响应式数据获取 - Effect Native
 */

import { Effect, Duration } from 'effect'
import { Schema } from 'effect'
import { httpFetch, type FetchError } from '@biochain/chain-effect'
import { createPollingSource, createDependentSource, type DataSource } from '@biochain/chain-effect'

// ==================== Schemas (Effect Schema) ====================

/** 最新区块响应 Schema */
export const LastBlockSchema = Schema.Struct({
  success: Schema.Boolean,
  result: Schema.Struct({
    height: Schema.Number,
    timestamp: Schema.Number,
    signature: Schema.optional(Schema.String),
  }),
})

/** 余额响应 Schema */
export const BalanceSchema = Schema.Struct({
  success: Schema.Boolean,
  result: Schema.optional(Schema.Struct({
    assets: Schema.optional(Schema.Array(Schema.Struct({
      symbol: Schema.String,
      balance: Schema.String,
    }))),
  })),
})

/** 交易查询响应 Schema */
export const TransactionQuerySchema = Schema.Struct({
  success: Schema.Boolean,
  result: Schema.optional(Schema.Struct({
    trs: Schema.optional(Schema.Array(Schema.Struct({
      height: Schema.Number,
      signature: Schema.String,
      tIndex: Schema.Number,
      transaction: Schema.Struct({
        signature: Schema.String,
        senderId: Schema.String,
        recipientId: Schema.optional(Schema.String),
        fee: Schema.String,
        timestamp: Schema.Number,
        type: Schema.optional(Schema.String),
        asset: Schema.optional(Schema.Struct({
          transferAsset: Schema.optional(Schema.Struct({
            amount: Schema.String,
            assetType: Schema.optional(Schema.String),
          })),
        })),
      }),
    }))),
    count: Schema.optional(Schema.Number),
  })),
})

/** Genesis Block Schema */
export const GenesisBlockSchema = Schema.Struct({
  genesisBlock: Schema.Struct({
    forgeInterval: Schema.Number,
    beginEpochTime: Schema.optional(Schema.Number),
  }),
})

// ==================== 类型导出 ====================

export type LastBlockResponse = Schema.Schema.Type<typeof LastBlockSchema>
export type BalanceResponse = Schema.Schema.Type<typeof BalanceSchema>
export type TransactionQueryResponse = Schema.Schema.Type<typeof TransactionQuerySchema>
export type GenesisBlockResponse = Schema.Schema.Type<typeof GenesisBlockSchema>

// ==================== 出块间隔管理 ====================

const forgeIntervals = new Map<string, number>()
const DEFAULT_FORGE_INTERVAL = 15_000

export function setForgeInterval(chainId: string, intervalMs: number): void {
  forgeIntervals.set(chainId, intervalMs)
}

export function getForgeInterval(chainId: string): number {
  return forgeIntervals.get(chainId) ?? DEFAULT_FORGE_INTERVAL
}

// ==================== Effect Data Source 工厂 ====================

/**
 * 创建 lastBlock 的 fetch Effect
 */
function createLastBlockFetch(baseUrl: string): Effect.Effect<LastBlockResponse, FetchError> {
  return httpFetch({
    url: `${baseUrl}/lastblock`,
    method: 'GET',
    schema: LastBlockSchema,
  })
}

/**
 * 创建余额查询 fetch Effect
 */
function createBalanceFetch(baseUrl: string, address: string): Effect.Effect<BalanceResponse, FetchError> {
  return httpFetch({
    url: `${baseUrl}/address/asset`,
    method: 'POST',
    body: { address },
    schema: BalanceSchema,
  })
}

/**
 * 创建交易查询 fetch Effect
 */
function createTransactionQueryFetch(
  baseUrl: string,
  address: string,
  limit = 20
): Effect.Effect<TransactionQueryResponse, FetchError> {
  return httpFetch({
    url: `${baseUrl}/transactions/query`,
    method: 'POST',
    body: { address, limit },
    schema: TransactionQuerySchema,
  })
}

// ==================== Effect Data Source 实例 ====================

export interface ChainEffectSources {
  /** lastBlock 轮询源 */
  lastBlock: DataSource<LastBlockResponse>
  /** 余额依赖源 */
  balance: DataSource<BalanceResponse>
  /** 交易查询依赖源 */
  transactionQuery: DataSource<TransactionQueryResponse>
  /** 停止所有源 */
  stopAll: Effect.Effect<void>
}

/**
 * 创建链的 Effect 数据源集合
 * 
 * - lastBlock: 按出块间隔轮询
 * - balance: 依赖 lastBlock 变化
 * - transactionQuery: 依赖 lastBlock 变化
 */
export function createChainEffectSources(
  chainId: string,
  baseUrl: string,
  address: string
): Effect.Effect<ChainEffectSources> {
  return Effect.gen(function* () {
    const interval = Duration.millis(getForgeInterval(chainId))
    
    // lastBlock 轮询源
    const lastBlock = yield* createPollingSource({
      name: `${chainId}.lastBlock`,
      fetch: createLastBlockFetch(baseUrl),
      interval,
    })
    
    // balance 依赖 lastBlock
    const balance = yield* createDependentSource({
      name: `${chainId}.balance`,
      dependsOn: lastBlock.ref,
      hasChanged: (prev, next) => prev?.result.height !== next.result.height,
      fetch: () => createBalanceFetch(baseUrl, address),
    })
    
    // transactionQuery 依赖 lastBlock
    const transactionQuery = yield* createDependentSource({
      name: `${chainId}.transactionQuery`,
      dependsOn: lastBlock.ref,
      hasChanged: (prev, next) => prev?.result.height !== next.result.height,
      fetch: () => createTransactionQueryFetch(baseUrl, address),
    })
    
    return {
      lastBlock,
      balance,
      transactionQuery,
      stopAll: Effect.all([
        lastBlock.stop,
        balance.stop,
        transactionQuery.stop,
      ]).pipe(Effect.asVoid),
    }
  })
}

// ==================== 链实例缓存 ====================

const chainSourcesCache = new Map<string, ChainEffectSources>()

/**
 * 获取或创建链的 Effect 数据源（缓存）
 */
export function getChainEffectSources(
  chainId: string,
  baseUrl: string,
  address: string
): Effect.Effect<ChainEffectSources> {
  const cacheKey = `${chainId}:${address}`
  const cached = chainSourcesCache.get(cacheKey)
  
  if (cached) {
    return Effect.succeed(cached)
  }
  
  return createChainEffectSources(chainId, baseUrl, address).pipe(
    Effect.tap((sources) => Effect.sync(() => {
      chainSourcesCache.set(cacheKey, sources)
    }))
  )
}

/**
 * 清理链的数据源实例
 */
export function clearChainEffectSources(): Effect.Effect<void> {
  return Effect.gen(function* () {
    for (const sources of chainSourcesCache.values()) {
      yield* sources.stopAll
    }
    chainSourcesCache.clear()
  })
}

/**
 * 清理链的 KeyFetch 实例（用于测试 - 兼容旧 API）
 * @deprecated Use clearChainEffectSources instead
 */
export function clearChainFetchInstances(): void {
  Effect.runSync(clearChainEffectSources())
}
