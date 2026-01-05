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
export type TransactionType =
  // 基础转账
  | 'send'
  | 'receive'
  // 安全
  | 'signature'        // BSE-01 设置安全密码
  // 权益操作
  | 'stake'            // AST-12 权益质押
  | 'unstake'          // AST-13 权益解除质押
  | 'destroy'          // AST-03 权益销毁
  | 'gift'             // AST-04 发起权益赠送
  | 'grab'             // AST-05 接受权益赠送
  | 'trust'            // AST-06 发起权益委托
  | 'signFor'          // AST-07 签收权益委托
  | 'emigrate'         // AST-08 权益迁出
  | 'immigrate'        // AST-09 权益迁入
  | 'exchange'         // AST-10/11 权益交换
  // 资产发行
  | 'issueAsset'       // AST-00 创建权益
  | 'increaseAsset'    // AST-01 增发权益
  // NFT
  | 'issueEntity'      // ETY-02 创建非同质资产
  | 'destroyEntity'    // ETY-03 销毁非同质资产
  // 位名
  | 'locationName'     // LNS-00 注册/注销位名
  // DApp
  | 'dapp'             // WOD-00/01/02 DApp相关
  // 凭证
  | 'certificate'      // CRT-00/01 凭证相关
  // EVM/Tron 合约操作
  | 'approve'          // ERC-20/TRC-20 授权
  | 'interaction'      // 合约交互
  // 其他
  | 'mark'             // EXT-00 数据存证
  | 'other'            // 其他未分类

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

// All transaction types for validation
const TransactionTypeEnum = z.enum([
  'send', 'receive', 'signature', 'stake', 'unstake', 'destroy',
  'gift', 'grab', 'trust', 'signFor', 'emigrate', 'immigrate', 'exchange',
  'issueAsset', 'increaseAsset', 'issueEntity', 'destroyEntity',
  'locationName', 'dapp', 'certificate', 'approve', 'interaction', 'mark', 'other',
])

const TransactionRecordSchema = z.object({
  id: z.string(),
  type: TransactionTypeEnum,
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
  type: TransactionTypeEnum.or(z.literal('all')).optional(),
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
