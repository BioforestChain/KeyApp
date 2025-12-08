import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from './skeleton'

describe('Skeleton', () => {
  it('renders with default styles', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted/50')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />)
    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('h-10', 'w-20')
  })
})

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(3)
  })

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(5)
  })

  it('last line is shorter', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines[2]).toHaveClass('w-3/4')
    expect(lines[0]).toHaveClass('w-full')
  })
})

describe('SkeletonCard', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})

describe('SkeletonList', () => {
  it('renders default 3 items', () => {
    const { container } = render(<SkeletonList />)
    const items = container.querySelectorAll('.flex.items-center')
    expect(items).toHaveLength(3)
  })

  it('renders custom count', () => {
    const { container } = render(<SkeletonList count={5} />)
    const items = container.querySelectorAll('.flex.items-center')
    expect(items).toHaveLength(5)
  })
})
