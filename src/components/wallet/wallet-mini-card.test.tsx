import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalletMiniCard } from './wallet-mini-card'

// Mock useMonochromeMask hook
vi.mock('@/hooks/useMonochromeMask', () => ({
  useMonochromeMask: (iconUrl: string | undefined) =>
    iconUrl ? 'data:image/png;base64,mockMask' : null,
}))

describe('WalletMiniCard', () => {
  it('renders with default size', () => {
    render(<WalletMiniCard themeHue={323} />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card).toBeInTheDocument()
    expect(card).toHaveStyle({ width: '32px', height: '20px' })
  })

  it('renders xs size correctly', () => {
    render(<WalletMiniCard themeHue={323} size="xs" />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card).toHaveStyle({ width: '20px', height: '12px' })
  })

  it('renders sm size correctly', () => {
    render(<WalletMiniCard themeHue={323} size="sm" />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card).toHaveStyle({ width: '32px', height: '20px' })
  })

  it('renders md size correctly', () => {
    render(<WalletMiniCard themeHue={323} size="md" />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card).toHaveStyle({ width: '44px', height: '28px' })
  })

  it('applies gradient background based on themeHue', () => {
    render(<WalletMiniCard themeHue={200} />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card.style.background).toContain('linear-gradient')
  })

  it('applies custom className', () => {
    render(<WalletMiniCard themeHue={323} className="custom-class" />)
    const card = screen.getByRole('img', { name: 'wallet card' })
    expect(card).toHaveClass('custom-class')
  })

  it('renders different colors for different hues', () => {
    const { rerender } = render(<WalletMiniCard themeHue={0} />)
    const card1 = screen.getByRole('img', { name: 'wallet card' })
    const bg1 = card1.style.background

    rerender(<WalletMiniCard themeHue={180} />)
    const card2 = screen.getByRole('img', { name: 'wallet card' })
    const bg2 = card2.style.background

    expect(bg1).not.toBe(bg2)
  })

  it('renders pattern layer by default', () => {
    render(<WalletMiniCard themeHue={323} />)
    expect(screen.getByTestId('pattern-layer')).toBeInTheDocument()
  })

  it('hides pattern layer when showPattern is false', () => {
    render(<WalletMiniCard themeHue={323} showPattern={false} />)
    expect(screen.queryByTestId('pattern-layer')).not.toBeInTheDocument()
  })

  it('renders watermark layer when watermarkIconUrl is provided', () => {
    render(<WalletMiniCard themeHue={323} watermarkIconUrl="/icon.svg" />)
    expect(screen.getByTestId('watermark-layer')).toBeInTheDocument()
  })

  it('does not render watermark layer when watermarkIconUrl is not provided', () => {
    render(<WalletMiniCard themeHue={323} />)
    expect(screen.queryByTestId('watermark-layer')).not.toBeInTheDocument()
  })
})
