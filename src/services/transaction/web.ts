/**
 * Transaction 服务 - Web 平台实现
 */

import { transactionServiceMeta, type TransactionFilter, type TransactionRecord, type TransactionStatus, type TransactionType } from './types'
import { walletStorageService } from '@/services/wallet-storage'
import { initialize as initializeChainConfigs, getEnabledChains, getChainById, type ChainConfig } from '@/services/chain-config'
import { createBioforestAdapter, type Transaction as ChainTransaction } from '@/services/chain-adapter'
import { getChainProvider, type Transaction as ProviderTransaction } from '@/services/chain-adapter/providers'
import { Amount } from '@/types/amount'

const recordCache = new Map<string, TransactionRecord>()
type TransactionFilterInput = Partial<TransactionFilter> | undefined

async function fetchHistory(walletId: string, filter?: TransactionFilterInput): Promise<TransactionRecord[]> {
  await walletStorageService.initialize()

  const snapshot = await initializeChainConfigs()
  const enabledChains = getEnabledChains(snapshot)
  const enabledMap = new Map(enabledChains.map((config) => [config.id, config]))

  const chainAddresses = await walletStorageService.getWalletChainAddresses(walletId)
  const targetChain = filter?.chain && filter.chain !== 'all' ? filter.chain : null

  const tasks = chainAddresses.flatMap((addressInfo) => {
    if (targetChain && addressInfo.chain !== targetChain) return []

    const config = enabledMap.get(addressInfo.chain) ?? getChainById(snapshot, addressInfo.chain)
    if (!config || !config.enabled) return []

    if (config.type === 'bioforest') {
      const adapter = createBioforestAdapter(config.id)
      return adapter.transaction.getTransactionHistory(addressInfo.address, 50).then((list) =>
        list.map((tx) => mapChainTransaction(tx, config, addressInfo.address))
      )
    }

    try {
      const provider = getChainProvider(addressInfo.chain)
      if (!provider.supportsTransactionHistory || !provider.getTransactionHistory) return []

      return provider.getTransactionHistory(addressInfo.address, 50).then((list) =>
        list.map((tx) => mapProviderTransaction(tx, config, addressInfo.address))
      )
    } catch {
      return []
    }
  })

  const results = await Promise.all(tasks)
  let records = results.flat()

  if (filter) {
    records = filterByChain(records, filter.chain)
    records = filterByPeriod(records, filter.period)
    records = filterByType(records, filter.type)
    records = filterByStatus(records, filter.status)
  }

  records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  recordCache.clear()
  for (const record of records) {
    recordCache.set(record.id, record)
  }

  return records
}

function mapStatus(status: ChainTransaction['status']): TransactionStatus {
  if (status.status === 'confirmed') return 'confirmed'
  if (status.status === 'failed') return 'failed'
  return 'pending'
}

function mapType(tx: ChainTransaction, address: string, rawType?: string): TransactionType {
  // Handle BioForest chain transaction types
  if (rawType) {
    // 安全
    if (rawType.includes('BSE-01')) return 'signature'
    // 权益操作
    if (rawType.includes('AST-02')) return tx.from === address ? 'send' : 'receive'
    if (rawType.includes('AST-03')) return 'destroy'
    if (rawType.includes('AST-04')) return 'gift'
    if (rawType.includes('AST-05')) return 'grab'
    if (rawType.includes('AST-06')) return 'trust'
    if (rawType.includes('AST-07')) return 'signFor'
    if (rawType.includes('AST-08')) return 'emigrate'
    if (rawType.includes('AST-09')) return 'immigrate'
    if (rawType.includes('AST-10') || rawType.includes('AST-11')) return 'exchange'
    if (rawType.includes('AST-12')) return 'stake'
    if (rawType.includes('AST-13')) return 'unstake'
    if (rawType.includes('AST-00')) return 'issueAsset'
    if (rawType.includes('AST-01')) return 'increaseAsset'
    // NFT
    if (rawType.includes('ETY-02') || rawType.includes('ETY-04')) return 'issueEntity'
    if (rawType.includes('ETY-03')) return 'destroyEntity'
    if (rawType.includes('ETY-00') || rawType.includes('ETY-01')) return 'issueAsset'
    // 任意资产
    if (rawType.includes('ANY-00')) return tx.from === address ? 'send' : 'receive'
    if (rawType.includes('ANY-01')) return 'gift'
    if (rawType.includes('ANY-02')) return 'grab'
    if (rawType.includes('ANY-03') || rawType.includes('ANY-04') ||
        rawType.includes('ANY-05') || rawType.includes('ANY-06') ||
        rawType.includes('ANY-07') || rawType.includes('ANY-08')) return 'exchange'
    // 位名
    if (rawType.includes('LNS-')) return 'locationName'
    // DApp
    if (rawType.includes('WOD-')) return 'dapp'
    // 凭证
    if (rawType.includes('CRT-')) return 'certificate'
    // 数据存证
    if (rawType.includes('EXT-00')) return 'mark'
    // 其他 (MTP, PMS, MAC)
    if (rawType.includes('MTP-') || rawType.includes('PMS-') || rawType.includes('MAC-')) return 'other'
  }
  return tx.from === address ? 'send' : 'receive'
}

function mapChainTransaction(tx: ChainTransaction, config: ChainConfig, address: string): TransactionRecord {
  const type = mapType(tx, address, tx.rawType)

  return {
    // Use '--' as separator to avoid URL routing conflicts with ':'
    id: `${config.id}--${tx.hash}`,
    type,
    status: mapStatus(tx.status),
    amount: tx.amount,
    symbol: config.symbol,
    decimals: config.decimals,
    address: type === 'send' ? tx.to : tx.from,
    timestamp: new Date(tx.timestamp),
    hash: tx.hash,
    chain: config.id,
    fee: tx.fee,
    feeSymbol: config.symbol,
    feeDecimals: config.decimals,
    blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined,
    confirmations: tx.status.confirmations,
  }
}

function isSameAddress(left: string, right: string): boolean {
  const a = left.trim()
  const b = right.trim()
  if (a.startsWith('0x') && b.startsWith('0x')) return a.toLowerCase() === b.toLowerCase()
  return a === b
}

function mapProviderTransaction(tx: ProviderTransaction, config: ChainConfig, address: string): TransactionRecord {
  const isOutgoing = isSameAddress(tx.from, address)
  const type: TransactionType = isOutgoing ? 'send' : 'receive'

  return {
    // Use '--' as separator to avoid URL routing conflicts with ':'
    id: `${config.id}--${tx.hash}`,
    type,
    status: tx.status,
    amount: Amount.fromRaw(tx.value, config.decimals, config.symbol),
    symbol: config.symbol,
    decimals: config.decimals,
    address: type === 'send' ? tx.to : tx.from,
    timestamp: new Date(tx.timestamp),
    hash: tx.hash,
    chain: config.id,
    blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined,
    confirmations: undefined,
    fee: undefined,
    feeSymbol: undefined,
    feeDecimals: undefined,
  }
}

function filterByPeriod(records: TransactionRecord[], period: TransactionFilter['period']): TransactionRecord[] {
  if (!period || period === 'all') return records
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return records.filter((tx) => tx.timestamp.getTime() >= cutoff)
}

function filterByType(records: TransactionRecord[], type: TransactionFilter['type']): TransactionRecord[] {
  if (!type || type === 'all') return records
  return records.filter((tx) => tx.type === type)
}

function filterByStatus(records: TransactionRecord[], status: TransactionFilter['status']): TransactionRecord[] {
  if (!status || status === 'all') return records
  return records.filter((tx) => tx.status === status)
}

function filterByChain(records: TransactionRecord[], chain: TransactionFilter['chain']): TransactionRecord[] {
  if (!chain || chain === 'all') return records
  return records.filter((tx) => tx.chain === chain)
}

export const transactionService = transactionServiceMeta.impl({
  async getHistory({ walletId, filter }) {
    return fetchHistory(walletId, filter)
  },

  async getTransaction({ id }) {
    return recordCache.get(id) ?? null
  },

  async refresh({ walletId }) {
    await fetchHistory(walletId, { chain: 'all', period: 'all', type: 'all', status: 'all' })
  },
})
