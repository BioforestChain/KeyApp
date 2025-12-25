import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon'

describe('TokenIcon', () => {
  it('renders with correct aria-label', () => {
    render(<TokenIcon symbol="eth" />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('displays first letter as fallback', () => {
    render(<TokenIcon symbol="usdt" />)
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

  it('uses context iconUrl when provider is present', () => {
    render(
      <TokenIconProvider basePath="/icons/tokens">
        <TokenIcon symbol="btc" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'BTC' })
    expect(img).toHaveAttribute('src', '/icons/tokens/btc.svg')
  })

  it('prop iconUrl takes precedence over context', () => {
    render(
      <TokenIconProvider basePath="/icons/tokens">
        <TokenIcon symbol="eth" iconUrl="/override.svg" />
      </TokenIconProvider>
    )
    const img = screen.getByRole('img', { name: 'ETH' })
    expect(img).toHaveAttribute('src', '/override.svg')
  })
})

describe('TokenBadge', () => {
  it('renders token icon and label', () => {
    render(<TokenBadge symbol="usdt" />)
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByLabelText('USDT')).toBeInTheDocument()
  })
})
