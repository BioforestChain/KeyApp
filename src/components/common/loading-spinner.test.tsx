import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './loading-spinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByLabelText('加载中')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('size-8')
  })

  it('renders small size', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByLabelText('加载中')
    expect(spinner).toHaveClass('size-4')
  })

  it('renders large size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByLabelText('加载中')
    expect(spinner).toHaveClass('size-12')
  })

  it('renders fullScreen variant with overlay', () => {
    render(<LoadingSpinner fullScreen />)
    const overlay = screen.getByLabelText('加载中').parentElement
    expect(overlay).toHaveClass('fixed', 'inset-0')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="text-red-500" />)
    const spinner = screen.getByLabelText('加载中')
    expect(spinner).toHaveClass('text-red-500')
  })
})
