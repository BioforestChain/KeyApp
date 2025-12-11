import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletEditSheet } from './wallet-edit-sheet'
import { walletStore, walletActions, type Wallet } from '@/stores'
import * as crypto from '@/lib/crypto'

// Mock crypto module
vi.mock('@/lib/crypto', async () => {
  const actual = await vi.importActual('@/lib/crypto')
  return {
    ...actual,
    verifyPassword: vi.fn(),
  }
})

const createMockWallet = (id: string, name: string): Wallet => ({
  id,
  name,
  address: `0x${id}abc123def456`,
  chain: 'ethereum',
  encryptedMnemonic: {
    ciphertext: 'test',
    iv: 'test',
    salt: 'test',
    iterations: 100000,
  },
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id}abc123def456`,
      tokens: [],
    },
  ],
  tokens: [],
  createdAt: Date.now(),
})

describe('WalletEditSheet', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    walletStore.setState({
      wallets: [createMockWallet('1', 'Test Wallet')],
      currentWalletId: '1',
      isInitialized: true,
      isLoading: false,
      selectedChain: 'ethereum',
    })
  })

  it('renders menu with rename and delete options', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('重命名')).toBeInTheDocument()
    expect(screen.getByText('删除钱包')).toBeInTheDocument()
  })

  it('closes when overlay is clicked', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    // Click overlay (background)
    const overlay = document.querySelector('[aria-hidden="true"]')
    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('shows rename form when rename is clicked', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('重命名'))

    expect(screen.getByLabelText('钱包名称')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Wallet')).toBeInTheDocument()
  })

  it('saves new wallet name', () => {
    const wallet = createMockWallet('1', 'Test Wallet')
    const updateWalletNameSpy = vi.spyOn(walletActions, 'updateWalletName')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    // Go to rename mode
    fireEvent.click(screen.getByText('重命名'))

    // Change name
    const input = screen.getByLabelText('钱包名称')
    fireEvent.change(input, { target: { value: 'New Name' } })

    // Save
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    expect(updateWalletNameSpy).toHaveBeenCalledWith('1', 'New Name')
    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('disables save when name is empty', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('重命名'))

    const input = screen.getByLabelText('钱包名称')
    fireEvent.change(input, { target: { value: '' } })

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('disables save when name is unchanged', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('重命名'))

    // Name is already 'Test Wallet', no change
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('shows password confirm when delete is clicked', () => {
    const wallet = createMockWallet('1', 'Test Wallet')

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('删除钱包'))

    // PasswordConfirmSheet shows title "删除钱包" and description with "此操作无法撤销"
    expect(screen.getByText(/此操作无法撤销/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument()
  })

  it('deletes wallet after password verification', async () => {
    const wallet = createMockWallet('1', 'Test Wallet')
    const deleteWalletSpy = vi.spyOn(walletActions, 'deleteWallet')
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    // Go to delete mode
    fireEvent.click(screen.getByText('删除钱包'))

    // Enter password
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    fireEvent.change(passwordInput, { target: { value: 'correct-password' } })

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(deleteWalletSpy).toHaveBeenCalledWith('1')
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('shows error on wrong password', async () => {
    const wallet = createMockWallet('1', 'Test Wallet')
    vi.mocked(crypto.verifyPassword).mockResolvedValue(false)

    render(
      <WalletEditSheet
        wallet={wallet}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('删除钱包'))

    const passwordInput = screen.getByPlaceholderText('请输入密码')
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } })

    fireEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(screen.getByText('密码错误')).toBeInTheDocument()
    })
  })
})
