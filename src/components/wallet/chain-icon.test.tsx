import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChainIcon, ChainBadge } from './chain-icon'

describe('ChainIcon', () => {
  it('renders with correct aria-label', () => {
    render(<ChainIcon chain="ethereum" />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('displays first letter of chain label', () => {
    render(<ChainIcon chain="ethereum" />)
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { rerender } = render(<ChainIcon chain="ethereum" size="sm" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('w-6', 'aspect-square')

    rerender(<ChainIcon chain="ethereum" size="lg" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('w-10', 'aspect-square')
  })

  it('applies chain-specific color', () => {
    render(<ChainIcon chain="ethereum" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('bg-chain-ethereum')
  })

  it('renders all supported chains', () => {
    const chains = ['ethereum', 'tron', 'bsc', 'bitcoin', 'bfmeta', 'ccchain', 'pmchain'] as const
    const labels = {
      ethereum: 'ETH',
      tron: 'TRX',
      bsc: 'BNB',
      bitcoin: 'BTC',
      bfmeta: 'BFT',
      ccchain: 'CC',
      pmchain: 'PM',
    } as const
    chains.forEach((chain) => {
      const { unmount } = render(<ChainIcon chain={chain} />)
      expect(screen.getByLabelText(labels[chain])).toBeInTheDocument()
      unmount()
    })
  })
})

describe('ChainBadge', () => {
  it('renders chain icon and label', () => {
    render(<ChainBadge chain="ethereum" />)
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('renders all chain badges', () => {
    const chains = ['ethereum', 'tron', 'bitcoin'] as const
    chains.forEach((chain) => {
      const { unmount } = render(<ChainBadge chain={chain} />)
      expect(screen.getByLabelText(chain === 'ethereum' ? 'ETH' : chain === 'tron' ? 'TRX' : 'BTC')).toBeInTheDocument()
      unmount()
    })
  })
})
