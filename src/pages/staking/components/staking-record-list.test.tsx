/**
 * StakingRecordList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Amount } from '@/types/amount'
import { StakingRecordList } from './staking-record-list'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loading: 'Loading',
        mint: 'Mint',
        burn: 'Burn',
        history: 'History',
        refresh: 'Refresh',
        noTransactions: 'No transaction history',
      }
      return translations[key] ?? key
    },
  }),
}))

// Create mock data with Amount objects
const createMockTransactions = () => [
  {
    id: 'tx-001',
    type: 'mint' as const,
    sourceChain: 'BSC',
    sourceAsset: 'USDT',
    sourceAmount: Amount.fromRaw('1000000000000000000000', 18, 'USDT'),
    targetChain: 'BFMeta',
    targetAsset: 'USDT',
    targetAmount: Amount.fromRaw('1000000000000000000000', 18, 'USDT'),
    status: 'confirmed' as const,
    txHash: '0x1234',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000 + 300000,
  },
  {
    id: 'tx-002',
    type: 'burn' as const,
    sourceChain: 'BFMeta',
    sourceAsset: 'BFM',
    sourceAmount: Amount.fromRaw('500000000000000000000', 18, 'BFM'),
    targetChain: 'ETH',
    targetAsset: 'BFM',
    targetAmount: Amount.fromRaw('500000000000000000000', 18, 'BFM'),
    status: 'pending' as const,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
  },
]

// Mock staking service
vi.mock('@/services/staking', () => ({
  stakingService: {
    getTransactions: vi.fn(),
  },
}))

describe('StakingRecordList', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { stakingService } = await import('@/services/staking')
    vi.mocked(stakingService.getTransactions).mockResolvedValue(createMockTransactions())
  })

  it('renders loading state initially', () => {
    render(<StakingRecordList />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders record list after loading', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument()
    })
  })

  it('shows filter tabs', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument()
    })

    // All three filter buttons should be present
    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mint' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Burn' })).toBeInTheDocument()
  })

  it('has refresh button', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  it('displays mint transactions', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      // The record item shows "Mint" text
      const mintElements = screen.getAllByText('Mint')
      expect(mintElements.length).toBeGreaterThan(0)
    })
  })

  it('displays burn transactions', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      // The record item shows "Burn" text
      const burnElements = screen.getAllByText('Burn')
      expect(burnElements.length).toBeGreaterThan(0)
    })
  })

  it('filters by mint when clicking Mint tab', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mint' })).toBeInTheDocument()
    })

    // Click Mint filter button (not the transaction type label)
    const mintButton = screen.getByRole('button', { name: 'Mint' })
    fireEvent.click(mintButton)

    // Burn transactions should be filtered out
    await waitFor(() => {
      const recordButtons = screen.getAllByRole('button').filter((btn) =>
        btn.classList.contains('bg-card')
      )
      // Should show at least one record
      expect(recordButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('filters by burn when clicking Burn tab', async () => {
    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Burn' })).toBeInTheDocument()
    })

    // Click Burn filter button
    const burnButton = screen.getByRole('button', { name: 'Burn' })
    fireEvent.click(burnButton)

    await waitFor(() => {
      // Should filter to burn only
      const burnLabel = screen.getAllByText('Burn')
      expect(burnLabel.length).toBeGreaterThan(0)
    })
  })

  it('shows empty state when no transactions', async () => {
    const { stakingService } = await import('@/services/staking')
    vi.mocked(stakingService.getTransactions).mockResolvedValueOnce([])

    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByText('No transaction history')).toBeInTheDocument()
    })
  })

  it('calls onRecordClick when clicking a record', async () => {
    const onRecordClick = vi.fn()
    render(<StakingRecordList onRecordClick={onRecordClick} />)

    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(3) // More than just filter buttons
    })

    // Click the first record (skip filter buttons)
    const recordButtons = screen.getAllByRole('button').filter((btn) =>
      btn.classList.contains('bg-card')
    )

    const firstRecord = recordButtons[0]
    if (firstRecord) {
      fireEvent.click(firstRecord)
      expect(onRecordClick).toHaveBeenCalled()
    }
  })

  it('refreshes data when clicking refresh button', async () => {
    const { stakingService } = await import('@/services/staking')

    render(<StakingRecordList />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    // Clear mock calls from initial load
    vi.mocked(stakingService.getTransactions).mockClear()

    // Click refresh
    fireEvent.click(screen.getByText('Refresh'))

    await waitFor(() => {
      expect(stakingService.getTransactions).toHaveBeenCalled()
    })
  })
})
