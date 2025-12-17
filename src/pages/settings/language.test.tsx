import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguagePage } from './language'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockNavigate = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => ({}),
}))

// Mock preferences store
const mockSetLanguage = vi.fn()
let mockCurrentLanguage = 'zh-CN'

vi.mock('@/stores', () => ({
  useLanguage: () => mockCurrentLanguage,
  preferencesActions: {
    setLanguage: (lang: string) => {
      mockSetLanguage(lang)
      mockCurrentLanguage = lang
    },
  },
  languages: {
    'zh-CN': { name: '简体中文', dir: 'ltr' },
    en: { name: 'English', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' },
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('LanguagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage = 'zh-CN'
  })

  it('renders page header', () => {
    renderWithProviders(<LanguagePage />)
    expect(screen.getByText('语言')).toBeInTheDocument()
  })

  it('displays all available languages', () => {
    renderWithProviders(<LanguagePage />)

    expect(screen.getByText('简体中文')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('العربية')).toBeInTheDocument()
  })

  it('shows checkmark for current language', () => {
    renderWithProviders(<LanguagePage />)

    // The current language button should have a check mark (SVG)
    const zhButton = screen.getByText('简体中文').closest('button')
    expect(zhButton?.querySelector('svg')).toBeInTheDocument()
  })

  it('changes language when selecting a different option', async () => {
    renderWithProviders(<LanguagePage />)

    await userEvent.click(screen.getByText('English'))

    expect(mockSetLanguage).toHaveBeenCalledWith('en')
  })

  it('navigates back to settings after selection', async () => {
    renderWithProviders(<LanguagePage />)

    await userEvent.click(screen.getByText('English'))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' })
  })

  it('shows helper text', () => {
    renderWithProviders(<LanguagePage />)

    expect(
      screen.getByText('选择界面语言后，应用将立即切换到所选语言。')
    ).toBeInTheDocument()
  })

  it('applies selection styling to current language', () => {
    renderWithProviders(<LanguagePage />)

    const zhButton = screen.getByText('简体中文').closest('button')
    expect(zhButton).toHaveClass('bg-primary/5')
  })

  it('does not apply selection styling to non-current languages', () => {
    renderWithProviders(<LanguagePage />)

    const enButton = screen.getByText('English').closest('button')
    expect(enButton).not.toHaveClass('bg-primary/5')
  })
})
