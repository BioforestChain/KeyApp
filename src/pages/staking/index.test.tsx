/**
 * Staking Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Amount } from '@/types/amount'
import { StakingPage } from './index'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        title: 'Staking',
        overview: 'Overview',
        mint: 'Mint',
        burn: 'Burn',
        noStakedAssets: 'No staked assets',
        mintDescription: 'Convert external tokens to internal chain',
        burnDescription: 'Convert internal tokens to external chain',
        loading: 'Loading',
        searchPlaceholder: 'Token name or contract',
        selectNetwork: 'Select Network',
        allNetworks: 'All Networks',
        noResults: 'No results found',
        totalMinted: `Total ${params?.asset ?? ''} minted`,
        totalCirculation: `${params?.asset ?? ''} circulation`,
        totalBurned: `Total ${params?.asset ?? ''} redeemed`,
        totalStaked: `Total ${params?.asset ?? ''} staked`,
        sourceChain: 'Source Chain',
        targetChain: 'Target Chain',
        selectChain: 'Select Chain',
        selectToken: 'Select Token',
        availableBalance: 'Available Balance',
        max: 'Max',
        amount: 'Amount',
        confirm: 'Confirm',
        invalidAmount: 'Invalid amount',
        insufficientBalance: 'Insufficient balance',
      }
      return translations[key] ?? key
    },
  }),
}))

// Mock Stackflow
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: vi.fn() }),
  useActivityParams: () => ({}),
}))

// Create mock data with Amount objects
const createMockOverview = () => [
  {
    chain: 'BFMeta' as const,
    assetType: 'BFM',
    stakedAmount: Amount.fromFormatted('10000', 18, 'BFM'),
    stakedFiat: '$1,234.56',
    availableChains: ['ETH', 'BSC'] as ('ETH' | 'BSC' | 'TRON')[],
    totalMinted: Amount.fromRaw('1250000000000000000000000', 18, 'BFM'),
    totalCirculation: Amount.fromRaw('980000000000000000000000', 18, 'BFM'),
    totalBurned: Amount.fromRaw('270000000000000000000000', 18, 'BFM'),
    totalStaked: Amount.fromRaw('1250000000000000000000000', 18, 'BFM'),
    externalChain: 'BSC' as const,
    externalAssetType: 'BFM',
  },
]

// Mock staking service
vi.mock('@/services/staking', () => ({
  stakingService: {
    getOverview: vi.fn(),
    getRechargeConfig: vi.fn().mockResolvedValue({
      bfmeta: {
        BFM: {
          assetType: 'BFM',
          logo: '/tokens/bfm.svg',
          supportChain: {
            BSC: { assetType: 'BFM', contract: '0x1234...', decimals: 18 },
            ETH: { assetType: 'BFM', contract: '0x5678...', decimals: 18 },
          },
        },
      },
    }),
    submitMint: vi.fn().mockResolvedValue({
      id: 'tx-123',
      type: 'mint',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    submitBurn: vi.fn().mockResolvedValue({
      id: 'tx-burn-123',
      type: 'burn',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  },
}))

describe('StakingPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { stakingService } = await import('@/services/staking')
    vi.mocked(stakingService.getOverview).mockResolvedValue(createMockOverview())
  })

  it('renders page header with title', () => {
    render(<StakingPage />)
    expect(screen.getByText('Staking')).toBeInTheDocument()
  })

  it('renders tab navigation with all tabs', () => {
    render(<StakingPage />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Mint')).toBeInTheDocument()
    expect(screen.getByText('Burn')).toBeInTheDocument()
  })

  it('shows loading state initially on overview tab', () => {
    render(<StakingPage />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('shows pool cards after loading', async () => {
    render(<StakingPage />)

    await waitFor(() => {
      // BFM appears multiple times (external and internal asset)
      expect(screen.getAllByText('BFM').length).toBeGreaterThan(0)
    })
  })

  it('switches to mint tab on click', async () => {
    render(<StakingPage />)

    fireEvent.click(screen.getByText('Mint'))

    expect(screen.getByText('Convert external tokens to internal chain')).toBeInTheDocument()
  })

  it('switches to burn tab on click', () => {
    render(<StakingPage />)

    fireEvent.click(screen.getByText('Burn'))

    expect(screen.getByText('Convert internal tokens to external chain')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    render(<StakingPage />)

    const overviewTab = screen.getByText('Overview')
    expect(overviewTab).toHaveClass('text-primary')

    fireEvent.click(screen.getByText('Mint'))

    const mintTab = screen.getByText('Mint')
    expect(mintTab).toHaveClass('text-primary')
  })

  it('switches back to overview from other tabs', async () => {
    render(<StakingPage />)

    // Switch to mint
    fireEvent.click(screen.getByText('Mint'))
    expect(screen.getByText('Convert external tokens to internal chain')).toBeInTheDocument()

    // Switch back to overview
    fireEvent.click(screen.getByText('Overview'))

    await waitFor(() => {
      // BFM appears multiple times (external and internal asset)
      expect(screen.getAllByText('BFM').length).toBeGreaterThan(0)
    })
  })
})
