/**
 * Transaction 服务 - Web 平台实现
 */

import { transactionServiceMeta, type TransactionFilter, type TransactionRecord, type TransactionStatus, type TransactionType } from './types'
import { walletStorageService } from '@/services/wallet-storage'
import { initialize as initializeChainConfigs, getEnabledChains, getChainById, type ChainConfig } from '@/services/chain-config'
import { getChainProvider, type Transaction as ProviderTransaction, isSupported, InvalidDataError } from '@/services/chain-adapter/providers'
import { Amount } from '@/types/amount'
import { mapActionToTransactionType } from '@/components/transaction/transaction-meta'

const recordCache = new Map<string, TransactionRecord>()
type TransactionFilterInput = Partial<TransactionFilter> | undefined

function parseRecordId(id: string): { chainId: string; hash: string } | null {
  const [chainId, hash] = id.split('--')
  if (!chainId || !hash) return null
  return { chainId, hash }
}

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

    try {
      const provider = getChainProvider(addressInfo.chain)

      return provider.getTransactionHistory(addressInfo.address, 50).then((result) => {
        if (!isSupported(result)) return []
        return result.data.map((tx) => mapProviderTransaction(tx, config))
      })
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

// mapProviderType removed - use mapActionToTransactionType from transaction-meta.ts

function getPrimaryFungibleAsset(
  tx: ProviderTransaction,
  fallback: { symbol: string; decimals: number },
): { value: string; symbol: string; decimals: number } {
  const primary = tx.assets.find((a) => a.assetType === 'native' || a.assetType === 'token')
  if (!primary) return { value: '0', symbol: fallback.symbol, decimals: fallback.decimals }
  return { value: primary.value, symbol: primary.symbol, decimals: primary.decimals }
}

function mapProviderTransaction(tx: ProviderTransaction, config: ChainConfig): TransactionRecord {
  const type = mapActionToTransactionType(tx.action, tx.direction)
  const primaryAsset = getPrimaryFungibleAsset(tx, { symbol: config.symbol, decimals: config.decimals })

  const isTransfer = tx.action === 'transfer'
  const counterpartyAddress = isTransfer
    ? (tx.direction === 'out' ? tx.to : tx.from)
    : (tx.contract?.address ?? tx.to ?? tx.from)

  return {
    // Use '--' as separator to avoid URL routing conflicts with ':'
    id: `${config.id}--${tx.hash}`,
    type,
    status: tx.status,
    amount: Amount.fromRaw(primaryAsset.value, primaryAsset.decimals, primaryAsset.symbol),
    symbol: primaryAsset.symbol,
    decimals: primaryAsset.decimals,
    address: counterpartyAddress,
    timestamp: new Date(tx.timestamp),
    hash: tx.hash,
    chain: config.id,
    blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined,
    confirmations: undefined,
    fee: tx.fee ? Amount.fromRaw(tx.fee.value, tx.fee.decimals, tx.fee.symbol) : undefined,
    feeSymbol: tx.fee?.symbol,
    feeDecimals: tx.fee?.decimals,
    from: tx.from,
    to: tx.to,
    action: tx.action,
    direction: tx.direction,
    assets: tx.assets,
    contract: tx.contract,
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
    const cached = recordCache.get(id)
    if (cached) return cached

    const parsed = parseRecordId(id)
    if (!parsed) return null

    const snapshot = await initializeChainConfigs()
    const config = getChainById(snapshot, parsed.chainId)
    if (!config || !config.enabled) return null

    try {
      const provider = getChainProvider(config.id)
      if (!provider.getTransaction) return null

      const tx = await provider.getTransaction(parsed.hash)
      if (!tx) return null

      const record = mapProviderTransaction(tx, config)
      recordCache.set(record.id, record)
      return record
    } catch (error) {
      if (error instanceof InvalidDataError) throw error
      return null
    }
  },

  async refresh({ walletId }) {
    await fetchHistory(walletId, { chain: 'all', period: 'all', type: 'all', status: 'all' })
  },
})
