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

    const { router } = renderWithRouter('/authorize/signature/insufficient-balance')

    await screen.findByText('Example DApp')

    expect(screen.getByRole('button', { name: '输入密码确认' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: '拒绝' }))

    expect(respondSpy).toHaveBeenCalledWith('insufficient-balance', WALLET_PLAOC_PATH.authorizeSignature, { error: 'insufficient_balance' })
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

    const { router } = renderWithRouter('/authorize/signature/sufficient-balance')

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
        expect.objectContaining({
          signature: expect.stringMatching(/^0x[0-9a-f]{128}$/),
        })
      )
    })

    expect(removeSpy).toHaveBeenCalledWith('sufficient-balance')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
