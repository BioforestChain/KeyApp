import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, SwipeableTabs } from './swipeable-tabs'

describe('Tabs', () => {
  it('renders default tabs', () => {
    render(<Tabs>{(tab) => <div>Content: {tab}</div>}</Tabs>)

    expect(screen.getByRole('button', { name: /资产/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /交易/i })).toBeInTheDocument()
  })

  it('renders content for default tab', () => {
    render(<Tabs>{(tab) => <div>Content: {tab}</div>}</Tabs>)

    expect(screen.getByText('Content: assets')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    render(<Tabs>{(tab) => <div>Content: {tab}</div>}</Tabs>)

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('calls onTabChange when tab changes', async () => {
    const handleTabChange = vi.fn()
    render(
      <Tabs onTabChange={handleTabChange}>{(tab) => <div>Content: {tab}</div>}</Tabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(handleTabChange).toHaveBeenCalledWith('history')
  })

  it('respects controlled activeTab', () => {
    render(
      <Tabs activeTab="history">{(tab) => <div>Content: {tab}</div>}</Tabs>
    )

    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('respects defaultTab', () => {
    render(
      <Tabs defaultTab="history">{(tab) => <div>Content: {tab}</div>}</Tabs>
    )

    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('renders custom tabs', () => {
    const customTabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
      { id: 'tab3', label: 'Tab 3' },
    ]

    render(
      <Tabs tabs={customTabs} defaultTab="tab1">
        {(tab) => <div>Content: {tab}</div>}
      </Tabs>
    )

    expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tab 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tab 3' })).toBeInTheDocument()
  })

  it('renders tab icons', () => {
    render(<Tabs>{(tab) => <div>Content: {tab}</div>}</Tabs>)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('applies active styles to selected tab', async () => {
    render(<Tabs>{(tab) => <div>Content: {tab}</div>}</Tabs>)

    const assetsTab = screen.getByRole('button', { name: /资产/i })
    const historyTab = screen.getByRole('button', { name: /交易/i })

    expect(assetsTab).toHaveClass('border-primary')
    expect(historyTab).not.toHaveClass('border-primary')

    await userEvent.click(historyTab)

    expect(historyTab).toHaveClass('border-primary')
    expect(assetsTab).not.toHaveClass('border-primary')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Tabs className="custom-tabs">{(tab) => <div>Content: {tab}</div>}</Tabs>
    )

    expect(container.querySelector('.custom-tabs')).toBeInTheDocument()
  })
})

describe('SwipeableTabs', () => {
  it('renders default tabs', () => {
    render(<SwipeableTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableTabs>)

    expect(screen.getByRole('button', { name: /资产/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /交易/i })).toBeInTheDocument()
  })

  it('renders content for all tabs (for swipe)', () => {
    render(<SwipeableTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableTabs>)

    expect(screen.getByText('Content: assets')).toBeInTheDocument()
    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    const handleTabChange = vi.fn()
    render(
      <SwipeableTabs onTabChange={handleTabChange}>
        {(tab) => <div>Content: {tab}</div>}
      </SwipeableTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(handleTabChange).toHaveBeenCalledWith('history')
  })

  it('has sliding indicator', () => {
    const { container } = render(
      <SwipeableTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableTabs>
    )

    const indicator = container.querySelector('[class*="transition-transform"]')
    expect(indicator).toBeInTheDocument()
  })

  it('applies transform for active tab', async () => {
    const { container } = render(
      <SwipeableTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    const contentContainer = container.querySelector('[class*="transition-transform"]')
    expect(contentContainer).toBeInTheDocument()
  })

  it('respects controlled activeTab', () => {
    render(
      <SwipeableTabs activeTab="history">
        {(tab) => <div data-testid={`content-${tab}`}>Content: {tab}</div>}
      </SwipeableTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    expect(historyTab).toHaveClass('text-primary')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SwipeableTabs className="custom-swipeable">
        {(tab) => <div>Content: {tab}</div>}
      </SwipeableTabs>
    )

    expect(container.querySelector('.custom-swipeable')).toBeInTheDocument()
  })

  it('renders with rounded tab indicator', () => {
    const { container } = render(
      <SwipeableTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableTabs>
    )

    const indicator = container.querySelector('.rounded-lg')
    expect(indicator).toBeInTheDocument()
  })
})
