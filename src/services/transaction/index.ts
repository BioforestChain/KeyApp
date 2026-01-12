/**
 * Transaction 服务
 *
 * 通过 Vite alias 在编译时选择实现：
 * - web: Web 平台
 * - dweb: DWEB 平台
 * - mock: Mock 实现
 */

export type {
  ITransactionService,
  ITransactionMockController,
  TransactionRecord,
  TransactionFilter,
  TransactionType,
  TransactionStatus,
} from './types'
export { transactionServiceMeta } from './types'
export { transactionService } from '#transaction-impl'

// Pending Transaction Service
export {
  pendingTxService,
  pendingTxServiceMeta,
  PendingTxSchema,
  PendingTxStatusSchema,
  PendingTxMetaSchema,
  CreatePendingTxInputSchema,
  UpdatePendingTxStatusInputSchema,
} from './pending-tx'
export type {
  PendingTx,
  PendingTxStatus,
  PendingTxMeta,
  CreatePendingTxInput,
  UpdatePendingTxStatusInput,
  IPendingTxService,
} from './pending-tx'
