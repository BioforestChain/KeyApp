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
import { SignatureAuthPage } from './signature'
import { plaocAdapter } from '@/services/authorize'
import { WALLET_PLAOC_PATH } from '@/services/authorize/paths'
import { walletActions } from '@/stores'
import * as crypto from '@/lib/crypto'

vi.mock('@/lib/crypto', async () => {
  const actual = await vi.importActual('@/lib/crypto')
  return {
    ...actual,
    verifyPassword: vi.fn(),
  }
})

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

  const signatureRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/signature/$id',
    component: SignatureAuthPage,
    validateSearch: (search: Record<string, unknown>) => ({
      signaturedata:
        typeof search.signaturedata === 'string'
          ? search.signaturedata
          : search.signaturedata !== null && typeof search.signaturedata === 'object'
            ? JSON.stringify(search.signaturedata)
            : undefined,
    }),
  })

  const routeTree = rootRoute.addChildren([indexRoute, authorizeRoute.addChildren([signatureRoute])])

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

describe('SignatureAuthPage', () => {
  beforeEach(() => {
    walletActions.clearAll()
  })

  afterEach(() => {
    walletActions.clearAll()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('disables confirm when balance insufficient and returns insufficient_balance on reject', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

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
      encryptedMnemonic: { ciphertext: 'x', salt: 'y', iv: 'z', iterations: 100000 },
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    const signaturedata = encodeURIComponent(
      JSON.stringify([{
        type: 'transfer',
        chainName: 'ethereum',
        senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
        receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        balance: '1.5',
        fee: '0.002',
      }])
    )

    const { router } = renderWithRouter(`/authorize/signature/insufficient-balance?signaturedata=${signaturedata}`)

    await screen.findByText('Example DApp')

    expect(screen.getByRole('button', { name: '输入密码确认' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('insufficient-balance', WALLET_PLAOC_PATH.authorizeSignature, null)
    expect(removeSpy).toHaveBeenCalledWith('insufficient-balance')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('verifies password before signing when balance is sufficient', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

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
      encryptedMnemonic: { ciphertext: 'x', salt: 'y', iv: 'z', iterations: 100000 },
      chainAddresses: [{ chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678', tokens: [] }],
    })

    const signaturedata = encodeURIComponent(
      JSON.stringify([{
        type: 'transfer',
        chainName: 'ethereum',
        senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
        receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        balance: '0.5',
        fee: '0.002',
      }])
    )

    const { router } = renderWithRouter(`/authorize/signature/sufficient-balance?signaturedata=${signaturedata}`)

    await screen.findByText('Example DApp')

    const confirmBtn = screen.getByRole('button', { name: '输入密码确认' })
    expect(confirmBtn).toBeEnabled()

    await userEvent.click(confirmBtn)

    const pwdInput = await screen.findByPlaceholderText('请输入密码')
    await userEvent.type(pwdInput, 'pwd')
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

  it('shows error when signaturedata is invalid JSON', async () => {
    const { router } = renderWithRouter('/authorize/signature/e1?signaturedata=not-json')

    expect(await screen.findByText('signaturedata 不是合法的 JSON')).toBeInTheDocument()
    await userEvent.click(screen.getByText('返回'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('shows error when signaturedata is empty array', async () => {
    const signaturedata = encodeURIComponent(JSON.stringify([]))
    const { router } = renderWithRouter(`/authorize/signature/e1?signaturedata=${signaturedata}`)

    expect(await screen.findByText('signaturedata 不能为空数组')).toBeInTheDocument()
    await userEvent.click(screen.getByText('返回'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('uses signaturedata[0] when signaturedata contains multiple requests', async () => {
    vi.spyOn(plaocAdapter, 'getCallerAppInfo').mockResolvedValue({
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: '',
      origin: 'https://example.app',
    })

    const respondSpy = vi.spyOn(plaocAdapter, 'respondWith').mockResolvedValue()
    const removeSpy = vi.spyOn(plaocAdapter, 'removeEventId').mockResolvedValue()

    const signaturedata = encodeURIComponent(
      JSON.stringify([
        { type: 'message', chainName: 'ethereum', senderAddress: '0x1', message: 'message-a' },
        { type: 'message', chainName: 'ethereum', senderAddress: '0x1', message: 'message-b' },
      ])
    )
    const { router } = renderWithRouter(`/authorize/signature/e1?signaturedata=${signaturedata}`)

    expect(await screen.findByText('message-a')).toBeInTheDocument()
    expect(screen.queryByText('message-b')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('e1', WALLET_PLAOC_PATH.authorizeSignature, null)
    expect(removeSpy).toHaveBeenCalledWith('e1')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
