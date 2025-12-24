import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput, calculateStrength } from './password-input'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('calculateStrength', () => {
  it('returns weak for empty password', () => {
    expect(calculateStrength('')).toBe('weak')
  })

  it('returns weak for short password', () => {
    expect(calculateStrength('abc')).toBe('weak')
  })

  it('returns weak for simple password', () => {
    expect(calculateStrength('123456')).toBe('weak')
  })

  it('returns medium for decent password', () => {
    expect(calculateStrength('Password1')).toBe('medium')
  })

  it('returns strong for complex password', () => {
    expect(calculateStrength('MyP@ssw0rd!23')).toBe('strong')
  })
})

describe('PasswordInput', () => {
  it('renders password input', () => {
    renderWithProviders(<PasswordInput placeholder="Enter password" />)
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility', async () => {
    renderWithProviders(<PasswordInput placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button', { name: testI18n.t('a11y.showPassword') })

    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: testI18n.t('a11y.hidePassword') })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: testI18n.t('a11y.hidePassword') }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('shows strength indicator when enabled', async () => {
    renderWithProviders(<PasswordInput showStrength />)
    const input = document.querySelector('input')!

    await userEvent.type(input, 'test')
    expect(screen.getByText(/密码强度/)).toBeInTheDocument()
  })

  it('calls onChange handler', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<PasswordInput onChange={handleChange} />)

    const input = document.querySelector('input')!
    await userEvent.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('calls onStrengthChange when strength changes', async () => {
    const handleStrengthChange = vi.fn()
    renderWithProviders(<PasswordInput showStrength onStrengthChange={handleStrengthChange} />)

    const input = document.querySelector('input')!
    await userEvent.type(input, 'MyP@ssw0rd!')
    expect(handleStrengthChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(<PasswordInput disabled />)
    expect(document.querySelector('input')).toBeDisabled()
  })

  it('applies custom className', () => {
    renderWithProviders(<PasswordInput className="custom-class" />)
    expect(document.querySelector('input')).toHaveClass('custom-class')
  })
})
