/**
 * Convert PendingTx to TransactionInfo format
 */

import type { TransactionInfo } from '@/components/transaction/types'
import type { PendingTx } from './pending-tx'

export function pendingTxToTransactionInfo(tx: PendingTx): TransactionInfo {
    return {
        id: tx.id,
        type: (tx.meta?.type as any) ?? 'other',
        status: tx.status === 'broadcasted' ? 'pending' : tx.status === 'confirmed' ? 'confirmed' : 'failed',
        amount: {
            toFormatted: () => tx.meta?.displayAmount ?? '0',
            decimals: 0,
            symbol: tx.meta?.displaySymbol ?? '',
        } as any,
        symbol: tx.meta?.displaySymbol ?? '',
        address: tx.meta?.displayToAddress ?? tx.fromAddress,
        timestamp: tx.createdAt,
        hash: tx.txHash,
        chain: tx.chainId as any,
    }
}
