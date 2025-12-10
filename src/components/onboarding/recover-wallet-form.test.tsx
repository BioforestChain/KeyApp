import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecoverWalletForm, validateMnemonicInput } from './recover-wallet-form'

// Test mnemonic (from BIP39 test vectors - never use in production)
const VALID_12_WORD_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const VALID_24_WORD_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'

describe('validateMnemonicInput', () => {
  it('returns empty result for empty input', () => {
    const result = validateMnemonicInput('')
    expect(result.isValid).toBe(false)
    expect(result.wordCount).toBe(0)
    expect(result.invalidWords).toHaveLength(0)
  })

  it('validates 12-word mnemonic', () => {
    const result = validateMnemonicInput(VALID_12_WORD_MNEMONIC)
    expect(result.isValid).toBe(true)
    expect(result.wordCount).toBe(12)
    expect(result.invalidWords).toHaveLength(0)
  })

  it('validates 24-word mnemonic', () => {
    const result = validateMnemonicInput(VALID_24_WORD_MNEMONIC)
    expect(result.isValid).toBe(true)
    expect(result.wordCount).toBe(24)
    expect(result.invalidWords).toHaveLength(0)
  })

  it('detects invalid words not in BIP39 wordlist', () => {
    const result = validateMnemonicInput('abandon invalid123 abandon')
    expect(result.isValid).toBe(false)
    expect(result.invalidWords).toContain('invalid123')
  })

  it('detects invalid word count', () => {
    const result = validateMnemonicInput('abandon abandon abandon') // Only 3 words
    expect(result.isValid).toBe(false)
    expect(result.wordCount).toBe(3)
    expect(result.expectedWordCount).toBe(12) // Nearest valid
  })

  it('handles extra whitespace', () => {
    const result = validateMnemonicInput('  abandon   abandon   abandon  ')
    expect(result.wordCount).toBe(3)
  })

  it('normalizes to lowercase', () => {
    const result = validateMnemonicInput('ABANDON ABANDON ABANDON')
    expect(result.invalidWords).toHaveLength(0) // Should recognize uppercase
  })

  it('detects checksum failure', () => {
    // Valid words but invalid checksum
    const result = validateMnemonicInput(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon',
    )
    expect(result.isValid).toBe(false) // Checksum should fail
    expect(result.wordCount).toBe(12)
    expect(result.invalidWords).toHaveLength(0)
  })

  it('validates 15-word mnemonic count', () => {
    const result = validateMnemonicInput('word '.repeat(15).trim())
    // Word count is valid (15), but words themselves may not be valid
    expect(result.wordCount).toBe(15)
    expect(result.expectedWordCount).toBe(15)
  })

  it('validates 18-word mnemonic count', () => {
    const result = validateMnemonicInput('word '.repeat(18).trim())
    expect(result.wordCount).toBe(18)
    expect(result.expectedWordCount).toBe(18)
  })

  it('validates 21-word mnemonic count', () => {
    const result = validateMnemonicInput('word '.repeat(21).trim())
    expect(result.wordCount).toBe(21)
    expect(result.expectedWordCount).toBe(21)
  })

  it('validates 36-word mnemonic count', () => {
    const result = validateMnemonicInput('word '.repeat(36).trim())
    expect(result.wordCount).toBe(36)
    expect(result.expectedWordCount).toBe(36)
  })
})

describe('RecoverWalletForm', () => {
  const user = userEvent.setup()

  it('renders empty form initially', () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    expect(screen.getByPlaceholderText(/请输入您的助记词/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '继续' })).toBeDisabled()
  })

  it('shows word count as user types', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, 'abandon abandon abandon')

    await waitFor(() => {
      expect(screen.getByText('3 个单词')).toBeInTheDocument()
    })
  })

  it('enables submit button with valid mnemonic', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, VALID_12_WORD_MNEMONIC)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '继续' })).toBeEnabled()
    })
  })

  it('calls onSubmit with mnemonic data', async () => {
    const handleSubmit = vi.fn()
    render(<RecoverWalletForm onSubmit={handleSubmit} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, VALID_12_WORD_MNEMONIC)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '继续' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '继续' }))

    expect(handleSubmit).toHaveBeenCalledWith({
      mnemonic: VALID_12_WORD_MNEMONIC.split(' '),
      wordCount: 12,
    })
  })

  it('shows error for invalid words', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, 'abandon invalidword123 abandon')

    await waitFor(() => {
      expect(screen.getByText(/不是有效的 BIP39 单词/)).toBeInTheDocument()
    })
  })

  it('shows warning for incomplete word count', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, 'abandon abandon abandon abandon abandon') // 5 words

    await waitFor(() => {
      expect(screen.getByText(/需要 12 个/)).toBeInTheDocument()
    })
  })

  it('shows success message for valid mnemonic', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, VALID_12_WORD_MNEMONIC)

    await waitFor(() => {
      expect(screen.getByText(/符合 BIP39 标准/)).toBeInTheDocument()
    })
  })

  it('clears input when clear button clicked', async () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/) as HTMLTextAreaElement
    await user.type(textarea, 'abandon abandon')

    const clearButton = screen.getByRole('button', { name: '清除' })
    await user.click(clearButton)

    expect(textarea.value).toBe('')
  })

  it('disables form when isSubmitting', () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} isSubmitting />)

    expect(screen.getByPlaceholderText(/请输入您的助记词/)).toBeDisabled()
    expect(screen.getByRole('button', { name: '验证中...' })).toBeDisabled()
  })

  it('handles paste of full mnemonic', async () => {
    const handleSubmit = vi.fn()
    render(<RecoverWalletForm onSubmit={handleSubmit} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)

    // Simulate paste
    fireEvent.change(textarea, { target: { value: VALID_12_WORD_MNEMONIC } })

    await waitFor(() => {
      expect(screen.getByText('12 个单词')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '继续' })).toBeEnabled()
    })
  })

  it('prevents form submission with invalid mnemonic', async () => {
    const handleSubmit = vi.fn()
    render(<RecoverWalletForm onSubmit={handleSubmit} />)

    const textarea = screen.getByPlaceholderText(/请输入您的助记词/)
    await user.type(textarea, 'invalid mnemonic')

    // Try to submit by pressing Enter (shouldn't work)
    fireEvent.submit(textarea.closest('form')!)

    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('shows security notice', () => {
    render(<RecoverWalletForm onSubmit={vi.fn()} />)

    expect(screen.getByText(/请确保在安全的环境中输入助记词/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<RecoverWalletForm onSubmit={vi.fn()} className="custom-class" />)

    expect(container.querySelector('form')).toHaveClass('custom-class')
  })
})
