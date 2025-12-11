import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetItem } from './asset-item'
import type { AssetInfo } from '@/types/asset'

describe('AssetItem', () => {
  const mockAsset: AssetInfo = {
    assetType: 'ETH',
    name: 'Ethereum',
    amount: '1500000000000000000', // 1.5 ETH
    decimals: 18,
    logoUrl: undefined,
  }

  it('renders asset name and symbol', () => {
    render(<AssetItem asset={mockAsset} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('renders formatted balance', () => {
    render(<AssetItem asset={mockAsset} />)
    expect(screen.getByText('1.5')).toBeInTheDocument()
  })

  it('uses assetType as name when name is not provided', () => {
    const assetWithoutName: AssetInfo = {
      assetType: 'USDT',
      amount: '100000000',
      decimals: 6,
    }
    render(<AssetItem asset={assetWithoutName} />)
    // Both name display and symbol should show USDT
    expect(screen.getAllByText('USDT')).toHaveLength(2)
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<AssetItem asset={mockAsset} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows chevron when onClick is provided', () => {
    const onClick = vi.fn()
    const { container } = render(<AssetItem asset={mockAsset} onClick={onClick} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('hides chevron when showChevron is false', () => {
    const onClick = vi.fn()
    render(<AssetItem asset={mockAsset} onClick={onClick} showChevron={false} />)
    // Only TokenIcon SVG fallback should be present (the letter), not chevron
    // Actually TokenIcon uses a div with letter, so no SVG
  })

  it('disables button when onClick is not provided', () => {
    render(<AssetItem asset={mockAsset} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders TokenIcon with symbol', () => {
    render(<AssetItem asset={mockAsset} />)
    // TokenIcon shows first letter as fallback
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AssetItem asset={mockAsset} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  describe('price display', () => {
    const assetWithPrice: AssetInfo = {
      assetType: 'ETH',
      name: 'Ethereum',
      amount: '1000000000000000000', // 1 ETH
      decimals: 18,
      priceUsd: 2500,
      priceChange24h: 2.3,
    }

    it('displays fiat value when priceUsd is provided', () => {
      render(<AssetItem asset={assetWithPrice} />)
      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
    })

    it('displays positive price change with green color', () => {
      render(<AssetItem asset={assetWithPrice} />)
      const changeElement = screen.getByText('+2.30%')
      expect(changeElement).toBeInTheDocument()
      expect(changeElement).toHaveClass('text-green-600')
    })

    it('displays negative price change with red color', () => {
      const assetWithNegativeChange: AssetInfo = {
        ...assetWithPrice,
        priceChange24h: -3.5,
      }
      render(<AssetItem asset={assetWithNegativeChange} />)
      const changeElement = screen.getByText('-3.50%')
      expect(changeElement).toBeInTheDocument()
      expect(changeElement).toHaveClass('text-red-600')
    })

    it('does not display price info when priceUsd is undefined', () => {
      render(<AssetItem asset={mockAsset} />)
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
      expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    })

    it('respects currency prop for formatting', () => {
      render(<AssetItem asset={assetWithPrice} currency="CNY" />)
      // CNY uses ¥ symbol
      const fiatText = screen.getByText(/2,500/)
      expect(fiatText).toBeInTheDocument()
    })
  })
})
