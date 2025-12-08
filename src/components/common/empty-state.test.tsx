import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="暂无数据" />)
    expect(screen.getByRole('heading', { name: '暂无数据' })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="暂无数据" description="这里什么都没有" />)
    expect(screen.getByText('这里什么都没有')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<EmptyState title="暂无数据" />)
    const description = screen.queryByText('这里什么都没有')
    expect(description).not.toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <EmptyState 
        title="暂无数据"
        icon={<svg data-testid="empty-icon" />}
      />
    )
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <EmptyState 
        title="暂无数据"
        action={<button>操作按钮</button>}
      />
    )
    expect(screen.getByRole('button', { name: '操作按钮' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="暂无数据" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
