import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressInput, isValidAddress } from './address-input'

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
    render(<AddressInput label="收款地址" />)
    expect(screen.getByText('收款地址')).toBeInTheDocument()
  })

  it('renders input with placeholder', () => {
    render(<AddressInput />)
    expect(screen.getByPlaceholderText('输入或粘贴地址')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn()
    render(<AddressInput onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText('输入或粘贴地址')
    await userEvent.type(input, '0x123')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows scan button when onScan provided', () => {
    render(<AddressInput onScan={() => {}} />)
    expect(screen.getByRole('button', { name: '扫描二维码' })).toBeInTheDocument()
  })

  it('calls onScan when scan button clicked', async () => {
    const handleScan = vi.fn()
    render(<AddressInput onScan={handleScan} />)
    
    await userEvent.click(screen.getByRole('button', { name: '扫描二维码' }))
    expect(handleScan).toHaveBeenCalled()
  })

  it('shows paste button', () => {
    render(<AddressInput />)
    expect(screen.getByRole('button', { name: '粘贴' })).toBeInTheDocument()
  })

  it('pastes from clipboard when paste button clicked', async () => {
    const mockClipboard = vi.fn().mockResolvedValue('0xtest123')
    Object.assign(navigator, {
      clipboard: { readText: mockClipboard },
    })

    const handleChange = vi.fn()
    render(<AddressInput onChange={handleChange} />)
    
    await userEvent.click(screen.getByRole('button', { name: '粘贴' }))
    expect(mockClipboard).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith('0xtest123')
  })

  it('shows error message', () => {
    render(<AddressInput error="地址无效" />)
    expect(screen.getByText('地址无效')).toBeInTheDocument()
  })

  it('shows invalid format error for short addresses', () => {
    render(<AddressInput value="abc" />)
    expect(screen.getByText('无效的地址格式')).toBeInTheDocument()
  })

  it('does not show error for valid address', () => {
    render(<AddressInput value="0x1234567890abcdef1234567890abcdef12345678" />)
    expect(screen.queryByText('无效的地址格式')).not.toBeInTheDocument()
  })
})
