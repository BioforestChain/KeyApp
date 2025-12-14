import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestI18nProvider } from '@/test/i18n-mock'
import { KeyTypeSelector, type WalletKeyType } from './key-type-selector'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('KeyTypeSelector', () => {
  it('renders with default selection', () => {
    renderWithProviders(<KeyTypeSelector value="mnemonic" onChange={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn<(value: WalletKeyType) => void>()
    renderWithProviders(<KeyTypeSelector value="mnemonic" onChange={onChange} />)

    const arbitrary = screen.getByRole('radio', { name: /任意密钥/ })
    await user.click(arbitrary)

    expect(onChange).toHaveBeenCalledWith('arbitrary')
  })

  it('disables interaction when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn<(value: WalletKeyType) => void>()
    renderWithProviders(<KeyTypeSelector value="mnemonic" onChange={onChange} disabled />)

    const arbitrary = screen.getByRole('radio', { name: /任意密钥/ })
    expect(arbitrary).toBeDisabled()
    await user.click(arbitrary)
    expect(onChange).not.toHaveBeenCalled()
  })
})
