/**
 * Transaction 服务 - Mock 实现
 */

import { Amount } from '@/types/amount'
import { transactionServiceMeta, type ITransactionMockController, type TransactionRecord, type TransactionFilter, type TransactionType, type TransactionStatus } from './types'
import type { ChainType } from '@/stores'

// ==================== 工具函数 ====================

function randomAddress(): string {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)]
  return addr
}

function randomHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)]
  return hash
}

// Decimals for different tokens
const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18, USDT: 6, USDC: 6, TRX: 6, BTC: 8, BNB: 18, BUSD: 18, BFM: 8,
  BFC: 8, CC: 8, PM: 8, BTG: 8, BIW: 8, ETHM: 18, MAL: 8, TOKEN: 18,
}

function generateInitialTransactions(count: number = 30): TransactionRecord[] {
  const types: TransactionType[] = ['send', 'receive', 'exchange', 'stake', 'unstake']
  const statuses: TransactionStatus[] = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed']
  const chains: ChainType[] = ['ethereum', 'tron', 'bitcoin', 'binance', 'bfmeta']
  const symbols: Record<ChainType, string[]> = {
    ethereum: ['ETH', 'USDT', 'USDC'],
    tron: ['TRX', 'USDT'],
    bitcoin: ['BTC'],
    binance: ['BNB', 'BUSD'],
    bfmeta: ['BFM'],
    bfchainv2: ['BFC'],
    ccchain: ['CC'],
    pmchain: ['PM'],
    btgmeta: ['BTG'],
    biwmeta: ['BIW'],
    ethmeta: ['ETHM'],
    malibu: ['MAL'],
  }

  const now = Date.now()
  const transactions: TransactionRecord[] = []

  for (let i = 0; i < count; i++) {
    const chain = chains[Math.floor(Math.random() * chains.length)]!
    const chainSymbols = symbols[chain] || ['TOKEN']
    const type = types[Math.floor(Math.random() * types.length)]!
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    const symbol = chainSymbols[Math.floor(Math.random() * chainSymbols.length)]!
    const decimals = TOKEN_DECIMALS[symbol] ?? 18
    const feeSymbol = chain === 'ethereum' ? 'ETH' : chain === 'tron' ? 'TRX' : symbol
    const feeDecimals = TOKEN_DECIMALS[feeSymbol] ?? 18

    const daysAgo = Math.floor(Math.random() * 90)
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000)

    const amountStr = (Math.random() * 100).toFixed(type === 'exchange' ? 2 : 4)
    const feeStr = (Math.random() * 0.01).toFixed(6)

    transactions.push({
      id: `tx-${i}-${Date.now()}`,
      type,
      status,
      amount: Amount.fromFormatted(amountStr, decimals, symbol),
      symbol,
      decimals,
      address: randomAddress(),
      timestamp,
      hash: randomHash(),
      chain,
      fee: Amount.fromFormatted(feeStr, feeDecimals, feeSymbol),
      feeSymbol,
      feeDecimals,
      blockNumber: status === 'confirmed' ? Math.floor(Math.random() * 1000000) + 18000000 : undefined,
      confirmations: status === 'confirmed' ? Math.floor(Math.random() * 100) + 1 : 0,
    })
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function filterByPeriod(transactions: TransactionRecord[], period: string): TransactionRecord[] {
  if (period === 'all') return transactions
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return transactions.filter((tx) => tx.timestamp.getTime() >= cutoff)
}

function filterByChain(transactions: TransactionRecord[], chain: ChainType | 'all'): TransactionRecord[] {
  if (chain === 'all') return transactions
  return transactions.filter((tx) => tx.chain === chain)
}

// ==================== Mock 状态 ====================

let transactions = generateInitialTransactions(30)
let delayMs = 200
let simulatedError: Error | null = null

async function delay(): Promise<void> {
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
}

function checkError(): void {
  if (simulatedError) throw simulatedError
}

// ==================== Service Implementation ====================

export const transactionService = transactionServiceMeta.impl({
  async getHistory({ walletId: _walletId, filter }) {
    await delay()
    checkError()

    let result = [...transactions]
    const f = filter as TransactionFilter | undefined

    if (f?.chain && f.chain !== 'all') {
      result = filterByChain(result, f.chain)
    }
    if (f?.period && f.period !== 'all') {
      result = filterByPeriod(result, f.period)
    }
    if (f?.type && f.type !== 'all') {
      result = result.filter((tx) => tx.type === f.type)
    }
    if (f?.status && f.status !== 'all') {
      result = result.filter((tx) => tx.status === f.status)
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  async getTransaction({ id }) {
    await delay()
    checkError()
    return transactions.find((tx) => tx.id === id) ?? null
  },

  async refresh() {
    await delay()
    checkError()
  },
})

// ==================== Mock Controller ====================

export const transactionMockController: ITransactionMockController = {
  _resetData() {
    transactions = generateInitialTransactions(30)
    simulatedError = null
  },
  _addTransaction(tx) {
    transactions.unshift(tx)
  },
  _setDelay(ms) {
    delayMs = ms
  },
  _simulateError(error) {
    simulatedError = error
  },
}
