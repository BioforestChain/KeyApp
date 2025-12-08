import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimeDisplay } from './time-display'
import { TestI18nProvider } from '@/test/i18n-mock'

// 包装组件以提供 i18n
function renderWithProvider(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('TimeDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders relative time - just now', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T11:59:30')} />)
    expect(screen.getByText('刚刚')).toBeInTheDocument()
  })

  it('renders relative time - minutes ago', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T11:30:00')} />)
    expect(screen.getByText('30 分钟前')).toBeInTheDocument()
  })

  it('renders relative time - hours ago', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T09:00:00')} />)
    expect(screen.getByText('3 小时前')).toBeInTheDocument()
  })

  it('renders relative time - days ago', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-13T12:00:00')} />)
    expect(screen.getByText('2 天前')).toBeInTheDocument()
  })

  it('renders date format', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T12:00:00')} format="date" />)
    expect(screen.getByRole('time').textContent).toMatch(/2024/)
  })

  it('renders datetime format', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T14:30:00')} format="datetime" />)
    expect(screen.getByRole('time').textContent).toMatch(/2024/)
  })

  it('renders time format', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T14:30:00')} format="time" />)
    expect(screen.getByRole('time')).toBeInTheDocument()
  })

  it('accepts string value', () => {
    renderWithProvider(<TimeDisplay value="2024-01-15T11:30:00" />)
    expect(screen.getByText('30 分钟前')).toBeInTheDocument()
  })

  it('accepts number (timestamp) value', () => {
    const timestamp = new Date('2024-01-15T11:30:00').getTime()
    renderWithProvider(<TimeDisplay value={timestamp} />)
    expect(screen.getByText('30 分钟前')).toBeInTheDocument()
  })

  it('handles invalid date', () => {
    renderWithProvider(<TimeDisplay value="invalid" />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('has datetime attribute', () => {
    renderWithProvider(<TimeDisplay value={new Date('2024-01-15T12:00:00')} />)
    expect(screen.getByRole('time')).toHaveAttribute('dateTime')
  })

  it('applies custom className', () => {
    renderWithProvider(<TimeDisplay value={new Date()} className="text-red-500" />)
    expect(screen.getByRole('time')).toHaveClass('text-red-500')
  })
})
