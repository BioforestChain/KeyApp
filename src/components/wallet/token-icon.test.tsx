import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('applies correct size class with aspect-square', () => {
    const { rerender } = render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" chainId="ethereum" size="sm" />
      </TokenIconProvider>
    )
    const smIcon = screen.getByLabelText('ETH')
    expect(smIcon).toHaveClass('aspect-square')
    expect(smIcon).toHaveClass('w-6')

    rerender(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" chainId="ethereum" size="lg" />
      </TokenIconProvider>
    )
    const lgIcon = screen.getByLabelText('ETH')
    expect(lgIcon).toHaveClass('aspect-square')
    expect(lgIcon).toHaveClass('w-10')
  })

  it('uses imageUrl prop when provided (highest priority)', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="eth" imageUrl="/custom/eth.svg" />
      </TokenIconProvider>
    )
    const img = screen.getByAltText('ETH')
    expect(img).toHaveAttribute('src', '/custom/eth.svg')
  })

  it('builds local path with .svg extension from provider', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="btc" chainId="ethereum" />
      </TokenIconProvider>
    )
    const img = screen.getByAltText('BTC')
    expect(img).toHaveAttribute('src', '/icons/ethereum/tokens/btc.svg')
  })

  it('falls back to letter when imageUrl fails', () => {
    render(
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <TokenIcon symbol="ETH" imageUrl="https://broken.url/eth.png" />
      </TokenIconProvider>
    )
    const img = screen.getByAltText('ETH')
    fireEvent.error(img)
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('works without provider (letter fallback)', () => {
    render(<TokenIcon symbol="BTC" />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('capitalizes fallback letter', () => {
    render(<TokenIcon symbol="btc" />)
    expect(screen.getByText('B')).toBeInTheDocument()
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
