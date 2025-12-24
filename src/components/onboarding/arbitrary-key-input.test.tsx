import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { TestI18nProvider, testI18n } from '@/test/i18n-mock'
import { ArbitraryKeyInput } from './arbitrary-key-input'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('ArbitraryKeyInput', () => {
  const placeholder = testI18n.t('onboarding:arbitraryKey.placeholder')
  const resetLabel = testI18n.t('common:reset')
  const hintText = testI18n.t('onboarding:arbitraryKey.hint')

  it('calls onChange on input changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    function Harness() {
      const [value, setValue] = useState('')
      return (
        <ArbitraryKeyInput
          value={value}
          onChange={(next) => {
            setValue(next)
            onChange(next)
          }}
        />
      )
    }

    renderWithProviders(<Harness />)

    const textarea = screen.getByPlaceholderText(placeholder)
    await user.type(textarea, 'my secret')

    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith('my secret')
  })

  it('clears input when reset button clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<ArbitraryKeyInput value="abc" onChange={onChange} />)

    const textarea = screen.getByRole('textbox')
    await user.click(screen.getByRole('button', { name: resetLabel }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(textarea).toHaveFocus()
  })

  it('toggles hide/show', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArbitraryKeyInput value="abc" onChange={vi.fn()} />)

    const showBtn = screen.getByRole('button', { name: testI18n.t('common:a11y.showPassword') })
    await user.click(showBtn)

    expect(screen.getByRole('button', { name: testI18n.t('common:a11y.hidePassword') })).toBeInTheDocument()
  })

  it('shows hint when empty', () => {
    renderWithProviders(<ArbitraryKeyInput value="" onChange={vi.fn()} />)
    expect(screen.getByText(hintText)).toBeInTheDocument()
  })
})
