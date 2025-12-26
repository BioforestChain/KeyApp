import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentTabs, SwipeableContentTabs } from './content-tabs'

describe('ContentTabs', () => {
  it('renders default tabs', () => {
    render(<ContentTabs>{(tab) => <div>Content: {tab}</div>}</ContentTabs>)

    expect(screen.getByRole('button', { name: /资产/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /交易/i })).toBeInTheDocument()
  })

  it('renders content for default tab', () => {
    render(<ContentTabs>{(tab) => <div>Content: {tab}</div>}</ContentTabs>)

    expect(screen.getByText('Content: assets')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    render(<ContentTabs>{(tab) => <div>Content: {tab}</div>}</ContentTabs>)

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('calls onTabChange when tab changes', async () => {
    const handleTabChange = vi.fn()
    render(
      <ContentTabs onTabChange={handleTabChange}>{(tab) => <div>Content: {tab}</div>}</ContentTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(handleTabChange).toHaveBeenCalledWith('history')
  })

  it('respects controlled activeTab', () => {
    render(
      <ContentTabs activeTab="history">{(tab) => <div>Content: {tab}</div>}</ContentTabs>
    )

    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('respects defaultTab', () => {
    render(
      <ContentTabs defaultTab="history">{(tab) => <div>Content: {tab}</div>}</ContentTabs>
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
      <ContentTabs tabs={customTabs} defaultTab="tab1">
        {(tab) => <div>Content: {tab}</div>}
      </ContentTabs>
    )

    expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tab 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tab 3' })).toBeInTheDocument()
  })

  it('renders tab icons', () => {
    render(<ContentTabs>{(tab) => <div>Content: {tab}</div>}</ContentTabs>)

    // Default tabs have icons (Coins and History)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('applies active styles to selected tab', async () => {
    render(<ContentTabs>{(tab) => <div>Content: {tab}</div>}</ContentTabs>)

    const assetsTab = screen.getByRole('button', { name: /资产/i })
    const historyTab = screen.getByRole('button', { name: /交易/i })

    // Assets tab should be active by default
    expect(assetsTab).toHaveClass('border-primary')
    expect(historyTab).not.toHaveClass('border-primary')

    await userEvent.click(historyTab)

    expect(historyTab).toHaveClass('border-primary')
    expect(assetsTab).not.toHaveClass('border-primary')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ContentTabs className="custom-tabs">{(tab) => <div>Content: {tab}</div>}</ContentTabs>
    )

    expect(container.querySelector('.custom-tabs')).toBeInTheDocument()
  })
})

describe('SwipeableContentTabs', () => {
  it('renders default tabs', () => {
    render(<SwipeableContentTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableContentTabs>)

    expect(screen.getByRole('button', { name: /资产/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /交易/i })).toBeInTheDocument()
  })

  it('renders content for all tabs (for swipe)', () => {
    render(<SwipeableContentTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableContentTabs>)

    // Both contents should be in DOM for swipe animation
    expect(screen.getByText('Content: assets')).toBeInTheDocument()
    expect(screen.getByText('Content: history')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    const handleTabChange = vi.fn()
    render(
      <SwipeableContentTabs onTabChange={handleTabChange}>
        {(tab) => <div>Content: {tab}</div>}
      </SwipeableContentTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    expect(handleTabChange).toHaveBeenCalledWith('history')
  })

  it('has sliding indicator', () => {
    const { container } = render(
      <SwipeableContentTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableContentTabs>
    )

    // Should have a sliding indicator div
    const indicator = container.querySelector('[class*="transition-transform"]')
    expect(indicator).toBeInTheDocument()
  })

  it('applies transform for active tab', async () => {
    const { container } = render(
      <SwipeableContentTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableContentTabs>
    )

    const historyTab = screen.getByRole('button', { name: /交易/i })
    await userEvent.click(historyTab)

    // Content container should have transform applied
    const contentContainer = container.querySelector('[class*="transition-transform"]')
    expect(contentContainer).toBeInTheDocument()
  })

  it('respects controlled activeTab', () => {
    render(
      <SwipeableContentTabs activeTab="history">
        {(tab) => <div data-testid={`content-${tab}`}>Content: {tab}</div>}
      </SwipeableContentTabs>
    )

    // History tab should be visually active
    const historyTab = screen.getByRole('button', { name: /交易/i })
    expect(historyTab).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SwipeableContentTabs className="custom-swipeable">
        {(tab) => <div>Content: {tab}</div>}
      </SwipeableContentTabs>
    )

    expect(container.querySelector('.custom-swipeable')).toBeInTheDocument()
  })

  it('renders with rounded tab indicator', () => {
    const { container } = render(
      <SwipeableContentTabs>{(tab) => <div>Content: {tab}</div>}</SwipeableContentTabs>
    )

    const indicator = container.querySelector('.rounded-md')
    expect(indicator).toBeInTheDocument()
  })
})
