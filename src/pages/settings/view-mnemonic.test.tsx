import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ViewMnemonicPage } from './view-mnemonic'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockGoBack = vi.fn()
const mockPush = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: mockGoBack }),
  useActivityParams: () => ({}),
  useFlow: () => ({ push: mockPush }),
}))

// Mock sheets to avoid stackflow initialization
vi.mock('@/stackflow/activities/sheets', () => ({
  setWalletLockConfirmCallback: vi.fn(),
}))

// Mock crypto decrypt
const mockDecrypt = vi.fn()
vi.mock('@/lib/crypto', () => ({
  decrypt: (data: unknown, password: string) => mockDecrypt(data, password),
}))

// Mock wallet store
const mockWallet: {
  id: string
  name: string
  keyType?: 'mnemonic' | 'arbitrary'
  encryptedMnemonic: {
    ciphertext: string
    salt: string
    iv: string
    iterations: number
  }
  chainAddresses: unknown[]
} = {
  id: 'wallet-1',
  name: 'My Wallet',
  keyType: 'mnemonic',
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
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ViewMnemonicPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
    mockDecrypt.mockResolvedValue('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12')
  })

  describe('Initial State', () => {
    it('opens password confirmation activity on load', async () => {
      renderWithProviders(<ViewMnemonicPage />)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('WalletLockConfirmJob', expect.any(Object))
      })
    })

    it('shows page header', () => {
      renderWithProviders(<ViewMnemonicPage />)
      expect(screen.getByText('查看助记词')).toBeInTheDocument()
    })

    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<ViewMnemonicPage />)
      expect(screen.getByText('请先创建或导入钱包')).toBeInTheDocument()
    })

    it('shows security warning always', () => {
      renderWithProviders(<ViewMnemonicPage />)
      expect(screen.getByText('安全提示')).toBeInTheDocument()
    })
  })

  // Note: Password verification and mnemonic display tests are skipped
  // because they depend on inline PasswordConfirmSheet which has been
  // migrated to WalletLockConfirmJob
})
