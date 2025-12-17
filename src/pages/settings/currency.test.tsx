import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyPage } from './currency'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockGoBack = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: mockGoBack }),
  useActivityParams: () => ({}),
}))

// Mock preferences store
const mockSetCurrency = vi.fn()
let mockCurrentCurrency = 'USD'

vi.mock('@/stores', () => ({
  useCurrency: () => mockCurrentCurrency,
  preferencesActions: {
    setCurrency: (currency: string) => {
      mockSetCurrency(currency)
      mockCurrentCurrency = currency
    },
  },
  currencies: {
    USD: { symbol: '$', name: 'US Dollar' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    EUR: { symbol: '€', name: 'Euro' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    KRW: { symbol: '₩', name: 'Korean Won' },
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('CurrencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentCurrency = 'USD'
  })

  it('renders page header', () => {
    renderWithProviders(<CurrencyPage />)
    expect(screen.getByText('计价货币')).toBeInTheDocument()
  })

  it('displays all available currencies', () => {
    renderWithProviders(<CurrencyPage />)

    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('人民币')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('日本円')).toBeInTheDocument()
    expect(screen.getByText('한국 원')).toBeInTheDocument()
  })

  it('shows currency symbols', () => {
    renderWithProviders(<CurrencyPage />)

    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getAllByText('¥')).toHaveLength(2) // CNY and JPY
    expect(screen.getByText('€')).toBeInTheDocument()
    expect(screen.getByText('₩')).toBeInTheDocument()
  })

  it('shows currency codes', () => {
    renderWithProviders(<CurrencyPage />)

    expect(screen.getByText('(USD)')).toBeInTheDocument()
    expect(screen.getByText('(CNY)')).toBeInTheDocument()
    expect(screen.getByText('(EUR)')).toBeInTheDocument()
  })

  it('shows checkmark for current currency', () => {
    renderWithProviders(<CurrencyPage />)

    // The current currency button should have a check mark (SVG)
    const usdButton = screen.getByText('US Dollar').closest('button')
    expect(usdButton?.querySelector('svg')).toBeInTheDocument()
  })

  it('changes currency when selecting a different option', async () => {
    renderWithProviders(<CurrencyPage />)

    await userEvent.click(screen.getByText('人民币'))

    expect(mockSetCurrency).toHaveBeenCalledWith('CNY')
  })

  it('navigates back to settings after selection', async () => {
    renderWithProviders(<CurrencyPage />)

    await userEvent.click(screen.getByText('Euro'))

    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })

  it('shows helper text', () => {
    renderWithProviders(<CurrencyPage />)

    expect(
      screen.getByText('选择计价货币后，资产价值将以所选货币显示。')
    ).toBeInTheDocument()
  })

  it('applies selection styling to current currency', () => {
    renderWithProviders(<CurrencyPage />)

    const usdButton = screen.getByText('US Dollar').closest('button')
    expect(usdButton).toHaveClass('bg-primary/5')
  })

  it('does not apply selection styling to non-current currencies', () => {
    renderWithProviders(<CurrencyPage />)

    const cnyButton = screen.getByText('人民币').closest('button')
    expect(cnyButton).not.toHaveClass('bg-primary/5')
  })
})
