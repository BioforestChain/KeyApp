/**
 * Transaction 服务 - Web 平台实现
 */

import { transactionServiceMeta, type TransactionFilter, type TransactionRecord, type TransactionStatus, type TransactionType } from './types'
import { walletStorageService } from '@/services/wallet-storage'
import { initialize as initializeChainConfigs, getEnabledChains, getChainById, type ChainConfig } from '@/services/chain-config'
import { createBioforestAdapter, type Transaction as ChainTransaction } from '@/services/chain-adapter'
import { formatAssetAmount } from '@/types/asset'

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
    if (!config || !config.enabled || config.type !== 'bioforest') return []

    const adapter = createBioforestAdapter(config)
    return adapter.transaction.getTransactionHistory(addressInfo.address, 50).then((list) =>
      list.map((tx) => mapChainTransaction(tx, config, addressInfo.address))
    )
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

function mapType(tx: ChainTransaction, address: string): TransactionType {
  return tx.from === address ? 'send' : 'receive'
}

function mapChainTransaction(tx: ChainTransaction, config: ChainConfig, address: string): TransactionRecord {
  const type = mapType(tx, address)
  const amount = formatAssetAmount(tx.amount.toString(), config.decimals)
  const fee = formatAssetAmount(tx.fee.toString(), config.decimals)

  return {
    id: `${config.id}:${tx.hash}`,
    type,
    status: mapStatus(tx.status),
    amount,
    symbol: config.symbol,
    address: type === 'send' ? tx.to : tx.from,
    timestamp: new Date(tx.timestamp),
    hash: tx.hash,
    chain: config.id,
    fee,
    feeSymbol: config.symbol,
    blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined,
    confirmations: tx.status.confirmations,
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
