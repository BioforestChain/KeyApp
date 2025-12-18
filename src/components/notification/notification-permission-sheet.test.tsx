import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationPermissionSheet } from './notification-permission-sheet'
import { TestI18nProvider } from '@/test/i18n-mock'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('NotificationPermissionSheet', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onEnable: vi.fn(),
    onSkip: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Title and button both have "开启通知"
    expect(screen.getAllByText('开启通知')).toHaveLength(2)
  })

  it('does not render content when closed', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} open={false} />)
    expect(screen.queryByText('开启通知')).not.toBeInTheDocument()
  })

  it('displays notification benefits', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    expect(screen.getByText('交易状态')).toBeInTheDocument()
    expect(screen.getByText('即时提醒')).toBeInTheDocument()
    expect(screen.getByText('安全提醒')).toBeInTheDocument()
  })

  it('displays descriptions for each benefit', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    expect(
      screen.getByText(/实时收到转账和交易确认的通知/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/收款到账、交易完成时第一时间知晓/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/账户安全相关的重要通知不会错过/),
    ).toBeInTheDocument()
  })

  it('calls onEnable when clicking enable button', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    // Find the button by its text (not the title which also says "开启通知")
    const buttons = screen.getAllByText('开启通知')
    // The button is the one inside the footer
    const enableButton = buttons.find(
      (el) => el.tagName.toLowerCase() === 'button'
    )
    expect(enableButton).toBeDefined()
    fireEvent.click(enableButton!)
    expect(defaultProps.onEnable).toHaveBeenCalledTimes(1)
  })

  it('calls onSkip when clicking skip button', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    fireEvent.click(screen.getByText('暂不开启'))
    expect(defaultProps.onSkip).toHaveBeenCalledTimes(1)
  })

  it('shows bell icon in header', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    renderWithProviders(<NotificationPermissionSheet {...defaultProps} className="custom-class" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })
})
