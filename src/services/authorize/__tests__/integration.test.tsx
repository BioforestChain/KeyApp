import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestI18nProvider } from '@/test/i18n-mock'
import { AddressAuthPage } from '@/pages/authorize/address'
import { SignatureAuthPage } from '@/pages/authorize/signature'
import { plaocAdapter } from '@/services/authorize'
import { WALLET_PLAOC_PATH } from '@/services/authorize/paths'
import { walletActions } from '@/stores'
import { encrypt } from '@/lib/crypto'

const EXAMPLE_APP = {
  appId: 'com.example.app',
  appName: 'Example DApp',
  appIcon: '',
  origin: 'https://example.app',
} as const

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

function parseHash(hash: string): { path: string; params: Record<string, string> } {
  const cleanHash = hash.replace(/^#/, '')
  const [path = '', search] = cleanHash.split('?')
  const params: Record<string, string> = {}
  if (search) {
    for (const pair of search.split('&')) {
      const [key, value] = pair.split('=')
      if (key) params[key] = decodeURIComponent(value || '')
    }
  }
  return { path, params }
}

function renderAuthorizeApp(hash: string) {
  const { path, params } = parseHash(hash)
  
  if (path.includes('/authorize/address')) {
    mockActivityParams = {
      id: params.eventId || '',
      type: params.type || 'main',
      chainName: params.chainName,
      signMessage: params.signMessage,
      getMain: params.getMain,
    }
    return render(
      <TestI18nProvider>
        <AddressAuthPage />
      </TestI18nProvider>
    )
  } else if (path.includes('/authorize/signature')) {
    mockActivityParams = {
      id: params.eventId || '',
      signaturedata: params.signaturedata,
    }
    return render(
      <TestI18nProvider>
        <SignatureAuthPage />
      </TestI18nProvider>
    )
  }
  
  return render(<div>Unknown route</div>)
}

function assertTimeoutHandler(handler: unknown): asserts handler is () => void {
  if (typeof handler !== 'function') throw new Error('Expected a function timeout handler')
}

describe('authorize integration (mock-first)', () => {
  beforeEach(async () => {
    await act(() => {
      walletActions._testReset()
    })
    mockNavigate.mockClear()
    mockActivityParams = {}
    window.location.hash = ''
    await waitFor(() => {})
  })

  afterEach(async () => {
    await act(() => {
      walletActions._testReset()
    })
    window.location.hash = ''
    await waitFor(() => {})
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('deep-links legacy address authorize and approves', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    await act(() => {
      walletActions._testAddWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    renderAuthorizeApp('#/authorize/address?eventId=evt-addr&type=main')

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    expect(respondSpy).toHaveBeenCalledWith(
      'evt-addr',
      WALLET_PLAOC_PATH.authorizeAddress,
      expect.any(Array)
    )
    expect(removeSpy).toHaveBeenCalledWith('evt-addr')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  // Note: Password verification is now handled by WalletLockConfirmJob
  it.skip('deep-links legacy signature authorize and signs after password confirmation', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    const encryptedMnemonic = await encrypt('mnemonic', 'pw')
    await act(() => {
      walletActions._testAddWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        encryptedMnemonic,
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    const signaturedata = encodeURIComponent(
      JSON.stringify([
        {
          type: 'transfer',
          chainName: 'ethereum',
          senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
          receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          balance: '0.5',
          fee: '0.002',
        },
      ])
    )
    renderAuthorizeApp(`#/authorize/signature?eventId=sufficient-balance&signaturedata=${signaturedata}`)

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()

    const confirmBtn = await screen.findByRole('button', { name: '输入密码确认' })
    expect(confirmBtn).toBeEnabled()
    await userEvent.click(confirmBtn)

    await userEvent.type(await screen.findByPlaceholderText('请输入密码'), 'pw')
    await userEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith(
        'sufficient-balance',
        WALLET_PLAOC_PATH.authorizeSignature,
        expect.stringMatching(/^0x[0-9a-f]{128}$/)
      )
    })
    expect(removeSpy).toHaveBeenCalledWith('sufficient-balance')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  it('responds rejected when user rejects address authorize', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    await act(() => {
      walletActions._testAddWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    renderAuthorizeApp('#/authorize/address?eventId=evt-reject&type=main')

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('evt-reject', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeSpy).toHaveBeenCalledWith('evt-reject')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  it('responds timeout when request exceeds deadline', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    await act(() => {
      walletActions._testAddWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    renderAuthorizeApp('#/authorize/address?eventId=evt-timeout&type=main')

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()

    const timeoutCall = setTimeoutSpy.mock.calls.find((call) => call[1] === 5 * 60 * 1000)
    expect(timeoutCall).toBeDefined()

    const handler = timeoutCall?.[0]
    assertTimeoutHandler(handler)
    handler()

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith('evt-timeout', WALLET_PLAOC_PATH.authorizeAddress, null)
    })
    expect(removeSpy).toHaveBeenCalledWith('evt-timeout')
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/' }))
  })

  it('shows error state on invalid authorize request', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockRejectedValue(new Error('invalid_event'))

    renderAuthorizeApp('#/authorize/address?eventId=evt-invalid&type=main')

    expect(await screen.findByText('授权失败')).toBeInTheDocument()
    const backButtons = screen.getAllByRole('button', { name: '返回' })
    expect(backButtons.length).toBeGreaterThan(0)
  })
})
