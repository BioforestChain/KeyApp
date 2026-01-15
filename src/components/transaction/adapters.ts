/**
 * Transaction Adapters
 * 
 * Convert between chain-provider Transaction schema and component TransactionInfo type.
 * Chain-provider Transaction is the source of truth for API responses.
 */

import type { TransactionInfo, TransactionType, TransactionStatus } from './types'
import type { ChainType } from '@/stores'
import { Amount } from '@/types/amount'

// Inline Transaction type to avoid circular dependency
interface Transaction {
    hash: string
    from: string
    to: string
    timestamp: number
    status: 'pending' | 'confirmed' | 'failed'
    action: string
    direction: 'in' | 'out' | 'self'
    assets: Array<{
        assetType: 'native' | 'token' | 'nft'
        value?: string
        symbol?: string
        decimals?: number
        tokenId?: string
        contractAddress?: string
        name?: string
    }>
}

/**
 * Map chain-provider Action to component TransactionType
 */
function mapActionToType(action: string, direction: Transaction['direction']): TransactionType {
    // Map bidirectional actions based on direction
    if (action === 'transfer') {
        return direction === 'in' ? 'receive' : 'send'
    }

    // Direct mappings
    const actionMap: Partial<Record<string, TransactionType>> = {
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
    // Defensive check for malformed transaction
    if (!tx || !tx.hash || !tx.assets || tx.assets.length === 0) {
        // Return a placeholder for invalid transactions
        return {
            id: tx?.hash ?? 'unknown',
            type: 'other',
            status: 'pending',
            amount: Amount.fromRaw('0', 8, ''),
            symbol: '',
            address: tx?.from ?? tx?.to ?? '',
            timestamp: new Date(),
            hash: tx?.hash,
            chain,
        }
    }

    // Get primary asset (first asset in array)
    const primaryAsset = tx.assets[0]
    const address = tx.direction === 'in' ? tx.from : tx.to

    // Get amount info from primary asset
    let decimals = 8 // default for bioforest
    let value = '0'
    let symbol = ''

    // Check if it's native or token asset (has value, symbol, decimals)
    if (primaryAsset.assetType === 'native' || primaryAsset.assetType === 'token') {
        decimals = primaryAsset.decimals ?? 8
        value = primaryAsset.value ?? '0'
        symbol = primaryAsset.symbol ?? ''
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
 * With defensive error handling
 */
export function toTransactionInfoList(txs: Transaction[], chain?: ChainType): TransactionInfo[] {
    // Defensive check for null/undefined array
    if (!txs || !Array.isArray(txs)) {
        return []
    }

    return txs
        .filter(tx => tx != null) // Filter out null/undefined entries
        .map(tx => {
            try {
                return toTransactionInfo(tx, chain)
            } catch (e) {
                console.warn('[toTransactionInfoList] Failed to convert transaction:', tx, e)
                // Return a placeholder for failed conversions
                return {
                    id: tx?.hash ?? 'error',
                    type: 'other' as const,
                    status: 'pending' as const,
                    amount: Amount.fromRaw('0', 8, ''),
                    symbol: '',
                    address: '',
                    timestamp: new Date(),
                    chain,
                }
            }
        })
}

