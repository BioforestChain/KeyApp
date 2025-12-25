import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon'

describe('TokenIcon', () => {
  it('renders with correct aria-label', () => {
    render(<TokenIcon symbol="eth" />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('displays first letter as fallback without chainId', () => {
    render(
      <TokenIconProvider>
        <TokenIcon symbol="usdt" />
      </TokenIconProvider>
    )
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { rerender } = render(<TokenIcon symbol="eth" size="sm" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('size-5')

    rerender(<TokenIcon symbol="eth" size="lg" />)
    expect(screen.getByLabelText('ETH')).toHaveClass('size-10')
  })

  it('uses iconUrl prop when provided', () => {
    render(<TokenIcon symbol="eth" iconUrl="/custom/eth.svg" />)
    const img = screen.getByRole('img', { name: 'ETH' })
    expect(img).toHaveAttribute('src', '/custom/eth.svg')
  })

  it('uses local path when provider and chainId are present', () => {
    render(
      <TokenIconProvider basePath="/icons">
        <TokenIcon symbol="btc" chainId="bitcoin" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'BTC' })
    expect(img).toHaveAttribute('src', '/icons/bitcoin/tokens/btc.svg')
  })

  it('prop iconUrl takes precedence over context', () => {
    render(
      <TokenIconProvider basePath="/icons">
        <TokenIcon symbol="eth" chainId="ethereum" iconUrl="/override.svg" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'ETH' })
    expect(img).toHaveAttribute('src', '/override.svg')
  })

  it('supports chainId for local path generation', () => {
    render(
      <TokenIconProvider basePath="/icons">
        <TokenIcon symbol="unknown" chainId="ethereum" />
      </TokenIconProvider>
    )
    // Initial render uses local path with chainId
    const img = screen.getByRole('img', { name: 'UNKNOWN' })
    expect(img).toHaveAttribute('src', '/icons/ethereum/tokens/unknown.svg')
  })
})

describe('TokenBadge', () => {
  it('renders token icon and label', () => {
    render(
      <TokenIconProvider>
        <TokenBadge symbol="usdt" chainId="ethereum" />
      </TokenIconProvider>
    )
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByLabelText('USDT')).toBeInTheDocument()
  })

  it('supports chainId prop for icon path', () => {
    render(
      <TokenIconProvider basePath="/icons">
        <TokenBadge symbol="eth" chainId="ethereum" />
      </TokenIconProvider>
    )
    expect(screen.getByText('ETH')).toBeInTheDocument()
    const img = screen.getByRole('img', { name: 'ETH' })
    expect(img).toHaveAttribute('src', '/icons/ethereum/tokens/eth.svg')
  })
})
