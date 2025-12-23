import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressBookPage } from './index'
import { addressBookActions, walletStore } from '@/stores'

const mockPush = vi.fn()

// Helper to create addresses
function createAddresses(address: string, chainType = 'ethereum') {
  return [{ id: crypto.randomUUID(), address, chainType: chainType as 'ethereum' }]
}

// Mock dependencies
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useActivityParams: () => ({}),
  useFlow: () => ({ push: mockPush }),
}))

vi.mock('@/stackflow/activities/sheets', () => ({
  setPasswordConfirmCallback: vi.fn(),
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

const mockNavigate = vi.fn()
const mockGoBack = vi.fn()

describe('AddressBookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addressBookActions.clearAll()
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      isInitialized: true,
      isLoading: false,
      chainPreferences: {},
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
    addressBookActions.addContact({ name: 'Alice', addresses: createAddresses('0x1111') })
    addressBookActions.addContact({ name: 'Bob', addresses: createAddresses('0x2222') })

    render(<AddressBookPage />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('还没有联系人')).not.toBeInTheDocument()
  })

  it('filters contacts by search query', () => {
    addressBookActions.addContact({ name: 'Alice', addresses: createAddresses('0x1111') })
    addressBookActions.addContact({ name: 'Bob', addresses: createAddresses('0x2222') })

    render(<AddressBookPage />)

    const searchInput = screen.getByPlaceholderText('搜索联系人')
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows empty search result message', () => {
    addressBookActions.addContact({ name: 'Alice', addresses: createAddresses('0x1111') })

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

    expect(mockPush).toHaveBeenCalledWith('ContactEditJob', {})
  })

  it('opens edit contact sheet when edit is clicked', () => {
    const contact = addressBookActions.addContact({ name: 'Alice', addresses: createAddresses('0x1111') })

    render(<AddressBookPage />)

    // Click more actions button
    const moreButton = screen.getByRole('button', { name: '更多操作' })
    fireEvent.click(moreButton)

    // Click edit button
    const editButton = screen.getByText('编辑')
    fireEvent.click(editButton)

    expect(mockPush).toHaveBeenCalledWith('ContactEditJob', { contactId: contact.id })
  })

  it('deletes contact directly when no wallet exists', () => {
    addressBookActions.addContact({ name: 'Alice', addresses: createAddresses('0x1111') })

    render(<AddressBookPage />)

    // Click more actions button
    const moreButton = screen.getByRole('button', { name: '更多操作' })
    fireEvent.click(moreButton)

    // Click delete button
    const deleteButton = screen.getByText('删除')
    fireEvent.click(deleteButton)

    // Without wallet, contact is deleted directly
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('navigates back when back button is clicked', () => {
    render(<AddressBookPage />)

    const backButton = screen.getByTestId('back-button')
    fireEvent.click(backButton)

    expect(mockGoBack).toHaveBeenCalled()
  })

  it('displays multiple addresses count', () => {
    addressBookActions.addContact({
      name: 'Multi',
      addresses: [
        { id: '1', address: '0x1111', chainType: 'ethereum' },
        { id: '2', address: 'b7ADmv...', chainType: 'bfmeta' },
      ],
    })

    render(<AddressBookPage />)

    expect(screen.getByText('Multi')).toBeInTheDocument()
    expect(screen.getByText(/\+1/)).toBeInTheDocument() // Shows (+1) for additional addresses
  })
})
