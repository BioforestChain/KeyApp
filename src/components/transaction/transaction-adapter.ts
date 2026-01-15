/**
 * Transaction Adapter - 转换 API Transaction 到 UI TransactionInfo
 * 
 * 使用类型推导自动映射字段，减少手动类型标注
 */

import type { Transaction } from '@/services/chain-adapter/providers'
import type { TransactionInfo, TransactionType } from './types'
import { Amount } from '@/types/amount'
import type { ChainType } from '@/stores'

// Action 到 TransactionType 的映射
const ACTION_TO_TYPE: Record<string, TransactionType> = {
    transfer: 'send',  // 默认显示为 send，后续根据 direction 调整
    swap: 'swap',
    exchange: 'exchange',
    approve: 'approve',
    signature: 'signature',
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
    contract: 'interaction',
    unknown: 'other',
    revoke: 'approve',
    claim: 'receive',
}

/**
 * 根据 action 和 direction 推导 TransactionType
 */
function deriveTransactionType(action: string, direction: string): TransactionType {
    // transfer 根据 direction 区分 send/receive
    if (action === 'transfer') {
        return direction === 'in' ? 'receive' : 'send'
    }

    return ACTION_TO_TYPE[action] ?? 'other'
}

/**
 * 从 Transaction 获取主资产的 Amount
 */
function getPrimaryAmount(tx: Transaction): { amount: Amount; symbol: string } {
    const asset = tx.assets[0]

    if (asset.assetType === 'nft') {
        // NFT 没有数值，返回 1
        return {
            amount: Amount.fromRaw('1', 0, 'NFT'),
            symbol: 'NFT',
        }
    }

    return {
        amount: Amount.fromRaw(asset.value, asset.decimals, asset.symbol),
        symbol: asset.symbol,
    }
}

/**
 * 转换 API Transaction 到 UI TransactionInfo
 * 
 * @param tx - API 返回的 Transaction
 * @param chainId - 链 ID（可选，用于显示链图标）
 * @returns UI 组件使用的 TransactionInfo
 */
export function toTransactionInfo(tx: Transaction, chainId?: string): TransactionInfo {
    const type = deriveTransactionType(tx.action, tx.direction)
    const { amount, symbol } = getPrimaryAmount(tx)

    // 根据 direction 确定显示的地址
    const address = tx.direction === 'in' ? tx.from : tx.to

    return {
        id: tx.hash,
        type,
        status: tx.status,
        amount,
        symbol,
        address,
        timestamp: new Date(tx.timestamp * 1000),
        hash: tx.hash,
        chain: chainId as ChainType | undefined,
    }
}

/**
 * 批量转换 Transaction 数组
 */
export function toTransactionInfoList(txs: Transaction[], chainId?: string): TransactionInfo[] {
    return txs.map(tx => toTransactionInfo(tx, chainId))
}
