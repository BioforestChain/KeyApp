import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangePasswordPage } from './change-password'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock crypto
const mockDecrypt = vi.fn()
const mockEncrypt = vi.fn()
vi.mock('@/lib/crypto', () => ({
  decrypt: (data: unknown, password: string) => mockDecrypt(data, password),
  encrypt: (plaintext: string, password: string) => mockEncrypt(plaintext, password),
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
const mockUpdateWalletEncryptedMnemonic = vi.fn()

vi.mock('@/stores', () => ({
  useCurrentWallet: () => mockCurrentWallet,
  walletActions: {
    updateWalletEncryptedMnemonic: (...args: unknown[]) => mockUpdateWalletEncryptedMnemonic(...args),
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
    mockDecrypt.mockResolvedValue('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12')
    mockEncrypt.mockResolvedValue({ ciphertext: 'new-encrypted', salt: 'new-salt', iv: 'new-iv' })
  })

  describe('Initial State', () => {
    it('shows page header with title', () => {
      renderWithProviders(<ChangePasswordPage />)
      expect(screen.getByText('修改密码')).toBeInTheDocument()
    })

    it('shows three password input fields', () => {
      renderWithProviders(<ChangePasswordPage />)
      expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/请输入新密码/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请再次输入新密码')).toBeInTheDocument()
    })

    it('shows submit button disabled initially', () => {
      renderWithProviders(<ChangePasswordPage />)
      const button = screen.getByRole('button', { name: '确认修改' })
      expect(button).toBeDisabled()
    })

    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<ChangePasswordPage />)
      expect(screen.getByText('请先创建或导入钱包')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('enables submit when all fields are valid', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')

      const button = screen.getByRole('button', { name: '确认修改' })
      expect(button).not.toBeDisabled()
    })

    it('keeps submit disabled when new password is too short', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'short')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'short')

      const button = screen.getByRole('button', { name: '确认修改' })
      expect(button).toBeDisabled()
    })

    it('shows error when passwords do not match', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'differentpwd')

      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
    })

    it('keeps submit disabled when passwords do not match', async () => {
      renderWithProviders(<ChangePasswordPage />)

      const user = userEvent.setup({ delay: null })
      await user.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await user.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await user.type(screen.getByPlaceholderText('请再次输入新密码'), 'differentpwd')

      const button = screen.getByRole('button', { name: '确认修改' })
      expect(button).toBeDisabled()
    })
  })

  describe('Password Change Flow', () => {
    it('shows error when current password is wrong', async () => {
      mockDecrypt.mockRejectedValueOnce(new Error('decrypt failed'))
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'wrongpassword')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')
      await userEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(screen.getByText('当前密码不正确')).toBeInTheDocument()
      })
    })

    it('decrypts mnemonic with current password', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')
      await userEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(mockDecrypt).toHaveBeenCalledWith(mockWallet.encryptedMnemonic, 'currentpwd')
      })
    })

    it('encrypts mnemonic with new password', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')
      await userEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(mockEncrypt).toHaveBeenCalledWith(
          'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
          'newpassword123'
        )
      })
    })

    it('updates wallet encrypted mnemonic on success', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')
      await userEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(mockUpdateWalletEncryptedMnemonic).toHaveBeenCalledWith(
          'wallet-1',
          { ciphertext: 'new-encrypted', salt: 'new-salt', iv: 'new-iv' }
        )
      })
    })

    it('shows success message after password change', async () => {
      renderWithProviders(<ChangePasswordPage />)

      await userEvent.type(screen.getByPlaceholderText('请输入当前密码'), 'currentpwd')
      await userEvent.type(screen.getByPlaceholderText(/请输入新密码/), 'newpassword123')
      await userEvent.type(screen.getByPlaceholderText('请再次输入新密码'), 'newpassword123')
      await userEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(screen.getByText('密码修改成功')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<ChangePasswordPage />)

      // 找到返回按钮（在 PageHeader 中）
      const backButton = screen.getByRole('button', { name: /返回/i })
      await userEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' })
    })
  })
})
