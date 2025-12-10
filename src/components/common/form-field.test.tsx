import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './form-field'

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <input data-testid="input" />
      </FormField>
    )
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    render(
      <FormField label="Password" required>
        <input />
      </FormField>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows hint text', () => {
    render(
      <FormField hint="Enter your email address">
        <input />
      </FormField>
    )
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('shows error instead of hint when error is present', () => {
    render(
      <FormField hint="This is a hint" error="This field is required">
        <input />
      </FormField>
    )
    expect(screen.queryByText('This is a hint')).not.toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormField className="my-class">
        <input />
      </FormField>
    )
    expect(container.firstChild).toHaveClass('my-class')
  })
})
