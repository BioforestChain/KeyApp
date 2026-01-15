/**
 * Convert PendingTx to TransactionInfo format
 */

import { Amount } from '@/types/amount'
import type { TransactionInfo, TransactionType } from '@/components/transaction/types'
import type { PendingTx } from './pending-tx'

// Map pending tx meta type to UI TransactionType
function mapMetaType(metaType: string | undefined): TransactionType {
    if (metaType === 'transfer') return 'send' // transfer is always outgoing for pending tx
    if (metaType && ['send', 'receive', 'stake', 'unstake', 'swap', 'exchange', 'destroy', 'gift', 'grab', 'trust', 'signFor', 'signature', 'emigrate', 'immigrate', 'issueAsset', 'increaseAsset', 'mint', 'issueEntity', 'destroyEntity', 'locationName', 'dapp', 'certificate', 'mark', 'approve', 'interaction'].includes(metaType)) {
        return metaType as TransactionType
    }
    return 'other'
}

export function pendingTxToTransactionInfo(tx: PendingTx, decimals: number): TransactionInfo {
    const amountStr = tx.meta?.displayAmount ?? '0'
    const symbol = tx.meta?.displaySymbol ?? ''
    const amount = Amount.fromFormatted(amountStr, decimals, symbol)

    return {
        id: tx.id,
        type: mapMetaType(tx.meta?.type),
        status: tx.status === 'broadcasted' ? 'pending' : tx.status === 'confirmed' ? 'confirmed' : 'failed',
        amount,
        symbol,
        address: tx.meta?.displayToAddress ?? tx.fromAddress,
        timestamp: new Date(tx.createdAt),
        hash: tx.txHash,
        chain: tx.chainId as any,
    }
}
