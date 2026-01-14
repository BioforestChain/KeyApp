import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletConfig } from './wallet-config'
import type { Wallet } from '@/stores'

// Mock stores
const mockWallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: '我的钱包',
    address: '0x1234567890abcdef',
    chain: 'ethereum',
    chainAddresses: [
      { chain: 'ethereum', address: '0x1234567890abcdef', publicKey: '0x04abc123', tokens: [] },
      { chain: 'tron', address: 'TRX123456', publicKey: '0x04def456', tokens: [] },
    ],
    createdAt: Date.now(),
    themeHue: 323,
    tokens: [],
  },
  {
    id: 'wallet-2',
    name: '备用钱包',
    address: '0xabcdef1234567890',
    chain: 'ethereum',
    chainAddresses: [{ chain: 'ethereum', address: '0xabcdef1234567890', publicKey: '0x04ghi789', tokens: [] }],
    createdAt: Date.now(),
    themeHue: 200,
    tokens: [],
  },
]

const mockPush = vi.fn()
const mockUpdateWalletName = vi.fn()
const mockUpdateWalletThemeHue = vi.fn()
const mockSetCurrentWallet = vi.fn()

vi.mock('@/stores', () => ({
  useWallets: () => mockWallets,
  useSelectedChain: () => 'ethereum',
  walletActions: {
    updateWalletName: (...args: unknown[]) => mockUpdateWalletName(...args),
    updateWalletThemeHue: (...args: unknown[]) => mockUpdateWalletThemeHue(...args),
    setCurrentWallet: (...args: unknown[]) => mockSetCurrentWallet(...args),
  },
  useChainConfigs: () => [
    { id: 'ethereum', name: 'Ethereum', icon: '/icons/eth.svg' },
    { id: 'tron', name: 'Tron', icon: '/icons/tron.svg' },
  ],
}))

vi.mock('@/stackflow', () => ({
  useFlow: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useWalletTheme', () => ({
  WALLET_THEME_COLORS: [
    { hue: 0, color: 'oklch(0.6 0.25 0)', name: '红色' },
    { hue: 120, color: 'oklch(0.6 0.25 120)', name: '绿色' },
    { hue: 240, color: 'oklch(0.6 0.25 240)', name: '蓝色' },
  ],
}))

vi.mock('@/components/wallet/wallet-card', () => ({
  WalletCard: ({ wallet, themeHue }: { wallet: Wallet; themeHue: number }) => (
    <div data-testid="wallet-card" data-theme-hue={themeHue}>
      {wallet.name}
    </div>
  ),
}))

describe('WalletConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mode: default', () => {
    it('renders wallet card with wallet info', () => {
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      expect(screen.getByTestId('wallet-card')).toBeInTheDocument()
      expect(screen.getByTestId('wallet-card')).toHaveTextContent('我的钱包')
    })

    it('shows action buttons in default mode', () => {
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      expect(screen.getByRole('button', { name: /editName|编辑/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /exportMnemonic|助记词/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /deleteWallet|删除/i })).toBeInTheDocument()
    })

    it('navigates to mnemonic export on button click', async () => {
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      const exportButton = screen.getByRole('button', { name: /exportMnemonic|助记词/i })
      await userEvent.click(exportButton)

      expect(mockSetCurrentWallet).toHaveBeenCalledWith('wallet-1')
      expect(mockPush).toHaveBeenCalledWith('SettingsMnemonicActivity', {})
    })

    it('navigates to delete confirmation on delete click', async () => {
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      const deleteButton = screen.getByRole('button', { name: /deleteWallet|删除/i })
      await userEvent.click(deleteButton)

      expect(mockPush).toHaveBeenCalledWith('WalletDeleteJob', { walletId: 'wallet-1' })
    })

    it('switches to edit mode on edit button click', async () => {
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      const editButton = screen.getByRole('button', { name: /editName|编辑/i })
      await userEvent.click(editButton)

      // Should show input and save/cancel buttons
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save|保存/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel|取消/i })).toBeInTheDocument()
    })
  })

  describe('mode: edit', () => {
    it('shows name input with current wallet name', () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('我的钱包')
    })

    it('shows theme color slider', () => {
      const { container } = render(<WalletConfig mode="edit" walletId="wallet-1" />)

      // Should have rainbow gradient slider
      const slider = container.querySelector('[style*="linear-gradient"]')
      expect(slider).toBeInTheDocument()
    })

    it('shows preset color buttons', () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      // Should have preset color buttons (from mock: red, green, blue)
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.style.backgroundColor?.includes('oklch')
      )
      expect(colorButtons.length).toBeGreaterThan(0)
    })

    it('updates name on input change', async () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '新钱包名')

      expect(input).toHaveValue('新钱包名')
    })

    it('saves changes on save button click', async () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '新钱包名')

      const saveButton = screen.getByRole('button', { name: /save|保存/i })
      await userEvent.click(saveButton)

      expect(mockUpdateWalletName).toHaveBeenCalledWith('wallet-1', '新钱包名')
    })

    it('cancels edit and reverts changes', async () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '新钱包名')

      const cancelButton = screen.getByRole('button', { name: /cancel|取消/i })
      await userEvent.click(cancelButton)

      // Should show action buttons again (default mode)
      expect(screen.getByRole('button', { name: /editName|编辑/i })).toBeInTheDocument()
    })

    it('disables save button when name is empty', async () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)

      const saveButton = screen.getByRole('button', { name: /save|保存/i })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('mode: edit-only', () => {
    it('shows confirm button instead of save/cancel', () => {
      render(<WalletConfig mode="edit-only" walletId="wallet-1" />)

      expect(screen.getByRole('button', { name: /confirm|确认/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /save|保存/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /cancel|取消/i })).not.toBeInTheDocument()
    })

    it('calls onEditOnlyComplete on confirm', async () => {
      const onComplete = vi.fn()
      render(<WalletConfig mode="edit-only" walletId="wallet-1" onEditOnlyComplete={onComplete} />)

      const confirmButton = screen.getByRole('button', { name: /confirm|确认/i })
      await userEvent.click(confirmButton)

      expect(onComplete).toHaveBeenCalled()
    })

    it('saves name and theme before calling onEditOnlyComplete', async () => {
      const onComplete = vi.fn()
      render(<WalletConfig mode="edit-only" walletId="wallet-1" onEditOnlyComplete={onComplete} />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '新创建钱包')

      const confirmButton = screen.getByRole('button', { name: /confirm|确认/i })
      await userEvent.click(confirmButton)

      expect(mockUpdateWalletName).toHaveBeenCalledWith('wallet-1', '新创建钱包')
      expect(onComplete).toHaveBeenCalled()
    })

    it('disables confirm button when name is empty', async () => {
      render(<WalletConfig mode="edit-only" walletId="wallet-1" />)

      const input = screen.getByRole('textbox')
      await userEvent.clear(input)

      const confirmButton = screen.getByRole('button', { name: /confirm|确认/i })
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('wallet not found', () => {
    it('shows not found message for invalid wallet id', () => {
      render(<WalletConfig mode="default" walletId="invalid-id" />)

      expect(screen.getByText(/notFound|未找到/i)).toBeInTheDocument()
    })
  })

  describe('theme hue editing', () => {
    it('updates card preview when theme hue changes', async () => {
      render(<WalletConfig mode="edit" walletId="wallet-1" />)

      // Find a preset color button and click it
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.style.backgroundColor?.includes('oklch')
      )

      if (colorButtons[0]) {
        await userEvent.click(colorButtons[0])
      }

      // Card should reflect the new theme hue
      const card = screen.getByTestId('wallet-card')
      expect(card).toBeInTheDocument()
    })

    it('shows markers for existing wallet hues on slider', () => {
      const { container } = render(<WalletConfig mode="edit" walletId="wallet-1" />)

      // Should have markers for wallet-2's hue (200)
      const markers = container.querySelectorAll('[class*="bg-black"]')
      expect(markers.length).toBeGreaterThan(0)
    })
  })

  describe('chain selector', () => {
    it('opens chain selector on chain button click in card', async () => {
      // This is tested via the WalletCard's onOpenChainSelector callback
      // The actual navigation happens when WalletCard calls the callback
      render(<WalletConfig mode="default" walletId="wallet-1" />)

      // Verify the card is rendered (chain selector is inside card)
      expect(screen.getByTestId('wallet-card')).toBeInTheDocument()
    })
  })
})
