import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon'

const mockGetTokenIconBases = (chainId: string) => {
  const bases: Record<string, string[]> = {
    ethereum: ['/icons/ethereum/tokens', 'https://cdn.example.com/eth'],
    bfmeta: ['/icons/bfmeta/tokens', 'https://cdn.example.com/bfm'],
  }
  return bases[chainId] ?? []
}

describe('TokenIcon', () => {
  it('renders with correct aria-label', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" chainId="ethereum" />
      </TokenIconProvider>
    )
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('displays first letter as fallback without chainId', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="usdt" />
      </TokenIconProvider>
    )
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { rerender } = render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" chainId="ethereum" size="sm" />
      </TokenIconProvider>
    )
    expect(screen.getByLabelText('ETH')).toHaveClass('size-5')

    rerender(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" chainId="ethereum" size="lg" />
      </TokenIconProvider>
    )
    expect(screen.getByLabelText('ETH')).toHaveClass('size-10')
  })

  it('uses iconUrl prop when provided', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" iconUrl="/custom/eth.svg" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'ETH' })
    expect(img).toHaveAttribute('src', '/custom/eth.svg')
  })

  it('builds local path with .svg extension', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="btc" chainId="ethereum" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'BTC' })
    expect(img).toHaveAttribute('src', '/icons/ethereum/tokens/btc.svg')
  })
})

describe('TokenBadge', () => {
  it('renders token icon and label', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenBadge symbol="usdt" chainId="ethereum" />
      </TokenIconProvider>
    )
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByLabelText('USDT')).toBeInTheDocument()
  })
})
