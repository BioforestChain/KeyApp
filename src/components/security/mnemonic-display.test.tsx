import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MnemonicDisplay } from './mnemonic-display'
import { TestI18nProvider } from '@/test/i18n-mock'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

const mockWords = ['abandon', 'ability', 'able', 'about', 'above', 'absent']

describe('MnemonicDisplay', () => {
  it('renders all words with indices', () => {
    renderWithI18n(<MnemonicDisplay words={mockWords} />)
    
    mockWords.forEach((word, index) => {
      expect(screen.getByText(word)).toBeInTheDocument()
      expect(screen.getByText(String(index + 1))).toBeInTheDocument()
    })
  })

  it('hides words when hidden is true', () => {
    renderWithI18n(<MnemonicDisplay words={mockWords} hidden />)
    
    mockWords.forEach((word) => {
      expect(screen.queryByText(word)).not.toBeInTheDocument()
    })
    expect(screen.getAllByText('••••••').length).toBe(mockWords.length)
  })

  it('copies mnemonic to clipboard', async () => {
    const mockClipboard = vi.fn()
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    })

    const handleCopy = vi.fn()
    renderWithI18n(<MnemonicDisplay words={mockWords} onCopy={handleCopy} />)
    
    await userEvent.click(screen.getByRole('button', { name: /复制助记词/ }))
    
    expect(mockClipboard).toHaveBeenCalledWith(mockWords.join(' '))
    expect(handleCopy).toHaveBeenCalled()
  })

  it('shows copied state after clicking copy', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() },
    })

    renderWithI18n(<MnemonicDisplay words={mockWords} />)
    
    await userEvent.click(screen.getByRole('button', { name: /复制助记词/ }))
    expect(screen.getByText('已复制')).toBeInTheDocument()
  })

  it('disables copy button when hidden', () => {
    renderWithI18n(<MnemonicDisplay words={mockWords} hidden />)
    expect(screen.getByRole('button', { name: /复制助记词/ })).toBeDisabled()
  })

  it('applies blur effect when hidden', () => {
    const { container } = renderWithI18n(<MnemonicDisplay words={mockWords} hidden />)
    const hiddenTexts = container.querySelectorAll('.blur-sm')
    expect(hiddenTexts.length).toBe(mockWords.length)
  })
})
