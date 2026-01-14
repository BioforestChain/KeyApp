/**
 * Transaction Adapters
 * 
 * Convert between chain-provider Transaction schema and component TransactionInfo type.
 * Chain-provider Transaction is the source of truth for API responses.
 */

import type { Transaction, Action } from '@/services/chain-adapter/providers/transaction-schema'
import { getPrimaryAsset, isNativeAsset, isTokenAsset } from '@/services/chain-adapter/providers/transaction-schema'
import type { TransactionInfo, TransactionType, TransactionStatus } from './types'
import type { ChainType } from '@/stores'
import { Amount } from '@/types/amount'

/**
 * Map chain-provider Action to component TransactionType
 */
function mapActionToType(action: Action, direction: Transaction['direction']): TransactionType {
    // Map bidirectional actions based on direction
    if (action === 'transfer') {
        return direction === 'in' ? 'receive' : 'send'
    }

    // Direct mappings
    const actionMap: Partial<Record<Action, TransactionType>> = {
        swap: 'swap',
        exchange: 'exchange',
        approve: 'approve',
        stake: 'stake',
        unstake: 'unstake',
        mint: 'mint',
        burn: 'destroy',
        gift: 'gift',
        grab: 'grab',
        trust: 'trust',
        signFor: 'signFor',
        emigrate: 'emigrate',
        immigrate: 'immigrate',
        issueAsset: 'issueAsset',
        increaseAsset: 'increaseAsset',
        destroyAsset: 'destroy',
        issueEntity: 'issueEntity',
        destroyEntity: 'destroyEntity',
        locationName: 'locationName',
        dapp: 'dapp',
        certificate: 'certificate',
        mark: 'mark',
        signature: 'signature',
    }

    return actionMap[action] ?? 'other'
}

/**
 * Map TxStatus to TransactionStatus
 * Both types are identical: 'pending' | 'confirmed' | 'failed'
 */
function mapStatus(status: Transaction['status']): TransactionStatus {
    return status
}

/**
 * Convert chain-provider Transaction to component TransactionInfo
 * 
 * @param tx - Transaction from chain-provider API
 * @param chain - Chain type for display (optional)
 * @returns TransactionInfo for UI components
 */
export function toTransactionInfo(tx: Transaction, chain?: ChainType): TransactionInfo {
    const primaryAsset = getPrimaryAsset(tx)
    const address = tx.direction === 'in' ? tx.from : tx.to

    // Get amount info from primary asset
    let decimals = 8 // default for bioforest
    let value = '0'
    let symbol = ''

    if (isNativeAsset(primaryAsset) || isTokenAsset(primaryAsset)) {
        decimals = primaryAsset.decimals
        value = primaryAsset.value
        symbol = primaryAsset.symbol
    }

    return {
        id: tx.hash,
        type: mapActionToType(tx.action, tx.direction),
        status: mapStatus(tx.status),
        amount: Amount.fromRaw(value, decimals, symbol),
        symbol,
        address,
        timestamp: new Date(tx.timestamp),
        hash: tx.hash,
        chain,
    }
}

/**
 * Convert array of chain-provider Transactions to TransactionInfo array
 */
export function toTransactionInfoList(txs: Transaction[], chain?: ChainType): TransactionInfo[] {
    return txs.map(tx => toTransactionInfo(tx, chain))
}
