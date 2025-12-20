import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressDisplay } from './address-display'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock clipboardService
const { mockClipboardWrite } = vi.hoisted(() => ({
  mockClipboardWrite: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: mockClipboardWrite,
    read: vi.fn().mockResolvedValue(''),
  },
}))

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'

// Mock ResizeObserver
class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    // 立即触发一次回调
    this.callback([], this)
  }
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

describe('AddressDisplay', () => {
  beforeEach(() => {
    mockClipboardWrite.mockClear()
  })

  it('renders address text', () => {
    renderWithI18n(<AddressDisplay address={mockAddress} />)
    // 初始状态显示完整地址（因为没有实际宽度限制）
    expect(screen.getByText(mockAddress)).toBeInTheDocument()
  })

  it('copies address to clipboard when clicked', async () => {
    renderWithI18n(<AddressDisplay address={mockAddress} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(mockClipboardWrite).toHaveBeenCalledWith({ text: mockAddress })
  })

  it('calls onCopy callback when address is copied', async () => {
    const handleCopy = vi.fn()
    renderWithI18n(<AddressDisplay address={mockAddress} onCopy={handleCopy} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleCopy).toHaveBeenCalled()
  })

  it('updates aria-label after copying', async () => {
    renderWithI18n(<AddressDisplay address={mockAddress} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', `复制 ${mockAddress}`)
    
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-label', `已复制 ${mockAddress}`)
  })

  it('renders as span when not copyable', () => {
    renderWithI18n(<AddressDisplay address={mockAddress} copyable={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('displays short address without truncation', () => {
    const shortAddress = '0x12345'
    renderWithI18n(<AddressDisplay address={shortAddress} copyable={false} />)
    expect(screen.getByText(shortAddress)).toBeInTheDocument()
  })

  it('has truncate class for overflow handling', () => {
    const { container } = renderWithI18n(<AddressDisplay address={mockAddress} />)
    expect(container.querySelector('.truncate')).toBeInTheDocument()
  })

  it('announces copy status to screen readers', async () => {
    renderWithI18n(<AddressDisplay address={mockAddress} />)
    
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveTextContent('')
    
    await userEvent.click(screen.getByRole('button'))
    expect(statusRegion).toHaveTextContent('已复制到剪贴板')
  })

  it('has proper accessibility attributes', () => {
    const { container } = renderWithI18n(<AddressDisplay address={mockAddress} />)
    
    // 视觉文本对屏幕阅读器隐藏（避免重复朗读）
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    // 完整地址显示在 title 中
    expect(screen.getByRole('button')).toHaveAttribute('title', mockAddress)
  })
})
