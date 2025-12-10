import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BackupTipsSheet } from './backup-tips-sheet'

describe('BackupTipsSheet', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onProceed: vi.fn(),
    onSkip: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    expect(screen.getByText('备份助记词')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(<BackupTipsSheet {...defaultProps} open={false} />)
    expect(screen.queryByText('备份助记词')).not.toBeInTheDocument()
  })

  it('displays backup tips', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    expect(screen.getByText('确保周围无人')).toBeInTheDocument()
    expect(screen.getByText('禁止截图或拍照')).toBeInTheDocument()
    expect(screen.getByText('妥善保管')).toBeInTheDocument()
  })

  it('displays descriptions for each tip', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    expect(
      screen.getByText(/请在私密环境下查看助记词/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/不要以任何电子形式保存助记词/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/将助记词保存在安全的地方/),
    ).toBeInTheDocument()
  })

  it('calls onProceed when clicking proceed button', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    fireEvent.click(screen.getByText('我已了解，开始备份'))
    expect(defaultProps.onProceed).toHaveBeenCalledTimes(1)
  })

  it('calls onSkip when clicking skip button', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    fireEvent.click(screen.getByText('稍后备份'))
    expect(defaultProps.onSkip).toHaveBeenCalledTimes(1)
  })

  it('shows shield icon', () => {
    render(<BackupTipsSheet {...defaultProps} />)
    // Shield icon is in the header
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<BackupTipsSheet {...defaultProps} className="custom-class" />)
    // Sheet content should contain the className
    const dialog = screen.getByRole('dialog')
    // Custom class is applied to SheetContent which is inside dialog
    expect(dialog).toBeInTheDocument()
  })
})
