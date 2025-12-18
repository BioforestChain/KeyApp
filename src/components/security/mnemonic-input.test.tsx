import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MnemonicInput } from './mnemonic-input'
import { TestI18nProvider } from '@/test/i18n-mock'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

describe('MnemonicInput', () => {
  it('renders correct number of inputs for 12 words', () => {
    renderWithI18n(<MnemonicInput wordCount={12} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(12)
  })

  it('renders correct number of inputs for 24 words', () => {
    renderWithI18n(<MnemonicInput wordCount={24} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(24)
  })

  it('shows word indices', () => {
    renderWithI18n(<MnemonicInput wordCount={12} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('updates filled count as user types', async () => {
    renderWithI18n(<MnemonicInput wordCount={12} />)
    
    expect(screen.getByText('已输入 0/12 个单词')).toBeInTheDocument()
    
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0]!, 'abandon')
    
    expect(screen.getByText('已输入 1/12 个单词')).toBeInTheDocument()
  })

  it('calls onChange when words change', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<MnemonicInput wordCount={12} onChange={handleChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0]!, 'abandon')
    
    expect(handleChange).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining(['abandon']),
      false
    )
  })

  it('calls onComplete when all words filled', async () => {
    const handleComplete = vi.fn()
    renderWithI18n(<MnemonicInput wordCount={12} onComplete={handleComplete} />)
    
    const inputs = screen.getAllByRole('textbox')
    for (let i = 0; i < 12; i++) {
      await userEvent.type(inputs[i]!, `word${i}`)
    }
    
    expect(handleComplete).toHaveBeenCalled()
  })

  it('handles paste of multiple words', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<MnemonicInput wordCount={12} onChange={handleChange} />)
    
    const inputs = screen.getAllByRole('textbox')
    const pasteText = 'abandon ability able about above absent'
    
    await userEvent.click(inputs[0]!)
    await userEvent.paste(pasteText)
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows clear button when words are entered', async () => {
    renderWithI18n(<MnemonicInput wordCount={12} />)
    
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument()
    
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0]!, 'test')
    
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument()
  })

  it('clears all words when clear button clicked', async () => {
    renderWithI18n(<MnemonicInput wordCount={12} />)
    
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0]!, 'test')
    await userEvent.type(inputs[1]!, 'word')
    
    await userEvent.click(screen.getByRole('button', { name: '清除' }))
    
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
    expect(screen.getByText('已输入 0/12 个单词')).toBeInTheDocument()
  })
})
