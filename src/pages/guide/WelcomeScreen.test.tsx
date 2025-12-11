import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WelcomeScreen, hasSeenWelcome, markWelcomeSeen, resetWelcome } from './WelcomeScreen'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'welcome.skip': 'Skip',
        'welcome.next': 'Next',
        'welcome.getStarted': 'Get Started',
        'welcome.haveWallet': 'I have a wallet',
        'welcome.slides.transfer.title': 'Easy Transfer',
        'welcome.slides.transfer.description': 'Anytime, anywhere.',
        'welcome.slides.multichain.title': 'Multi-Chain Support',
        'welcome.slides.multichain.description': 'Multiple blockchains.',
        'welcome.slides.security.title': 'Comprehensive Security',
        'welcome.slides.security.description': 'Advanced encryption.',
      }
      if (key === 'welcome.goToSlide' && options?.number) {
        return `Go to slide ${options.number}`
      }
      return translations[key] ?? key
    },
  }),
}))

describe('WelcomeScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('localStorage helpers', () => {
    it('hasSeenWelcome returns false initially', () => {
      expect(hasSeenWelcome()).toBe(false)
    })

    it('markWelcomeSeen sets localStorage', () => {
      markWelcomeSeen()
      expect(hasSeenWelcome()).toBe(true)
    })

    it('resetWelcome clears localStorage', () => {
      markWelcomeSeen()
      expect(hasSeenWelcome()).toBe(true)
      resetWelcome()
      expect(hasSeenWelcome()).toBe(false)
    })
  })

  describe('rendering', () => {
    it('renders first slide by default', () => {
      render(<WelcomeScreen />)
      expect(screen.getByText('Easy Transfer')).toBeInTheDocument()
      expect(screen.getByText('Anytime, anywhere.')).toBeInTheDocument()
    })

    it('renders skip button', () => {
      render(<WelcomeScreen />)
      expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
    })

    it('renders next button on first slide', () => {
      render(<WelcomeScreen />)
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('renders 3 dot indicators', () => {
      render(<WelcomeScreen />)
      const dots = screen.getAllByRole('button', { name: /Go to slide/i })
      expect(dots).toHaveLength(3)
    })
  })

  describe('navigation between slides', () => {
    it('clicking next goes to second slide', () => {
      render(<WelcomeScreen />)
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByText('Multi-Chain Support')).toBeInTheDocument()
    })

    it('clicking next twice goes to third slide', () => {
      render(<WelcomeScreen />)
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByText('Comprehensive Security')).toBeInTheDocument()
    })

    it('clicking dot navigates to that slide', () => {
      render(<WelcomeScreen />)
      const dots = screen.getAllByRole('button', { name: /Go to slide/i })
      fireEvent.click(dots[2]) // Third dot
      expect(screen.getByText('Comprehensive Security')).toBeInTheDocument()
    })

    it('last slide shows Get Started and I have a wallet buttons', () => {
      render(<WelcomeScreen />)
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'I have a wallet' })).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('skip marks welcome as seen and navigates to home', () => {
      render(<WelcomeScreen />)
      fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
      expect(hasSeenWelcome()).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('Get Started marks welcome as seen and navigates to create', () => {
      render(<WelcomeScreen />)
      // Go to last slide
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: 'Get Started' }))
      expect(hasSeenWelcome()).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/wallet/create' })
    })

    it('I have a wallet marks welcome as seen and navigates to import', () => {
      render(<WelcomeScreen />)
      // Go to last slide
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      fireEvent.click(screen.getByRole('button', { name: 'I have a wallet' }))
      expect(hasSeenWelcome()).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/wallet/import' })
    })
  })
})
