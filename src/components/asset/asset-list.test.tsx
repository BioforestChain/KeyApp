import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetList } from './asset-list'
import type { AssetInfo } from '@/types/asset'
import { TestI18nProvider } from '@/test/i18n-mock'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

describe('AssetList', () => {
  const mockAssets: AssetInfo[] = [
    {
      assetType: 'ETH',
      name: 'Ethereum',
      amount: '1500000000000000000',
      decimals: 18,
    },
    {
      assetType: 'USDT',
      name: 'Tether USD',
      amount: '100000000',
      decimals: 6,
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      assetType: 'BTC',
      name: 'Bitcoin',
      amount: '50000000',
      decimals: 8,
    },
  ]

  it('renders all assets', () => {
    renderWithI18n(<AssetList assets={mockAssets} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText('Tether USD')).toBeInTheDocument()
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
  })

  it('renders empty state when no assets', () => {
    renderWithI18n(<AssetList assets={[]} />)
    expect(screen.getByText('暂无资产')).toBeInTheDocument()
  })

  it('renders loading skeleton', () => {
    const { container } = renderWithI18n(<AssetList assets={[]} isLoading={true} />)
    // Should have 3 skeleton items
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('calls onAssetClick with correct asset', () => {
    const onAssetClick = vi.fn()
    renderWithI18n(<AssetList assets={mockAssets} onAssetClick={onAssetClick} />)

    fireEvent.click(screen.getByText('Ethereum'))
    expect(onAssetClick).toHaveBeenCalledWith(mockAssets[0])

    fireEvent.click(screen.getByText('Bitcoin'))
    expect(onAssetClick).toHaveBeenCalledWith(mockAssets[2])
  })

  it('renders asset balances', () => {
    renderWithI18n(<AssetList assets={mockAssets} />)
    expect(screen.getByText('1.5')).toBeInTheDocument() // ETH
    expect(screen.getByText('100')).toBeInTheDocument() // USDT
    expect(screen.getByText('0.5')).toBeInTheDocument() // BTC
  })

  it('applies custom className', () => {
    const { container } = renderWithI18n(
      <AssetList assets={mockAssets} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('uses unique keys for assets with contract addresses', () => {
    // This tests that tokens with same assetType but different contracts render correctly
    const tokensWithContracts: AssetInfo[] = [
      {
        assetType: 'USDT',
        name: 'Tether (ETH)',
        amount: '100000000',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      {
        assetType: 'USDT',
        name: 'Tether (TRX)',
        amount: '200000000',
        decimals: 6,
        contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      },
    ]
    renderWithI18n(<AssetList assets={tokensWithContracts} />)
    expect(screen.getByText('Tether (ETH)')).toBeInTheDocument()
    expect(screen.getByText('Tether (TRX)')).toBeInTheDocument()
  })
})
