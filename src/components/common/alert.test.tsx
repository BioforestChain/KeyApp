import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './alert'

describe('Alert', () => {
  it('renders children content', () => {
    render(<Alert>This is an alert message</Alert>)
    expect(screen.getByText('This is an alert message')).toBeInTheDocument()
  })

  it('has alert role for accessibility', () => {
    render(<Alert>Alert content</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Alert title="Important">
        Message content
      </Alert>
    )
    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Message content')).toBeInTheDocument()
  })

  it('applies info variant by default', () => {
    const { container } = render(<Alert>Info alert</Alert>)
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-blue-500/10')
  })

  it('applies error variant styles', () => {
    const { container } = render(<Alert variant="error">Error alert</Alert>)
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-destructive/10')
  })

  it('applies success variant styles', () => {
    const { container } = render(<Alert variant="success">Success alert</Alert>)
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-green-500/10')
  })

  it('applies warning variant styles', () => {
    const { container } = render(<Alert variant="warning">Warning alert</Alert>)
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-yellow-500/10')
  })

  it('applies custom className', () => {
    const { container } = render(<Alert className="custom-class">Alert</Alert>)
    expect(container.querySelector('[role="alert"]')).toHaveClass('custom-class')
  })
})
