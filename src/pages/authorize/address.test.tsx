import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router'
import { TestI18nProvider } from '@/test/i18n-mock'
import { AddressAuthPage } from './address'
import { plaocAdapter } from '@/services/authorize'
import { WALLET_PLAOC_PATH } from '@/services/authorize/paths'
import { walletActions } from '@/stores'
import { encrypt } from '@/lib/crypto'

function renderWithRouter(initialEntry: string) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
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

  const addressRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/address/$id',
    component: AddressAuthPage,
    validateSearch: (search: Record<string, unknown>) => ({
      type: search.type === 'main' || search.type === 'network' || search.type === 'all' ? search.type : 'main',
      chainName: typeof search.chainName === 'string' ? search.chainName : undefined,
      signMessage: typeof search.signMessage === 'string' ? search.signMessage : undefined,
    }),
  })

  const routeTree = rootRoute.addChildren([indexRoute, authorizeRoute.addChildren([addressRoute])])

  const history = createMemoryHistory({ initialEntries: [initialEntry] })

  const router = createRouter({
    routeTree,
    history,
  })

  const result = render(
    <TestI18nProvider>
      <RouterProvider router={router} />
    </TestI18nProvider>
  )

  return { router, ...result }
}

describe('AddressAuthPage', () => {
  beforeEach(() => {
    walletActions.clearAll()
  })

  afterEach(() => {
    walletActions.clearAll()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders app info', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    renderWithRouter('/authorize/address/test-event?type=main')

    expect(await screen.findByText('Example DApp')).toBeInTheDocument()
    expect(screen.getByText('https://example.app')).toBeInTheDocument()
  })

  it('handles approve flow', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    walletActions.createWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] },
      ],
    })

    const { router } = renderWithRouter('/authorize/address/test-event?type=main')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    expect(respondSpy).toHaveBeenCalledWith(
      'test-event',
      WALLET_PLAOC_PATH.authorizeAddress,
      expect.any(Array)
    )
    expect(removeSpy).toHaveBeenCalledWith('test-event')
    expect(router.state.location.pathname).toBe('/')
  })

  it('requires password and signs when signMessage is requested', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    const encryptedMnemonic = await encrypt('mnemonic', 'pw')

    walletActions.createWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    const { router } = renderWithRouter('/authorize/address/test-event?type=main&signMessage=hello')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '同意' }))

    await screen.findByPlaceholderText('请输入密码')
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), 'pw')
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
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('handles reject flow', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    walletActions.createWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    const { router } = renderWithRouter('/authorize/address/test-event?type=main')

    await screen.findByText('Example DApp')
    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('test-event', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeSpy).toHaveBeenCalledWith('test-event')
    expect(router.state.location.pathname).toBe('/')
  })

  it('handles timeout', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    walletActions.createWallet({
      name: 'Wallet 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    const { router } = renderWithRouter('/authorize/address/test-event?type=main')
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
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('handles invalid eventId', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockRejectedValue(new Error('invalid_event'))

    renderWithRouter('/authorize/address/bad-event?type=main')

    expect(await screen.findByText('授权失败')).toBeInTheDocument()
    const backButtons = screen.getAllByRole('button', { name: '返回' })
    expect(backButtons.some((b) => b.getAttribute('data-slot') === 'button')).toBe(true)
  })
})
