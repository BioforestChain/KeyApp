import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomSheet } from './bottom-sheet'

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Sheet Content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="选择钱包">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('heading', { name: '选择钱包' })).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', async () => {
    const handleClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Content</div>
      </BottomSheet>
    )
    
    const overlay = screen.getByRole('dialog').previousElementSibling
    if (overlay) {
      await userEvent.click(overlay)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('calls onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Content</div>
      </BottomSheet>
    )
    
    await userEvent.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('applies correct height class', () => {
    const { rerender } = render(
      <BottomSheet open={true} onClose={() => {}} height="auto">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toHaveClass('max-h-[85vh]')

    rerender(
      <BottomSheet open={true} onClose={() => {}} height="half">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toHaveClass('h-[50vh]')

    rerender(
      <BottomSheet open={true} onClose={() => {}} height="full">
        <div>Content</div>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toHaveClass('h-[100vh]')
  })

  it('disables body scroll when open', () => {
    const { unmount } = render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Content</div>
      </BottomSheet>
    )
    expect(document.body.style.overflow).toBe('hidden')
    
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
