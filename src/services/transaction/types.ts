/**
 * Transaction Service 接口定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'
import { Amount } from '@/types/amount'
import type { ChainType } from '@/stores'

// Custom Amount schema for Zod validation
const AmountSchema = z.custom<Amount>((val) => val instanceof Amount)

/** 交易类型 */
export type TransactionType = 'send' | 'receive' | 'swap' | 'stake' | 'unstake'

/** 交易状态 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

/** 交易记录 */
export interface TransactionRecord {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: Amount
  symbol: string
  decimals: number
  address: string
  timestamp: Date
  hash?: string | undefined
  chain: ChainType
  fee?: Amount | undefined
  feeSymbol?: string | undefined
  feeDecimals?: number | undefined
  blockNumber?: number | undefined
  confirmations?: number | undefined
}

/** 交易过滤器 */
export interface TransactionFilter {
  chain: ChainType | 'all' | undefined
  period: '7d' | '30d' | '90d' | 'all' | undefined
  type: TransactionType | 'all' | undefined
  status: TransactionStatus | 'all' | undefined
}

// ==================== Zod Schemas (for API validation) ====================

const TransactionRecordSchema = z.object({
  id: z.string(),
  type: z.enum(['send', 'receive', 'swap', 'stake', 'unstake']),
  status: z.enum(['pending', 'confirmed', 'failed']),
  amount: AmountSchema,
  symbol: z.string(),
  decimals: z.number(),
  address: z.string(),
  timestamp: z.date(),
  hash: z.string().optional(),
  chain: z.string(),
  fee: AmountSchema.optional(),
  feeSymbol: z.string().optional(),
  feeDecimals: z.number().optional(),
  blockNumber: z.number().optional(),
  confirmations: z.number().optional(),
})

const TransactionFilterSchema = z.object({
  chain: z.string().optional(),
  period: z.enum(['7d', '30d', '90d', 'all']).optional(),
  type: z.enum(['send', 'receive', 'swap', 'stake', 'unstake', 'all']).optional(),
  status: z.enum(['pending', 'confirmed', 'failed', 'all']).optional(),
})

// ==================== Service Meta ====================

export const transactionServiceMeta = defineServiceMeta('transaction', (s) =>
  s.description('交易服务')
    .api('getHistory', z.object({ walletId: z.string(), filter: TransactionFilterSchema.optional() }), z.array(TransactionRecordSchema))
    .api('getTransaction', z.object({ id: z.string() }), TransactionRecordSchema.nullable())
    .api('refresh', z.object({ walletId: z.string() }), z.void()),
)

export type ITransactionService = typeof transactionServiceMeta.Type

/**
 * Mock 控制接口
 */
export interface ITransactionMockController {
  /** 重置 mock 数据 */
  _resetData(): void

  /** 添加交易记录 */
  _addTransaction(tx: TransactionRecord): void

  /** 设置延迟 */
  _setDelay(ms: number): void

  /** 模拟错误 */
  _simulateError(error: Error | null): void
}
