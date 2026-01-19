import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChainIcon, ChainBadge } from './chain-icon'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getIcon: vi.fn((chainId: string) => {
      // 返回 null 以测试 fallback 行为
      return null
    }),
    getSymbol: vi.fn((chainId: string) => {
      const symbols: Record<string, string> = {
        ethereum: 'ETH',
        tron: 'TRX',
        bsc: 'BNB',
        bitcoin: 'BTC',
        bfmeta: 'BFM',
        ccchain: 'CCC',
        pmchain: 'PMC',
      }
      return symbols[chainId] ?? chainId.slice(0, 4).toUpperCase()
    }),
    getName: vi.fn((chainId: string) => {
      const names: Record<string, string> = {
        ethereum: 'Ethereum',
        tron: 'Tron',
        bsc: 'BSC',
        bitcoin: 'Bitcoin',
        bfmeta: 'BFMeta',
        ccchain: 'CCChain',
        pmchain: 'PMChain',
      }
      return names[chainId] ?? chainId
    }),
  },
}))

describe('ChainIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct aria-label from symbol', () => {
    render(<ChainIcon chainId="ethereum" />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('displays first letter of symbol as fallback', () => {
    render(<ChainIcon chainId="ethereum" />)
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { rerender } = render(<ChainIcon chainId="ethereum" size="sm" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('size-5')

    rerender(<ChainIcon chainId="ethereum" size="lg" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('size-10')
  })

  it('applies fallback background color when no icon', () => {
    render(<ChainIcon chainId="ethereum" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('bg-muted')
  })

  it('renders all supported chains with correct symbols', () => {
    const chains = ['ethereum', 'tron', 'bsc', 'bitcoin', 'bfmeta', 'ccchain', 'pmchain'] as const
    const labels = {
      ethereum: 'ETH',
      tron: 'TRX',
      bsc: 'BNB',
      bitcoin: 'BTC',
      bfmeta: 'BFM',
      ccchain: 'CCC',
      pmchain: 'PMC',
    } as const
    chains.forEach((chain) => {
      const { unmount } = render(<ChainIcon chainId={chain} />)
      expect(screen.getByLabelText(labels[chain])).toBeInTheDocument()
      unmount()
    })
  })

  it('uses iconUrl prop when provided', () => {
    render(<ChainIcon chainId="ethereum" iconUrl="/test-icon.png" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/test-icon.png')
  })

  it('uses symbol prop when provided', () => {
    render(<ChainIcon chainId="ethereum" symbol="CUSTOM" />)
    expect(screen.getByLabelText('CUSTOM')).toBeInTheDocument()
  })

  it('supports legacy chain prop', () => {
    render(<ChainIcon chain="ethereum" />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })
})

describe('ChainBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chain icon and name', () => {
    render(<ChainBadge chainId="ethereum" />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('renders all chain badges with correct names', () => {
    const chains = ['ethereum', 'tron', 'bitcoin'] as const
    const names = {
      ethereum: 'Ethereum',
      tron: 'Tron',
      bitcoin: 'Bitcoin',
    } as const
    chains.forEach((chain) => {
      const { unmount } = render(<ChainBadge chainId={chain} />)
      expect(screen.getByText(names[chain])).toBeInTheDocument()
      unmount()
    })
  })

  it('uses symbol prop for label when provided', () => {
    render(<ChainBadge chainId="ethereum" symbol="CUSTOM" />)
    expect(screen.getByText('CUSTOM')).toBeInTheDocument()
  })

  it('supports legacy chain prop', () => {
    render(<ChainBadge chain="ethereum" />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })
})
