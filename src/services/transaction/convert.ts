/**
 * Convert PendingTx to TransactionInfo format
 */

import { Amount } from '@/types/amount'
import type { TransactionInfo } from '@/components/transaction/types'
import type { PendingTx } from './pending-tx'

export function pendingTxToTransactionInfo(tx: PendingTx, decimals: number): TransactionInfo {
    const amountStr = tx.meta?.displayAmount ?? '0'
    const symbol = tx.meta?.displaySymbol ?? ''
    const amount = Amount.fromFormatted(amountStr, decimals, symbol)

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
