/**
 * Pending Transaction Service Types
 * 
 * 未上链交易管理服务 - 专注状态管理，不关心交易内容
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'
import {
  PendingTxSchema,
  PendingTxStatusSchema,
  PendingTxMetaSchema,
  CreatePendingTxInputSchema,
  UpdatePendingTxStatusInputSchema,
} from './schema'

export type {
  PendingTx,
  PendingTxStatus,
  PendingTxMeta,
  CreatePendingTxInput,
  UpdatePendingTxStatusInput,
} from './schema'

export {
  PendingTxSchema,
  PendingTxStatusSchema,
  PendingTxMetaSchema,
  CreatePendingTxInputSchema,
  UpdatePendingTxStatusInputSchema,
} from './schema'

/** Service Meta 定义 */
export const pendingTxServiceMeta = defineServiceMeta('pendingTx', (s) =>
  s.description('未上链交易管理服务 - 专注状态管理，不关心交易内容')
    
    // ===== 查询 =====
    .api('getAll', z.object({ walletId: z.string() }), z.array(PendingTxSchema))
    .api('getById', z.object({ id: z.string() }), PendingTxSchema.nullable())
    .api('getByStatus', z.object({ 
      walletId: z.string(), 
      status: PendingTxStatusSchema,
    }), z.array(PendingTxSchema))
    .api('getPending', z.object({ walletId: z.string() }), z.array(PendingTxSchema))
    
    // ===== 生命周期管理 =====
    .api('create', CreatePendingTxInputSchema, PendingTxSchema)
    .api('updateStatus', UpdatePendingTxStatusInputSchema, PendingTxSchema)
    .api('incrementRetry', z.object({ id: z.string() }), PendingTxSchema)
    
    // ===== 清理 =====
    .api('delete', z.object({ id: z.string() }), z.void())
    .api('deleteConfirmed', z.object({ walletId: z.string() }), z.void())
    .api('deleteAll', z.object({ walletId: z.string() }), z.void())
)

export type IPendingTxService = typeof pendingTxServiceMeta.Type
