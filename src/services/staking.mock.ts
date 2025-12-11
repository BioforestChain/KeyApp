/**
 * Mock Staking Service
 * Provides test data for staking UI development
 */

import type {
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  MintRequest,
  BurnRequest,
  LogoUrlMap,
} from '@/types/staking'

/** Mock recharge configuration */
export const mockRechargeConfig: RechargeConfig = {
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

/** Mock logo URLs */
export const mockLogoUrls: LogoUrlMap = {
  BFMeta: {
    BFM: '/tokens/bfm.svg',
    USDT: '/tokens/usdt.svg',
  },
  BFChain: {
    BFC: '/tokens/bfc.svg',
  },
  BSC: {
    BFM: '/tokens/bfm.svg',
    USDT: '/tokens/usdt.svg',
    BFC: '/tokens/bfc.svg',
  },
  ETH: {
    BFM: '/tokens/bfm.svg',
    USDT: '/tokens/usdt.svg',
  },
  TRON: {
    USDT: '/tokens/usdt.svg',
  },
}

/** Mock staking overview */
export const mockStakingOverview: StakingOverviewItem[] = [
  {
    chain: 'BFMeta',
    assetType: 'BFM',
    stakedAmount: '10,000.00',
    stakedFiat: '$1,234.56',
    availableChains: ['ETH', 'BSC'],
    logoUrl: '/tokens/bfm.svg',
    totalMinted: '1250000',
    totalCirculation: '980000',
    totalBurned: '270000',
    totalStaked: '1250000',
    externalChain: 'BSC',
    externalAssetType: 'BFM',
  },
  {
    chain: 'BFMeta',
    assetType: 'USDT',
    stakedAmount: '5,000.00',
    stakedFiat: '$5,000.00',
    availableChains: ['ETH', 'BSC', 'TRON'],
    logoUrl: '/tokens/usdt.svg',
    totalMinted: '8500000',
    totalCirculation: '7200000',
    totalBurned: '1300000',
    totalStaked: '8500000',
    externalChain: 'ETH',
    externalAssetType: 'USDT',
  },
  {
    chain: 'BFChain',
    assetType: 'BFC',
    stakedAmount: '2,500.00',
    stakedFiat: '$625.00',
    availableChains: ['BSC'],
    logoUrl: '/tokens/bfc.svg',
    totalMinted: '450000',
    totalCirculation: '380000',
    totalBurned: '70000',
    totalStaked: '450000',
    externalChain: 'BSC',
    externalAssetType: 'BFC',
  },
]

/** Mock transaction history */
export const mockTransactions: StakingTransaction[] = [
  {
    id: 'tx-001',
    type: 'mint',
    sourceChain: 'BSC',
    sourceAsset: 'USDT',
    sourceAmount: '1000000000000000000000',
    targetChain: 'BFMeta',
    targetAsset: 'USDT',
    targetAmount: '1000000000000000000000',
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
    sourceAmount: '500000000000000000000',
    targetChain: 'ETH',
    targetAsset: 'BFM',
    targetAmount: '500000000000000000000',
    status: 'confirming',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'tx-003',
    type: 'mint',
    sourceChain: 'TRON',
    sourceAsset: 'USDT',
    sourceAmount: '2000000000',
    targetChain: 'BFMeta',
    targetAsset: 'USDT',
    targetAmount: '2000000000',
    status: 'pending',
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 600000,
  },
]

/** Simulated network delay */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock Staking Service
 */
export const mockStakingService = {
  /** Get recharge configuration */
  async getRechargeConfig(): Promise<RechargeConfig> {
    await delay(200)
    return mockRechargeConfig
  },

  /** Get logo URLs */
  async getLogoUrls(): Promise<LogoUrlMap> {
    await delay(100)
    return mockLogoUrls
  },

  /** Get staking overview */
  async getOverview(): Promise<StakingOverviewItem[]> {
    await delay(300)
    return mockStakingOverview
  },

  /** Get transaction history */
  async getTransactions(): Promise<StakingTransaction[]> {
    await delay(200)
    return [...mockTransactions].sort((a, b) => b.createdAt - a.createdAt)
  },

  /** Get transaction by ID */
  async getTransaction(id: string): Promise<StakingTransaction | null> {
    await delay(100)
    return mockTransactions.find((tx) => tx.id === id) ?? null
  },

  /** Submit mint (stake) request */
  async submitMint(request: MintRequest): Promise<StakingTransaction> {
    await delay(500)
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
    mockTransactions.unshift(tx)
    return tx
  },

  /** Submit burn (unstake) request */
  async submitBurn(request: BurnRequest): Promise<StakingTransaction> {
    await delay(500)
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
    mockTransactions.unshift(tx)
    return tx
  },
}

export type StakingService = typeof mockStakingService
