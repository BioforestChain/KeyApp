/**
 * Convert PendingTx to TransactionInfo format
 */

import { Amount } from '@/types/amount'
import type { TransactionInfo } from '@/components/transaction/types'
import type { PendingTx } from './pending-tx'

/**
 * Map pending tx status to TransactionInfo status
 */
function mapPendingStatus(status: PendingTx['status']): TransactionInfo['status'] {
    switch (status) {
        case 'confirmed':
            return 'confirmed'
        case 'failed':
            return 'failed'
        case 'created':
        case 'broadcasting':
        case 'broadcasted':
        default:
            return 'pending'
    }
}

export function pendingTxToTransactionInfo(tx: PendingTx, decimals: number): TransactionInfo {
    const amountStr = tx.meta?.displayAmount ?? '0'
    const symbol = tx.meta?.displaySymbol ?? ''
    const amount = Amount.fromFormatted(amountStr, decimals, symbol)

    return {
        // 使用 chainId--txHash 格式，与 adapters.ts 中的 toTransactionInfo 保持一致
        id: `${tx.chainId}--${tx.txHash}`,
        type: tx.meta?.type ?? 'other',
        status: mapPendingStatus(tx.status),
        amount,
        symbol,
        address: tx.meta?.displayToAddress ?? tx.fromAddress,
        timestamp: new Date(tx.createdAt),
        hash: tx.txHash,
        chain: tx.chainId as any,
    }
}
