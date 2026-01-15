/**
 * Convert PendingTx to TransactionInfo format
 */

import { Amount } from '@/types/amount'
import type { TransactionInfo } from '@/components/transaction/types'
import type { PendingTx } from './pending-tx'

export function pendingTxToTransactionInfo(tx: PendingTx): TransactionInfo {
    // 解析金额，使用 Amount.fromFormatted 或者默认为 0
    const amountStr = tx.meta?.displayAmount ?? '0'
    const symbol = tx.meta?.displaySymbol ?? ''
    const amount = Amount.fromFormatted(amountStr, 0, symbol) // pending tx 的 displayAmount 已经是格式化的

    return {
        id: tx.id,
        type: (tx.meta?.type as any) ?? 'other',
        status: tx.status === 'broadcasted' ? 'pending' : tx.status === 'confirmed' ? 'confirmed' : 'failed',
        amount,
        symbol,
        address: tx.meta?.displayToAddress ?? tx.fromAddress,
        timestamp: new Date(tx.createdAt),
        hash: tx.txHash,
        chain: tx.chainId as any,
    }
}
