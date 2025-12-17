import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestI18nProvider } from '@/test/i18n-mock'

import { ChainConfigPage } from './chain-config'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockInitialize = vi.fn<() => Promise<void>>(async () => {})
const mockSetSubscriptionUrl = vi.fn<(url: string) => Promise<void>>(async (_url: string) => {})
const mockRefreshSubscription = vi.fn<() => Promise<void>>(async () => {})
const mockAddManualConfig = vi.fn<(input: unknown) => Promise<void>>(async (_input: unknown) => {})
const mockSetChainEnabled = vi.fn<(id: string, enabled: boolean) => Promise<void>>(async (_id: string, _enabled: boolean) => {})

let mockConfigs: Array<{
  id: string
  version: string
  type: 'bioforest' | 'custom'
  name: string
  symbol: string
  decimals: number
  source: 'default' | 'subscription' | 'manual'
  enabled: boolean
}> = []

let mockSubscription: { url: string; lastUpdated?: string } | null = null
let mockWarnings: Array<{ id: string; kind: 'incompatible_major'; version: string; supportedMajor: number; source: 'manual' }> = []
let mockIsLoading = false
let mockError: string | null = null

vi.mock('@/stores', () => ({
  chainConfigActions: {
    initialize: () => mockInitialize(),
    setSubscriptionUrl: (url: string) => mockSetSubscriptionUrl(url),
    refreshSubscription: () => mockRefreshSubscription(),
    addManualConfig: (input: unknown) => mockAddManualConfig(input),
    setChainEnabled: (id: string, enabled: boolean) => mockSetChainEnabled(id, enabled),
  },
  useChainConfigs: () => mockConfigs,
  useChainConfigSubscription: () => mockSubscription,
  useChainConfigWarnings: () => mockWarnings,
  useChainConfigLoading: () => mockIsLoading,
  useChainConfigError: () => mockError,
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ChainConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigs = [
      {
        id: 'bfmeta',
        version: '1.0',
        type: 'bioforest',
        name: 'BFMeta',
        symbol: 'BFT',
        decimals: 8,
        source: 'default',
        enabled: true,
      },
    ]
    mockSubscription = { url: 'default' }
    mockWarnings = []
    mockIsLoading = false
    mockError = null
  })

  it('renders page header and initializes on mount', async () => {
    renderWithProviders(<ChainConfigPage />)
    expect(screen.getByText('链配置')).toBeInTheDocument()

    await waitFor(() => expect(mockInitialize).toHaveBeenCalledTimes(1))
  })

  it('saves subscription url', async () => {
    renderWithProviders(<ChainConfigPage />)

    const input = screen.getByPlaceholderText('default 或 https://example.com/chains.json')
    await userEvent.clear(input)
    await userEvent.type(input, 'https://example.com/chains.json')

    await userEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(mockSetSubscriptionUrl).toHaveBeenCalledWith('https://example.com/chains.json')
  })

  it('toggles chain enabled', async () => {
    renderWithProviders(<ChainConfigPage />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)
    expect(mockSetChainEnabled).toHaveBeenCalledWith('bfmeta', false)
  })

  it('adds manual config', async () => {
    renderWithProviders(<ChainConfigPage />)

    const textarea = screen.getByPlaceholderText(
      '例如：{"id":"mychain","version":"1.0","type":"custom","name":"MyChain","symbol":"MC","decimals":8}'
    )
    fireEvent.change(textarea, {
      target: { value: '{"id":"mychain","version":"1.0","type":"custom","name":"MyChain","symbol":"MC","decimals":8}' },
    })

    await userEvent.click(screen.getByRole('button', { name: '添加' }))
    expect(mockAddManualConfig).toHaveBeenCalledTimes(1)
  })

  it('warns when manual config id already exists and allows replace/cancel', async () => {
    renderWithProviders(<ChainConfigPage />)

    const textarea = screen.getByPlaceholderText(
      '例如：{"id":"mychain","version":"1.0","type":"custom","name":"MyChain","symbol":"MC","decimals":8}'
    )

    const duplicateJson =
      '{"id":"bfmeta","version":"1.0","type":"bioforest","name":"BFMeta Override","symbol":"BFT","decimals":8,"prefix":"c"}'
    fireEvent.change(textarea, {
      target: { value: duplicateJson },
    })

    await userEvent.click(screen.getByRole('button', { name: '添加' }))
    expect(mockAddManualConfig).not.toHaveBeenCalled()

    expect(screen.getByText('链 ID 已存在')).toBeInTheDocument()
    expect(screen.getByText('以下链 ID 已存在，是否替换？')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(mockAddManualConfig).not.toHaveBeenCalled()

    // Re-open dialog and confirm replace
    await userEvent.click(screen.getByRole('button', { name: '添加' }))
    await userEvent.click(screen.getByRole('button', { name: '替换' }))

    await waitFor(() => expect(mockAddManualConfig).toHaveBeenCalledWith(duplicateJson))
  })

  it('displays error message', () => {
    mockError = 'Boom'
    renderWithProviders(<ChainConfigPage />)

    expect(screen.getByText('Boom')).toBeInTheDocument()
  })
})
