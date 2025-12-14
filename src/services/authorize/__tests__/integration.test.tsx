import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app-layout'
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

function renderAuthorizeApp(initialEntry = '/') {
  const rootRoute = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  })

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Home</div>,
  })

  const authorizeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/authorize',
  })

  const authorizeAddressRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/address/$id',
    component: AddressAuthPage,
    validateSearch: (search: Record<string, unknown>) => ({
      type:
        search.type === 'main' || search.type === 'network' || search.type === 'all'
          ? search.type
          : 'main',
      chainName: typeof search.chainName === 'string' ? search.chainName : undefined,
      signMessage: typeof search.signMessage === 'string' ? search.signMessage : undefined,
      getMain: typeof search.getMain === 'string' ? search.getMain : undefined,
    }),
  })

  const authorizeSignatureRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/signature/$id',
    component: SignatureAuthPage,
    validateSearch: (search: Record<string, unknown>) => ({
      signaturedata: typeof search.signaturedata === 'string' ? search.signaturedata : undefined,
    }),
  })

  const routeTree = rootRoute.addChildren([
    indexRoute,
    authorizeRoute.addChildren([authorizeAddressRoute, authorizeSignatureRoute]),
  ])

  const history = createMemoryHistory({ initialEntries: [initialEntry] })
  const router = createRouter({ routeTree, history })

  const result = render(
    <TestI18nProvider>
      <RouterProvider router={router} />
    </TestI18nProvider>
  )

  return { router, ...result }
}

function assertTimeoutHandler(handler: unknown): asserts handler is () => void {
  if (typeof handler !== 'function') throw new Error('Expected a function timeout handler')
}

describe('authorize integration (mock-first)', () => {
  beforeEach(async () => {
    await act(() => {
      walletActions.clearAll()
    })
    window.location.hash = ''
    // Allow React state to settle after cleanup
    await waitFor(() => {})
  })

  afterEach(async () => {
    await act(() => {
      walletActions.clearAll()
    })
    window.location.hash = ''
    // Allow React state to settle after cleanup
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
      walletActions.createWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    window.location.hash = '#/authorize/address?eventId=evt-addr&type=main'
    const { router } = renderAuthorizeApp()

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    expect(respondSpy).toHaveBeenCalledWith(
      'evt-addr',
      WALLET_PLAOC_PATH.authorizeAddress,
      expect.any(Array)
    )
    expect(removeSpy).toHaveBeenCalledWith('evt-addr')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('deep-links legacy signature authorize and signs after password confirmation', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    const encryptedMnemonic = await encrypt('mnemonic', 'pw')
    await act(() => {
      walletActions.createWallet({
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
    window.location.hash = `#/authorize/signature?eventId=sufficient-balance&signaturedata=${signaturedata}`
    const { router } = renderAuthorizeApp()

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
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('responds rejected when user rejects address authorize', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    await act(() => {
      walletActions.createWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    window.location.hash = '#/authorize/address?eventId=evt-reject&type=main'
    const { router } = renderAuthorizeApp()

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('evt-reject', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeSpy).toHaveBeenCalledWith('evt-reject')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('responds timeout when request exceeds deadline', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue(EXAMPLE_APP)
    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    await act(() => {
      walletActions.createWallet({
        name: 'Wallet 1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: 'ethereum',
        chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
      })
    })

    window.location.hash = '#/authorize/address?eventId=evt-timeout&type=main'
    const { router } = renderAuthorizeApp()

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
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('shows error state on invalid authorize request', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockRejectedValue(new Error('invalid_event'))

    window.location.hash = '#/authorize/address?eventId=evt-invalid&type=main'
    renderAuthorizeApp()

    expect(await screen.findByText('授权失败')).toBeInTheDocument()
    const backButtons = screen.getAllByRole('button', { name: '返回' })
    expect(backButtons.length).toBeGreaterThan(0)
  })
})
