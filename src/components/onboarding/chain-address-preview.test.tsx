import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'

import { TestI18nProvider } from '@/test/i18n-mock'
import type { ChainConfig } from '@/services/chain-config'
import { ChainAddressPreview } from './chain-address-preview'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

const mockConfigs: ChainConfig[] = [
  {
    id: 'bfmeta',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFT',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'pmchain',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'PMChain',
    symbol: 'PM',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
]

describe('ChainAddressPreview', () => {
  it('shows loading skeleton while deriving', () => {
    vi.useFakeTimers()
    const { unmount } = renderWithProviders(
      <ChainAddressPreview secret="abc" enabledBioforestChainConfigs={mockConfigs} />,
    )
    expect(screen.getByTestId('address-preview-loading')).toBeInTheDocument()
    unmount()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders single address after derivation (all bioforest chains share same address)', async () => {
    vi.useFakeTimers()
    renderWithProviders(<ChainAddressPreview secret="abc" enabledBioforestChainConfigs={mockConfigs} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })

    // Should show single address, not chain names list
    expect(screen.queryByTestId('address-preview-loading')).not.toBeInTheDocument()
    // Address container should be present
    const container = document.querySelector('.px-4.py-3')
    expect(container).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('calls onDerived with derived addresses', async () => {
    vi.useFakeTimers()
    const onDerived = vi.fn()
    renderWithProviders(
      <ChainAddressPreview
        secret="abc"
        enabledBioforestChainConfigs={mockConfigs}
        onDerived={onDerived}
      />,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })

    expect(onDerived).toHaveBeenCalled()
    const last = onDerived.mock.calls.at(-1)?.[0]
    expect(Array.isArray(last)).toBe(true)
    expect(last).toHaveLength(2)
    vi.useRealTimers()
  })
})
