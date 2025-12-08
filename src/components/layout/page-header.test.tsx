import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="转账" />)
    expect(screen.getByRole('heading', { name: '转账' })).toBeInTheDocument()
  })

  it('renders back button when onBack is provided', () => {
    render(<PageHeader title="转账" onBack={() => {}} />)
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument()
  })

  it('does not render back button when onBack is not provided', () => {
    render(<PageHeader title="首页" />)
    expect(screen.queryByRole('button', { name: '返回' })).not.toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const handleBack = vi.fn()
    render(<PageHeader title="转账" onBack={handleBack} />)
    
    await userEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it('renders right action', () => {
    render(
      <PageHeader 
        title="设置" 
        rightAction={<button>保存</button>} 
      />
    )
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
  })

  it('applies transparent class when transparent is true', () => {
    const { container } = render(<PageHeader title="详情" transparent />)
    expect(container.querySelector('header')).toHaveClass('bg-transparent')
  })

  it('renders children instead of title when provided', () => {
    render(
      <PageHeader>
        <span data-testid="custom-content">自定义内容</span>
      </PageHeader>
    )
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })
})
