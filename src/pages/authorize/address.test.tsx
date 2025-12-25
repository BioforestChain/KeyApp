import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestI18nProvider } from '@/test/i18n-mock'
import { AddressAuthPage } from './address'
import { WALLET_PLAOC_PATH } from '@/services/authorize/paths'
import { walletActions } from '@/stores'
import { encrypt } from '@/lib/crypto'

// Mock plaoc adapter
const { mockPlaocAdapter } = vi.hoisted(() => ({
  mockPlaocAdapter: {
    getCallerAppInfo: vi.fn().mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    }),
    respondWith: vi.fn().mockResolvedValue(undefined),
    removeEventId: vi.fn().mockResolvedValue(undefined),
    isAvailable: vi.fn().mockReturnValue(true),
  },
}))

vi.mock('@/services/authorize', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/authorize')>()
  return {
    ...original,
    plaocAdapter: mockPlaocAdapter,
  }
})

// Mock stackflow
const mockNavigate = vi.fn()
const mockPush = vi.fn()
let mockActivityParams: Record<string, unknown> = {}

vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => mockActivityParams,
  useFlow: () => ({ push: mockPush }),
}))

// Mock sheets to avoid stackflow initialization
vi.mock('@/stackflow/activities/sheets', () => ({
  setWalletLockConfirmCallback: vi.fn(),
}))

function parseSearchParams(url: string): Record<string, string> {
  const [, search] = url.split('?')
  if (!search) return {}
  const params: Record<string, string> = {}
  for (const pair of search.split('&')) {
    const [key, value] = pair.split('=')
    if (key) params[key] = decodeURIComponent(value || '')
  }
  return params
}

function renderWithParams(initialEntry: string) {
  const [path = ''] = initialEntry.split('?')
  const searchParams = parseSearchParams(initialEntry)
  
  // Extract id from path like /authorize/address/test-event
  const pathMatch = path.match(/\/authorize\/address\/([^/]+)/)
  const id = pathMatch?.[1] || ''
  
  mockActivityParams = {
    id,
    type: searchParams.type || 'main',
    chainName: searchParams.chainName,
    signMessage: searchParams.signMessage,
    getMain: searchParams.getMain,
  }

  return render(
    <TestI18nProvider>
      <AddressAuthPage />
    </TestI18nProvider>
  )
}

describe('AddressAuthPage', () => {
  beforeEach(() => {
    walletActions._testReset()
    mockNavigate.mockClear()
    mockActivityParams = {}
  })

  afterEach(() => {
    walletActions._testReset()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders app info', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    renderWithParams('/authorize/address/test-event?type=main')

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()
    expect(screen.getByText('https://example.app')).toBeInTheDocument()
  })

  it('handles approve flow', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = mockPlaocAdapter.respondWith.mockResolvedValue(undefined)
    const removeSpy = mockPlaocAdapter.removeEventId.mockResolvedValue(undefined)

    walletActions._testAddWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] },
      ],
    })

    renderWithParams('/authorize/address/test-event?type=main')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    expect(respondSpy).toHaveBeenCalledWith(
      'test-event',
      WALLET_PLAOC_PATH.authorizeAddress,
      expect.any(Array)
    )
    expect(removeSpy).toHaveBeenCalledWith('test-event')
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  // Note: Password verification is now handled by WalletLockConfirmJob
  // This test is skipped as it depends on inline password input
  it.skip('requires password and signs when signMessage is requested', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = mockPlaocAdapter.respondWith.mockResolvedValue(undefined)
    const removeSpy = mockPlaocAdapter.removeEventId.mockResolvedValue(undefined)

    const encryptedMnemonic = await encrypt('mnemonic', 'pw')

    walletActions._testAddWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    renderWithParams('/authorize/address/test-event?type=main&signMessage=hello')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    await screen.findByTestId('pattern-lock-input')
    await userEvent.type(screen.getByTestId('pattern-lock-input'), '0,1,2,5,8')
    await userEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith(
        'test-event',
        WALLET_PLAOC_PATH.authorizeAddress,
        expect.arrayContaining([
          expect.objectContaining({
            signMessage: expect.stringMatching(/^0x[0-9a-f]{128}$/),
          }),
        ])
      )
    })

    expect(removeSpy).toHaveBeenCalledWith('test-event')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  // Note: Password verification is now handled by WalletLockConfirmJob
  it.skip('requires password and returns main when getMain=true is requested', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = mockPlaocAdapter.respondWith.mockResolvedValue(undefined)
    const removeSpy = mockPlaocAdapter.removeEventId.mockResolvedValue(undefined)

    const encryptedMnemonic = await encrypt('mnemonic', 'pw')

    walletActions._testAddWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    renderWithParams('/authorize/address/test-event?type=main&getMain=true')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    await screen.findByTestId('pattern-lock-input')
    await userEvent.type(screen.getByTestId('pattern-lock-input'), '0,1,2,5,8')
    await userEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith(
        'test-event',
        WALLET_PLAOC_PATH.authorizeAddress,
        expect.arrayContaining([
          expect.objectContaining({
            main: 'mnemonic',
          }),
        ])
      )
    })

    expect(removeSpy).toHaveBeenCalledWith('test-event')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  it('handles reject flow', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = mockPlaocAdapter.respondWith.mockResolvedValue(undefined)
    const removeSpy = mockPlaocAdapter.removeEventId.mockResolvedValue(undefined)

    walletActions._testAddWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    renderWithParams('/authorize/address/test-event?type=main')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('test-event', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeSpy).toHaveBeenCalledWith('test-event')
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('handles timeout', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

    mockPlaocAdapter.getCallerAppInfo.mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = mockPlaocAdapter.respondWith.mockResolvedValue(undefined)
    const removeSpy = mockPlaocAdapter.removeEventId.mockResolvedValue(undefined)

    walletActions._testAddWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    renderWithParams('/authorize/address/test-event?type=main')
    await screen.findByText('Example DApp')

    const timeoutCall = setTimeoutSpy.mock.calls.find((c) => c[1] === 5 * 60 * 1000)
    expect(timeoutCall).toBeDefined()
    const timeoutCb = timeoutCall?.[0]
    expect(typeof timeoutCb).toBe('function')
    ;(timeoutCb as () => void)()

    await Promise.resolve()
    await Promise.resolve()

    expect(respondSpy).toHaveBeenCalledWith('test-event', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeSpy).toHaveBeenCalledWith('test-event')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  it('handles invalid eventId', async () => {
    mockPlaocAdapter.getCallerAppInfo.mockRejectedValue(new Error('invalid_event'))

    renderWithParams('/authorize/address/bad-event?type=main')

    expect(await screen.findByText('授权失败')).toBeInTheDocument()
    const backButtons = screen.getAllByRole('button', { name: '返回' })
    expect(backButtons.some((b) => b.getAttribute('data-slot') === 'button')).toBe(true)
  })
})
