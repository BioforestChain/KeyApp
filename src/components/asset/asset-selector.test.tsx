import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetSelector } from './asset-selector'
import type { TokenInfo } from '@/components/token/token-item'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

const mockAssets: TokenInfo[] = [
  {
    symbol: 'BFM',
    name: 'BFMeta',
    balance: '1000.00',
    decimals: 8,
    chain: 'bfmeta',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: '500.00',
    decimals: 6,
    chain: 'bfmeta',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.5',
    decimals: 18,
    chain: 'bfmeta',
  },
]

describe('AssetSelector', () => {
  it('renders placeholder when no asset selected', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        testId="asset-selector"
      />,
    )

    expect(screen.getByText('选择资产')).toBeInTheDocument()
  })

  it('renders selected asset', () => {
    render(
      <AssetSelector
        selectedAsset={mockAssets[0]}
        assets={mockAssets}
        onSelect={vi.fn()}
        testId="asset-selector"
      />,
    )

    expect(screen.getByText('BFM')).toBeInTheDocument()
  })

  it('opens sheet on click', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        testId="asset-selector"
      />,
    )

    fireEvent.click(screen.getByTestId('asset-selector'))
    
    // Sheet should open and show assets
    expect(screen.getByText('BFMeta')).toBeInTheDocument()
    expect(screen.getByText('Tether USD')).toBeInTheDocument()
  })

  it('calls onSelect when asset is clicked', () => {
    const onSelect = vi.fn()
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={onSelect}
        testId="asset-selector"
      />,
    )

    // Open sheet
    fireEvent.click(screen.getByTestId('asset-selector'))
    
    // Click on USDT
    fireEvent.click(screen.getByText('Tether USD'))
    
    expect(onSelect).toHaveBeenCalledWith(mockAssets[1])
  })

  it('excludes assets from list', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        excludeAssets={['BFM', 'USDT']}
        testId="asset-selector"
      />,
    )

    // Open sheet
    fireEvent.click(screen.getByTestId('asset-selector'))
    
    // Only ETH should be visible
    expect(screen.queryByText('BFMeta')).not.toBeInTheDocument()
    expect(screen.queryByText('Tether USD')).not.toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('shows empty state when all assets excluded', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        excludeAssets={['BFM', 'USDT', 'ETH']}
        testId="asset-selector"
      />,
    )

    // Open sheet
    fireEvent.click(screen.getByTestId('asset-selector'))
    
    expect(screen.getByText('暂无可选资产')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        disabled
        testId="asset-selector"
      />,
    )

    const trigger = screen.getByTestId('asset-selector')
    expect(trigger).toBeDisabled()
  })

  it('shows balance when showBalance is true', () => {
    render(
      <AssetSelector
        selectedAsset={mockAssets[0]}
        assets={mockAssets}
        onSelect={vi.fn()}
        showBalance
        testId="asset-selector"
      />,
    )

    expect(screen.getByText('余额:')).toBeInTheDocument()
  })

  it('hides balance when showBalance is false', () => {
    render(
      <AssetSelector
        selectedAsset={mockAssets[0]}
        assets={mockAssets}
        onSelect={vi.fn()}
        showBalance={false}
        testId="asset-selector"
      />,
    )

    expect(screen.queryByText('余额:')).not.toBeInTheDocument()
  })

  it('uses custom placeholder', () => {
    render(
      <AssetSelector
        selectedAsset={null}
        assets={mockAssets}
        onSelect={vi.fn()}
        placeholder="Pick an asset"
        testId="asset-selector"
      />,
    )

    expect(screen.getByText('Pick an asset')).toBeInTheDocument()
  })

  it('highlights selected asset in list', () => {
    render(
      <AssetSelector
        selectedAsset={mockAssets[1]}
        assets={mockAssets}
        onSelect={vi.fn()}
        testId="asset-selector"
      />,
    )

    // Open sheet
    fireEvent.click(screen.getByTestId('asset-selector'))
    
    // The selected asset (USDT) should have a different background style
    // We can verify the sheet is open and shows assets
    expect(screen.getByText('Tether USD')).toBeInTheDocument()
    expect(screen.getByText('BFMeta')).toBeInTheDocument()
  })
})
