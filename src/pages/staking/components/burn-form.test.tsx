/**
 * BurnForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BurnForm } from './burn-form'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loading: 'Loading',
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
        noResults: 'No results found',
      }
      return translations[key] ?? key
    },
  }),
}))

// Mock staking service
vi.mock('@/services/staking', () => ({
  stakingService: {
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
        USDT: {
          assetType: 'USDT',
          logo: '/tokens/usdt.svg',
          supportChain: {
            BSC: { assetType: 'USDT', contract: '0xabcd...', decimals: 18 },
            TRON: { assetType: 'USDT', contract: 'TR7...', decimals: 6 },
          },
        },
      },
      bfchain: {
        BFC: {
          assetType: 'BFC',
          logo: '/tokens/bfc.svg',
          supportChain: {
            BSC: { assetType: 'BFC', contract: '0xefgh...', decimals: 18 },
          },
        },
      },
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

describe('BurnForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<BurnForm />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders form after loading', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText('Source Chain')).toBeInTheDocument()
    })

    expect(screen.getByText('Target Chain')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('shows default source chain as BFMeta', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText('BFMeta')).toBeInTheDocument()
    })
  })

  it('shows available balance', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText(/Available Balance/)).toBeInTheDocument()
    })
  })

  it('has max button', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('has amount input', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })
  })

  it('confirm button is disabled without amount', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmButton).toBeDisabled()
    })
  })

  it('opens source chain selection sheet on click', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText('BFMeta')).toBeInTheDocument()
    })

    // Click the chain selector
    const chainButton = screen.getByText('BFMeta').closest('button')
    if (chainButton) {
      fireEvent.click(chainButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Select Chain')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid amount', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('0.00')
    fireEvent.change(input, { target: { value: 'abc' } })

    await waitFor(() => {
      expect(screen.getByText('Invalid amount')).toBeInTheDocument()
    })
  })

  it('shows insufficient balance error', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('0.00')
    // Enter amount greater than mock balance (5000.00 for BFMeta BFM)
    fireEvent.change(input, { target: { value: '999999' } })

    await waitFor(() => {
      expect(screen.getByText('Insufficient balance')).toBeInTheDocument()
    })
  })

  it('enables confirm button with valid amount', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('0.00')
    fireEvent.change(input, { target: { value: '100' } })

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmButton).not.toBeDisabled()
    })
  })

  it('calls onSuccess after successful submission', async () => {
    const onSuccess = vi.fn()
    render(<BurnForm onSuccess={onSuccess} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('0.00')
    fireEvent.change(input, { target: { value: '100' } })

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmButton).not.toBeDisabled()
    })

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('tx-burn-123')
    })
  })

  it('shows arrow between source and target', async () => {
    render(<BurnForm />)

    await waitFor(() => {
      expect(screen.getByText('Source Chain')).toBeInTheDocument()
    })

    // The arrow is rendered as a lucide icon, check for the container
    const arrowContainer = document.querySelector('.rounded-full.bg-muted.p-2')
    expect(arrowContainer).toBeInTheDocument()
  })
})
