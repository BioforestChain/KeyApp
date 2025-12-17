import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressBookPage } from './index'
import { addressBookActions, walletStore, type Contact } from '@/stores'

// Mock dependencies
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => ({}),
}))

vi.mock('@/components/layout/page-header', () => ({
  PageHeader: ({ title, onBack, rightAction }: { title: string; onBack?: () => void; rightAction?: React.ReactNode }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {onBack && <button onClick={onBack} data-testid="back-button">返回</button>}
      {rightAction}
    </div>
  ),
}))

vi.mock('@/components/address-book/contact-edit-sheet', () => ({
  ContactEditSheet: ({ open, onClose, contact }: { open: boolean; onClose: () => void; contact?: Contact | null }) => (
    open ? (
      <div data-testid="contact-edit-sheet">
        <span>{contact ? '编辑联系人' : '添加联系人'}</span>
        <button onClick={onClose} data-testid="close-edit-sheet">关闭</button>
      </div>
    ) : null
  ),
}))

vi.mock('@/components/security/password-confirm-sheet', () => ({
  PasswordConfirmSheet: ({ open, onClose, onVerify }: { open: boolean; onClose: () => void; onVerify: (pw: string) => void }) => (
    open ? (
      <div data-testid="password-confirm-sheet">
        <button onClick={onClose} data-testid="cancel-delete">取消</button>
        <button onClick={() => onVerify('test')} data-testid="confirm-delete">确认删除</button>
      </div>
    ) : null
  ),
}))

const mockNavigate = vi.fn()

describe('AddressBookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addressBookActions.clearAll()
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      isInitialized: true,
      isLoading: false,
      selectedChain: 'ethereum',
    })
  })

  it('renders empty state when no contacts', () => {
    render(<AddressBookPage />)

    expect(screen.getByText('还没有联系人')).toBeInTheDocument()
    // Both header and empty state have add buttons
    const addButtons = screen.getAllByRole('button', { name: '添加联系人' })
    expect(addButtons.length).toBe(2)
  })

  it('renders contact list when contacts exist', () => {
    addressBookActions.addContact({ name: 'Alice', address: '0x1111' })
    addressBookActions.addContact({ name: 'Bob', address: '0x2222' })

    render(<AddressBookPage />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('还没有联系人')).not.toBeInTheDocument()
  })

  it('filters contacts by search query', () => {
    addressBookActions.addContact({ name: 'Alice', address: '0x1111' })
    addressBookActions.addContact({ name: 'Bob', address: '0x2222' })

    render(<AddressBookPage />)

    const searchInput = screen.getByPlaceholderText('搜索联系人')
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows empty search result message', () => {
    addressBookActions.addContact({ name: 'Alice', address: '0x1111' })

    render(<AddressBookPage />)

    const searchInput = screen.getByPlaceholderText('搜索联系人')
    fireEvent.change(searchInput, { target: { value: 'xyz' } })

    expect(screen.getByText('没有找到联系人')).toBeInTheDocument()
  })

  it('opens add contact sheet from empty state button', () => {
    render(<AddressBookPage />)

    // Click the text button in empty state (not the icon button in header)
    const addButtons = screen.getAllByRole('button', { name: '添加联系人' })
    fireEvent.click(addButtons[1]!) // Second button is the text button

    expect(screen.getByTestId('contact-edit-sheet')).toBeInTheDocument()
  })

  it('opens edit contact sheet when edit is clicked', () => {
    addressBookActions.addContact({ name: 'Alice', address: '0x1111' })

    render(<AddressBookPage />)

    // Click more actions button
    const moreButton = screen.getByRole('button', { name: '更多操作' })
    fireEvent.click(moreButton)

    // Click edit button
    const editButton = screen.getByText('编辑')
    fireEvent.click(editButton)

    expect(screen.getByTestId('contact-edit-sheet')).toBeInTheDocument()
  })

  it('opens delete confirmation when delete is clicked', () => {
    addressBookActions.addContact({ name: 'Alice', address: '0x1111' })

    render(<AddressBookPage />)

    // Click more actions button
    const moreButton = screen.getByRole('button', { name: '更多操作' })
    fireEvent.click(moreButton)

    // Click delete button
    const deleteButton = screen.getByText('删除')
    fireEvent.click(deleteButton)

    expect(screen.getByTestId('password-confirm-sheet')).toBeInTheDocument()
  })

  it('navigates back when back button is clicked', () => {
    render(<AddressBookPage />)

    const backButton = screen.getByTestId('back-button')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
