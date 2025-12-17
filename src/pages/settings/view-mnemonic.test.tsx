import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewMnemonicPage } from './view-mnemonic'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockGoBack = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: mockGoBack }),
  useActivityParams: () => ({}),
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
    it('shows password confirmation sheet on load', () => {
      renderWithProviders(<ViewMnemonicPage />)
      expect(screen.getByText('验证密码')).toBeInTheDocument()
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

  describe('Password Verification', () => {
    it('shows error on wrong password', async () => {
      mockDecrypt.mockRejectedValueOnce(new Error('decrypt failed'))
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('密码错误')).toBeInTheDocument()
      })
    })

    it('shows mnemonic count after correct password', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('12 位助记词')).toBeInTheDocument()
      })
    })

    it('calls decrypt with correct password', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'mypassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(mockDecrypt).toHaveBeenCalledWith(mockWallet.encryptedMnemonic, 'mypassword')
      })
    })

    it('navigates back when cancel is clicked', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      await userEvent.click(screen.getByText('取消'))

      expect(mockGoBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Mnemonic Display', () => {
    it('shows toggle visibility button after verification', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('隐藏')).toBeInTheDocument()
      })
    })

    it('toggles between show and hide', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('隐藏')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('隐藏'))

      expect(screen.getByText('显示')).toBeInTheDocument()
    })

    it('shows auto-hide message when visible', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('30秒后将自动隐藏')).toBeInTheDocument()
      })
    })

    it('hides auto-hide message when mnemonic is hidden', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('隐藏')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('隐藏'))

      expect(screen.queryByText('30秒后将自动隐藏')).not.toBeInTheDocument()
    })
  })

  describe('Security Features', () => {
    it('displays MnemonicDisplay component after verification', async () => {
      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByTestId('mnemonic-display')).toBeInTheDocument()
      })
    })
  })

  describe('Arbitrary Key Wallet', () => {
    it('renders secret textarea instead of mnemonic grid', async () => {
      mockCurrentWallet = { ...mockWallet, keyType: 'arbitrary' }
      mockDecrypt.mockResolvedValueOnce('my secret\nline2')

      renderWithProviders(<ViewMnemonicPage />)

      const input = screen.getByPlaceholderText('请输入密码')
      await userEvent.type(input, 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: '确认' }))

      await waitFor(() => {
        expect(screen.getByText('查看密钥')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('mnemonic-display')).not.toBeInTheDocument()
      expect(screen.getByTestId('secret-textarea')).toHaveValue('my secret\nline2')
    })
  })
})
