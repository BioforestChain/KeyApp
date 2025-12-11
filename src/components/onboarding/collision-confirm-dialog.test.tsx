import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CollisionConfirmDialog } from './collision-confirm-dialog'
import type { DuplicateCheckResult } from '@/services/wallet/types'

const mockPrivateKeyCollision: DuplicateCheckResult = {
  isDuplicate: true,
  type: 'privateKey',
  matchedWallet: {
    id: 'pk-wallet-1',
    name: 'My PK Wallet',
    importType: 'privateKey',
    matchedAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1aB23',
  },
}

const mockAddressCollision: DuplicateCheckResult = {
  isDuplicate: true,
  type: 'address',
  matchedWallet: {
    id: 'wallet-1',
    name: 'Existing Wallet',
    importType: 'mnemonic',
    matchedAddress: '0x123...',
  },
}

const mockNoCollision: DuplicateCheckResult = {
  isDuplicate: false,
  type: 'none',
}

describe('CollisionConfirmDialog', () => {
  const user = userEvent.setup()

  it('renders collision warning for private key collision', () => {
    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('检测到地址冲突')).toBeInTheDocument()
    expect(screen.getByText('My PK Wallet')).toBeInTheDocument()
    expect(screen.getByText('私钥导入的钱包')).toBeInTheDocument()
  })

  it('shows matched address', () => {
    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(
      screen.getByText('0x742d35Cc6634C0532925a3b844Bc9e7595f1aB23'),
    ).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const handleConfirm = vi.fn()

    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '确认替换' }))

    expect(handleConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const handleCancel = vi.fn()

    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(handleCancel).toHaveBeenCalledOnce()
  })

  it('shows loading state', () => {
    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isLoading
      />,
    )

    expect(screen.getByRole('button', { name: '处理中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
  })

  it('renders nothing for non-privateKey collision type', () => {
    const { container } = render(
      <CollisionConfirmDialog
        result={mockAddressCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when no collision', () => {
    const { container } = render(
      <CollisionConfirmDialog
        result={mockNoCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('includes wallet name in warning message', () => {
    render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('「My PK Wallet」')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CollisionConfirmDialog
        result={mockPrivateKeyCollision}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        className="custom-class"
      />,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
