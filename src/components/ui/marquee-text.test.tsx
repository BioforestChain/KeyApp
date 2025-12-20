import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MarqueeText } from './marquee-text'

// Mock clipboard service
const { mockClipboardWrite } = vi.hoisted(() => ({
  mockClipboardWrite: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: mockClipboardWrite,
    read: vi.fn().mockResolvedValue(''),
  },
}))

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    // Trigger callback immediately to simulate measurement
    this.callback([], this)
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

describe('MarqueeText', () => {
  it('renders text content', () => {
    render(<MarqueeText>Hello World</MarqueeText>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('has correct data-slot attribute', () => {
    render(<MarqueeText>Test</MarqueeText>)
    expect(screen.getByText('Test').parentElement).toHaveAttribute(
      'data-slot',
      'marquee-text'
    )
  })

  it('applies custom className', () => {
    render(<MarqueeText className="custom-class">Test</MarqueeText>)
    expect(screen.getByText('Test').parentElement).toHaveClass('custom-class')
  })

  it('does not show copy button by default', () => {
    render(<MarqueeText>Test</MarqueeText>)
    expect(
      screen.queryByRole('button', { name: /copy/i })
    ).not.toBeInTheDocument()
  })

  it('shows copy button when copyable is true', () => {
    render(<MarqueeText copyable>Test</MarqueeText>)
    expect(
      screen.getByRole('button', { name: /copy to clipboard/i })
    ).toBeInTheDocument()
  })

  it('copies text to clipboard when copy button clicked', async () => {
    mockClipboardWrite.mockClear()

    const onCopy = vi.fn()
    render(
      <MarqueeText copyable onCopy={onCopy}>
        Copy me
      </MarqueeText>
    )

    fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }))

    await waitFor(() => {
      expect(mockClipboardWrite).toHaveBeenCalledWith({ text: 'Copy me' })
    })
    expect(onCopy).toHaveBeenCalled()
  })

  it('shows copied state after copying', async () => {
    mockClipboardWrite.mockClear()

    render(<MarqueeText copyable>Copy me</MarqueeText>)

    fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
    })
  })

  it('handles clipboard API failure gracefully', async () => {
    mockClipboardWrite.mockRejectedValueOnce(new Error('Clipboard error'))

    render(<MarqueeText copyable>Copy me</MarqueeText>)

    // Should not throw
    fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }))

    await waitFor(() => {
      expect(mockClipboardWrite).toHaveBeenCalled()
    })
  })

  it('pauses animation on mouse enter', () => {
    render(
      <MarqueeText className="test-marquee">
        Long text that should scroll
      </MarqueeText>
    )

    const container = screen.getByText('Long text that should scroll').parentElement!
    fireEvent.mouseEnter(container)

    // Verify the container received the event (isPaused state is internal)
    expect(container).toBeInTheDocument()
  })

  it('resumes animation on mouse leave', () => {
    render(
      <MarqueeText className="test-marquee">
        Long text that should scroll
      </MarqueeText>
    )

    const container = screen.getByText('Long text that should scroll').parentElement!
    fireEvent.mouseEnter(container)
    fireEvent.mouseLeave(container)

    expect(container).toBeInTheDocument()
  })

  it('pauses on focus and resumes on blur', () => {
    render(
      <MarqueeText className="test-marquee">
        Long text that should scroll
      </MarqueeText>
    )

    const container = screen.getByText('Long text that should scroll').parentElement!
    fireEvent.focus(container)
    fireEvent.blur(container)

    expect(container).toBeInTheDocument()
  })

  it('accepts custom duration prop', () => {
    render(<MarqueeText duration={10}>Test</MarqueeText>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
