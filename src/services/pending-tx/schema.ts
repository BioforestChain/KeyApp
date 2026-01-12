/**
 * Pending Transaction Schema
 * 
 * 未上链交易的 Zod Schema 定义
 * 专注于状态管理，不关心交易内容本身
 */

import { z } from 'zod'

/** 未上链交易状态 */
export const PendingTxStatusSchema = z.enum([
  'created',      // 交易已创建，待广播
  'broadcasting', // 广播中
  'broadcasted',  // 广播成功，待上链
  'confirmed',    // 已上链确认
  'failed',       // 广播失败
])

/** 用于 UI 展示的最小元数据（可选，由调用方提供） */
export const PendingTxMetaSchema = z.object({
  /** 交易类型标识，用于 UI 展示 */
  type: z.string().optional(),
  /** 展示用的金额 */
  displayAmount: z.string().optional(),
  /** 展示用的符号 */
  displaySymbol: z.string().optional(),
  /** 展示用的目标地址 */
  displayToAddress: z.string().optional(),
}).passthrough()  // 允许扩展字段

/** 未上链交易记录 - 专注状态管理 */
export const PendingTxSchema = z.object({
  /** 唯一ID (uuid) */
  id: z.string(),
  /** 钱包ID */
  walletId: z.string(),
  /** 链ID */
  chainId: z.string(),
  /** 发送地址 */
  fromAddress: z.string(),
  
  // ===== 状态管理 =====
  /** 当前状态 */
  status: PendingTxStatusSchema,
  /** 交易哈希（广播成功后有值） */
  txHash: z.string().optional(),
  /** 失败时的错误码 */
  errorCode: z.string().optional(),
  /** 失败时的错误信息 */
  errorMessage: z.string().optional(),
  /** 重试次数 */
  retryCount: z.number().default(0),
  
  // ===== 时间戳 =====
  createdAt: z.number(),
  updatedAt: z.number(),
  
  // ===== 交易数据（不透明） =====
  /** 原始交易数据，用于广播和重试 */
  rawTx: z.unknown(),
  /** UI 展示用的元数据（可选） */
  meta: PendingTxMetaSchema.optional(),
})

export type PendingTx = z.infer<typeof PendingTxSchema>
export type PendingTxStatus = z.infer<typeof PendingTxStatusSchema>
export type PendingTxMeta = z.infer<typeof PendingTxMetaSchema>

/** 创建 pending tx 的输入 */
export const CreatePendingTxInputSchema = z.object({
  walletId: z.string(),
  chainId: z.string(),
  fromAddress: z.string(),
  rawTx: z.unknown(),
  meta: PendingTxMetaSchema.optional(),
})

export type CreatePendingTxInput = z.infer<typeof CreatePendingTxInputSchema>

/** 更新状态的输入 */
export const UpdatePendingTxStatusInputSchema = z.object({
  id: z.string(),
  status: PendingTxStatusSchema,
  txHash: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
})

export type UpdatePendingTxStatusInput = z.infer<typeof UpdatePendingTxStatusInputSchema>
