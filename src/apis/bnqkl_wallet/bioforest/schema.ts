/**
 * BioForest API Zod Schemas
 * 
 * 用于验证外部 API 返回的数据
 */

import { z } from 'zod'

/** 广播错误信息 */
export const BroadcastErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

/** 广播结果 */
export const BroadcastResultSchema = z.object({
  success: z.boolean(),
  minFee: z.string().optional(),
  message: z.string().optional(),
  error: BroadcastErrorSchema.optional(),
})

export type BroadcastError = z.infer<typeof BroadcastErrorSchema>
export type BroadcastResult = z.infer<typeof BroadcastResultSchema>
