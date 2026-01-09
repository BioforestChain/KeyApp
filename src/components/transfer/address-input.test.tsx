import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressInput, isValidAddress } from './address-input'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock clipboard service
const { mockClipboardRead } = vi.hoisted(() => ({
  mockClipboardRead: vi.fn().mockResolvedValue(''),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: vi.fn().mockResolvedValue(undefined),
    read: mockClipboardRead,
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('isValidAddress', () => {
  it('returns true for empty string', () => {
    expect(isValidAddress('')).toBe(true)
  })

  it('validates ETH address', () => {
    expect(isValidAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
    expect(isValidAddress('0x123')).toBe(false)
  })

  it('validates TRON address', () => {
    expect(isValidAddress('TRXabcdefghijklmnopqrstuvwxyz1234')).toBe(true)
  })

  it('validates BTC address', () => {
    expect(isValidAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true)
    expect(isValidAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true)
  })
})

describe('AddressInput', () => {
  it('renders with label', () => {
    renderWithProviders(<AddressInput label="收款地址" />)
    expect(screen.getByText('收款地址')).toBeInTheDocument()
  })

  it('renders input with placeholder', () => {
    renderWithProviders(<AddressInput />)
    expect(screen.getByPlaceholderText('输入或粘贴地址')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<AddressInput onChange={handleChange} />)

    const input = screen.getByPlaceholderText('输入或粘贴地址')
    await userEvent.type(input, '0x123')

    expect(handleChange).toHaveBeenCalled()
  })

  it('shows scan button when onScan provided', () => {
    renderWithProviders(<AddressInput onScan={() => {}} />)
    expect(screen.getByRole('button', { name: '扫描二维码' })).toBeInTheDocument()
  })

  it('calls onScan when scan button clicked', async () => {
    const handleScan = vi.fn()
    renderWithProviders(<AddressInput onScan={handleScan} />)

    await userEvent.click(screen.getByRole('button', { name: '扫描二维码' }))
    expect(handleScan).toHaveBeenCalled()
  })

  it('shows paste button', () => {
    renderWithProviders(<AddressInput />)
    expect(screen.getByRole('button', { name: '粘贴' })).toBeInTheDocument()
  })

  it('pastes from clipboard when paste button clicked', async () => {
    mockClipboardRead.mockResolvedValue('0xtest123')

    const handleChange = vi.fn()
    renderWithProviders(<AddressInput onChange={handleChange} />)

    await userEvent.click(screen.getByRole('button', { name: '粘贴' }))
    expect(mockClipboardRead).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith('0xtest123')
  })

  it('shows error message', () => {
    renderWithProviders(<AddressInput error="地址无效" />)
    expect(screen.getByText('地址无效')).toBeInTheDocument()
  })

  it('shows invalid format error for short addresses', () => {
    renderWithProviders(<AddressInput value="abc" />)
    expect(screen.getByText('无效的地址格式')).toBeInTheDocument()
  })

  it('does not show error for valid address', () => {
    renderWithProviders(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    expect(screen.queryByText('无效的地址格式')).not.toBeInTheDocument()
  })

  it('switches to display mode when unfocused and has valid value', () => {
    renderWithProviders(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    
    // Check if input is not rendered
    expect(screen.queryByTestId('address-input')).not.toBeInTheDocument()
    
    // AddressDisplay component renders the truncated address.
    // The previous error showed the DOM structure:
    // <span ... title="0x1234567890abcdef1234567890abcdef12345678">
    //   <span class="invisible">0</span>
    //   <span class="absolute inset-0 truncate">0x1234567890abcdef1234567890abcdef12345678</span>
    // </span>
    // We should search for the full address text since it is present in the DOM (even if visually truncated by CSS).
    // The truncated visual '...' is calculated by JS canvas in AddressDisplay and set to state, 
    // BUT initial render might be full text or placeholder depending on how AddressDisplay behaves in JSDOM where layout might not trigger the same way.
    // Looking at AddressDisplay implementation, it uses useLayoutEffect and ResizeObserver.
    // In JSDOM/Vitest, clientWidth might be 0, causing it to render full text or placeholder.
    // Let's check for the presence of the full address text in the document.
    
    expect(screen.getByText('0x1234567890abcdef1234567890abcdef12345678')).toBeInTheDocument()
  })

  it('switches to input mode when clicked', async () => {
    renderWithProviders(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    
    // Initially in display mode
    expect(screen.queryByTestId('address-input')).not.toBeInTheDocument()
    
    // Click the container (we can click the text which we confirmed exists)
    await userEvent.click(screen.getByText('0x1234567890abcdef1234567890abcdef12345678'))
    
    // Should now show input
    expect(screen.getByTestId('address-input')).toBeInTheDocument()
    expect(screen.getByTestId('address-input')).toHaveValue('0x1234567890abcdef1234567890abcdef12345678')
    expect(screen.getByTestId('address-input')).toHaveFocus()
  })

  it('stays in input mode when value is empty', () => {
    renderWithProviders(<AddressInput value="" />)
    expect(screen.getByTestId('address-input')).toBeInTheDocument()
  })

  it('stays in input mode when error exists', () => {
    renderWithProviders(<AddressInput value="invalid" error="error" />)
    expect(screen.getByTestId('address-input')).toBeInTheDocument()
  })

  it('switches to input mode when navigating with Tab key (Enter/Space to activate)', async () => {
    renderWithProviders(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    
    // Initially in display mode
    expect(screen.queryByTestId('address-input')).not.toBeInTheDocument()
    
    // Press Tab to focus the display container
    await userEvent.tab()
    
    // Since we implemented "onFocus -> switch to edit mode", just tabbing into it
    // should immediately switch it to edit mode and focus the input.
    
    // Should now show input and be focused
    expect(screen.getByTestId('address-input')).toBeInTheDocument()
    expect(screen.getByTestId('address-input')).toHaveFocus()
  })

  it('shows placeholder icon in display mode for unknown address', () => {
    renderWithProviders(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    
    const addressText = screen.getByText('0x1234567890abcdef1234567890abcdef12345678')
    const displayContainer = addressText.closest('.group')
    
    // Verify the placeholder icon container exists
    // The container has specific classes: "bg-muted flex size-10 shrink-0 items-center justify-center rounded-full"
    // We can check if such an element exists within the displayContainer
    const iconContainer = displayContainer?.querySelector('.bg-muted.size-10.rounded-full')
    expect(iconContainer).toBeInTheDocument()
    
    // Verify it contains an SVG (IconWallet)
    expect(iconContainer?.querySelector('svg')).toBeInTheDocument()
  })
})
