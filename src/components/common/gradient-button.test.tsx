import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GradientButton } from './gradient-button'

describe('GradientButton', () => {
  it('renders children correctly', () => {
    render(<GradientButton>Click me</GradientButton>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<GradientButton onClick={handleClick}>Click me</GradientButton>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<GradientButton loading>Submit</GradientButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<GradientButton disabled>Submit</GradientButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire click when disabled', async () => {
    const handleClick = vi.fn()
    render(<GradientButton disabled onClick={handleClick}>Click me</GradientButton>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not fire click when loading', async () => {
    const handleClick = vi.fn()
    render(<GradientButton loading onClick={handleClick}>Click me</GradientButton>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<GradientButton variant="blue">Blue</GradientButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-blue')
    
    rerender(<GradientButton variant="red">Red</GradientButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-red')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<GradientButton size="sm">Small</GradientButton>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
    
    rerender(<GradientButton size="lg">Large</GradientButton>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
  })

  it('applies fullWidth class when true', () => {
    render(<GradientButton fullWidth>Full Width</GradientButton>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
