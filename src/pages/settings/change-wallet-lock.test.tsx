import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeWalletLockPage } from './change-wallet-lock'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'

const t = testI18n.getFixedT('zh-CN', ['settings', 'common', 'security'])

// Mock stackflow
const mockGoBack = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: mockGoBack }),
  useActivityParams: () => ({}),
}))

// Mock wallet store
const mockWallet = {
  id: 'wallet-1',
  name: 'My Wallet',
  encryptedMnemonic: {
    ciphertext: 'encrypted',
    salt: 'salt',
    iv: 'iv',
    iterations: 100000,
  },
  chainAddresses: [],
}

let mockCurrentWallet: typeof mockWallet | null = mockWallet

vi.mock('@/stores', () => ({
  useCurrentWallet: () => mockCurrentWallet,
  walletActions: {
    updateWalletEncryptedMnemonic: vi.fn().mockResolvedValue(undefined),
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ChangeWalletLockPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
  })

  describe('Initial State', () => {
    it('shows page header with title', () => {
      renderWithProviders(<ChangeWalletLockPage />)
      expect(screen.getByText(t('settings:changeWalletLock.title'))).toBeInTheDocument()
    })

    it('shows verify pattern step initially', () => {
      renderWithProviders(<ChangeWalletLockPage />)
      expect(screen.getByText(t('settings:changeWalletLock.verifyTitle'))).toBeInTheDocument()
      expect(screen.getByTestId('verify-pattern-lock')).toBeInTheDocument()
    })

    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<ChangeWalletLockPage />)
      expect(screen.getByText(t('settings:changeWalletLock.noWallet'))).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<ChangeWalletLockPage />)

      const backButton = screen.getByTestId('back-button')
      await userEvent.click(backButton)

      expect(mockGoBack).toHaveBeenCalledTimes(1)
    })
  })
})
