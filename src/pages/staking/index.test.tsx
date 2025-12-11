/**
 * Staking Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StakingPage } from './index'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Staking',
        overview: 'Overview',
        mint: 'Mint',
        burn: 'Burn',
        noStakedAssets: 'No staked assets',
        mintDescription: 'Convert external tokens to internal chain',
        burnDescription: 'Convert internal tokens to external chain',
      }
      return translations[key] ?? key
    },
  }),
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    history: {
      back: vi.fn(),
    },
  }),
}))

describe('StakingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header with title', () => {
    render(<StakingPage />)
    expect(screen.getByText('Staking')).toBeInTheDocument()
  })

  it('renders tab navigation with all tabs', () => {
    render(<StakingPage />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Mint')).toBeInTheDocument()
    expect(screen.getByText('Burn')).toBeInTheDocument()
  })

  it('shows overview tab content by default', () => {
    render(<StakingPage />)
    expect(screen.getByText('No staked assets')).toBeInTheDocument()
  })

  it('switches to mint tab on click', () => {
    render(<StakingPage />)

    fireEvent.click(screen.getByText('Mint'))

    expect(screen.getByText('Convert external tokens to internal chain')).toBeInTheDocument()
  })

  it('switches to burn tab on click', () => {
    render(<StakingPage />)

    fireEvent.click(screen.getByText('Burn'))

    expect(screen.getByText('Convert internal tokens to external chain')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    render(<StakingPage />)

    const overviewTab = screen.getByText('Overview')
    expect(overviewTab).toHaveClass('text-primary')

    fireEvent.click(screen.getByText('Mint'))

    const mintTab = screen.getByText('Mint')
    expect(mintTab).toHaveClass('text-primary')
  })

  it('switches back to overview from other tabs', () => {
    render(<StakingPage />)

    // Switch to mint
    fireEvent.click(screen.getByText('Mint'))
    expect(screen.getByText('Convert external tokens to internal chain')).toBeInTheDocument()

    // Switch back to overview
    fireEvent.click(screen.getByText('Overview'))
    expect(screen.getByText('No staked assets')).toBeInTheDocument()
  })
})
