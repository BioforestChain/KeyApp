/**
 * Staking 服务 - Mock 实现
 */

import { Amount } from '@/types/amount'
import { stakingServiceMeta, type IStakingMockController } from './types'
import type {
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  LogoUrlMap,
} from '@/types/staking'

// ==================== Mock 数据 ====================

const initialRechargeConfig: RechargeConfig = {
  bfmeta: {
    BFM: {
      assetType: 'BFM',
      logo: '/tokens/bfm.svg',
      supportChain: {
        BSC: { assetType: 'BFM', contract: '0x1234...', decimals: 18 },
        ETH: { assetType: 'BFM', contract: '0x5678...', decimals: 18 },
      },
    },
    USDT: {
      assetType: 'USDT',
      logo: '/tokens/usdt.svg',
      supportChain: {
        BSC: { assetType: 'USDT', contract: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 },
        ETH: { assetType: 'USDT', contract: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
        TRON: { assetType: 'USDT', contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
      },
    },
  },
  bfchain: {
    BFC: {
      assetType: 'BFC',
      logo: '/tokens/bfc.svg',
      supportChain: {
        BSC: { assetType: 'BFC', contract: '0xabcd...', decimals: 18 },
      },
    },
  },
}

const initialLogoUrls: LogoUrlMap = {
  BFMeta: { BFM: '/tokens/bfm.svg', USDT: '/tokens/usdt.svg' },
  BFChain: { BFC: '/tokens/bfc.svg' },
  BSC: { BFM: '/tokens/bfm.svg', USDT: '/tokens/usdt.svg', BFC: '/tokens/bfc.svg' },
  ETH: { BFM: '/tokens/bfm.svg', USDT: '/tokens/usdt.svg' },
  TRON: { USDT: '/tokens/usdt.svg' },
}

const initialOverview: StakingOverviewItem[] = [
  {
    chain: 'BFMeta',
    assetType: 'BFM',
    stakedAmount: Amount.fromFormatted('10000', 18, 'BFM'),
    stakedFiat: '$1,234.56',
    availableChains: ['ETH', 'BSC'],
    logoUrl: '/tokens/bfm.svg',
    totalMinted: Amount.fromRaw('1250000000000000000000000', 18, 'BFM'),
    totalCirculation: Amount.fromRaw('980000000000000000000000', 18, 'BFM'),
    totalBurned: Amount.fromRaw('270000000000000000000000', 18, 'BFM'),
    totalStaked: Amount.fromRaw('1250000000000000000000000', 18, 'BFM'),
    externalChain: 'BSC',
    externalAssetType: 'BFM',
  },
  {
    chain: 'BFMeta',
    assetType: 'USDT',
    stakedAmount: Amount.fromFormatted('5000', 6, 'USDT'),
    stakedFiat: '$5,000.00',
    availableChains: ['ETH', 'BSC', 'TRON'],
    logoUrl: '/tokens/usdt.svg',
    totalMinted: Amount.fromRaw('8500000000000', 6, 'USDT'),
    totalCirculation: Amount.fromRaw('7200000000000', 6, 'USDT'),
    totalBurned: Amount.fromRaw('1300000000000', 6, 'USDT'),
    totalStaked: Amount.fromRaw('8500000000000', 6, 'USDT'),
    externalChain: 'ETH',
    externalAssetType: 'USDT',
  },
  {
    chain: 'BFChain',
    assetType: 'BFC',
    stakedAmount: Amount.fromFormatted('2500', 18, 'BFC'),
    stakedFiat: '$625.00',
    availableChains: ['BSC'],
    logoUrl: '/tokens/bfc.svg',
    totalMinted: Amount.fromRaw('450000000000000000000000', 18, 'BFC'),
    totalCirculation: Amount.fromRaw('380000000000000000000000', 18, 'BFC'),
    totalBurned: Amount.fromRaw('70000000000000000000000', 18, 'BFC'),
    totalStaked: Amount.fromRaw('450000000000000000000000', 18, 'BFC'),
    externalChain: 'BSC',
    externalAssetType: 'BFC',
  },
]

const initialTransactions: StakingTransaction[] = [
  {
    id: 'tx-001',
    type: 'mint',
    sourceChain: 'BSC',
    sourceAsset: 'USDT',
    sourceAmount: Amount.fromRaw('1000000000000000000000', 18, 'USDT'),
    targetChain: 'BFMeta',
    targetAsset: 'USDT',
    targetAmount: Amount.fromRaw('1000000000000000000000', 18, 'USDT'),
    status: 'confirmed',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000 + 300000,
  },
  {
    id: 'tx-002',
    type: 'burn',
    sourceChain: 'BFMeta',
    sourceAsset: 'BFM',
    sourceAmount: Amount.fromRaw('500000000000000000000', 18, 'BFM'),
    targetChain: 'ETH',
    targetAsset: 'BFM',
    targetAmount: Amount.fromRaw('500000000000000000000', 18, 'BFM'),
    status: 'confirming',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
  },
]

// ==================== Mock 状态 ====================

let rechargeConfig = { ...initialRechargeConfig }
let logoUrls = { ...initialLogoUrls }
let overview = [...initialOverview]
let transactions = [...initialTransactions]
let delayMs = 200
let simulatedError: Error | null = null

async function delay(): Promise<void> {
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
}

function checkError(): void {
  if (simulatedError) throw simulatedError
}

// ==================== Service Implementation ====================

export const stakingService = stakingServiceMeta.impl({
  async getRechargeConfig() {
    await delay()
    checkError()
    return rechargeConfig
  },

  async getLogoUrls() {
    await delay()
    checkError()
    return logoUrls
  },

  async getOverview() {
    await delay()
    checkError()
    return overview
  },

  async getTransactions() {
    await delay()
    checkError()
    return [...transactions].toSorted((a, b) => b.createdAt - a.createdAt)
  },

  async getTransaction({ id }) {
    await delay()
    checkError()
    return transactions.find((tx) => tx.id === id) ?? null
  },

  async submitMint(request) {
    await delay()
    checkError()
    const tx: StakingTransaction = {
      id: `tx-${Date.now()}`,
      type: 'mint',
      sourceChain: request.sourceChain,
      sourceAsset: request.sourceAsset,
      sourceAmount: request.amount,
      targetChain: request.targetChain,
      targetAsset: request.targetAsset,
      targetAmount: request.amount,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    transactions.unshift(tx)
    return tx
  },

  async submitBurn(request) {
    await delay()
    checkError()
    const tx: StakingTransaction = {
      id: `tx-${Date.now()}`,
      type: 'burn',
      sourceChain: request.sourceChain,
      sourceAsset: request.sourceAsset,
      sourceAmount: request.amount,
      targetChain: request.targetChain,
      targetAsset: request.targetAsset,
      targetAmount: request.amount,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    transactions.unshift(tx)
    return tx
  },
})

// ==================== Mock Controller ====================

export const stakingMockController: IStakingMockController = {
  _resetData() {
    rechargeConfig = { ...initialRechargeConfig }
    logoUrls = { ...initialLogoUrls }
    overview = [...initialOverview]
    transactions = [...initialTransactions]
    simulatedError = null
  },
  _setOverview(data) {
    overview = [...data]
  },
  _setDelay(ms) {
    delayMs = ms
  },
  _simulateError(error) {
    simulatedError = error
  },
}
