import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestI18nProvider } from '@/test/i18n-mock'
import { SecurityWarningDialog } from './security-warning-dialog'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('SecurityWarningDialog', () => {
  it('disables confirm until acknowledged', () => {
    renderWithProviders(
      <SecurityWarningDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
  })

  it('calls onConfirm after acknowledging', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    renderWithProviders(
      <SecurityWarningDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    )

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: '确认' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onCancel and closes', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onOpenChange = vi.fn()

    renderWithProviders(
      <SecurityWarningDialog open onOpenChange={onOpenChange} onConfirm={vi.fn()} onCancel={onCancel} />,
    )

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

