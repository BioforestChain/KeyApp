import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepIndicator, ProgressSteps } from './step-indicator'

describe('StepIndicator', () => {
  const steps = [
    { id: 'password', label: 'Password' },
    { id: 'mnemonic', label: 'Mnemonic' },
    { id: 'verify', label: 'Verify' },
  ]

  it('renders all steps', () => {
    render(<StepIndicator steps={steps} currentStep="password" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows check icon for completed steps', () => {
    render(<StepIndicator steps={steps} currentStep="verify" />)
    // First two steps should show check icons (SVGs)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('highlights current step', () => {
    const { container } = render(<StepIndicator steps={steps} currentStep="mnemonic" />)
    // Second step should have the ring class
    const stepCircles = container.querySelectorAll('.rounded-full')
    expect(stepCircles[1]).toHaveClass('ring-2')
  })
})

describe('ProgressSteps', () => {
  it('renders correct number of steps', () => {
    const { container } = render(<ProgressSteps total={5} current={2} />)
    const bars = container.querySelectorAll('.rounded-full')
    expect(bars).toHaveLength(5)
  })

  it('highlights completed steps', () => {
    const { container } = render(<ProgressSteps total={4} current={2} />)
    const bars = container.querySelectorAll('.rounded-full')
    expect(bars[0]).toHaveClass('bg-primary')
    expect(bars[1]).toHaveClass('bg-primary')
    expect(bars[2]).toHaveClass('bg-muted')
    expect(bars[3]).toHaveClass('bg-muted')
  })

  it('applies custom className', () => {
    const { container } = render(<ProgressSteps total={3} current={1} className="my-class" />)
    expect(container.firstChild).toHaveClass('my-class')
  })
})
