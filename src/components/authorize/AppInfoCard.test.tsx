import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppInfoCard } from './AppInfoCard'
import { TestI18nProvider } from '@/test/i18n-mock'

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('AppInfoCard', () => {
  it('renders app name and origin', () => {
    renderWithProviders(
      <AppInfoCard
        appInfo={{
          appId: 'com.example.app',
          appName: 'Example DApp',
          appIcon: '',
          origin: 'https://example.app',
        }}
      />
    )

    expect(screen.getByText('Example DApp')).toBeInTheDocument()
    expect(screen.getByText('https://example.app')).toBeInTheDocument()
  })

  it('shows unknown warning for non-https origin', () => {
    renderWithProviders(
      <AppInfoCard
        appInfo={{
          appId: 'mock.dapp.local',
          appName: 'Mock DApp',
          appIcon: '',
          origin: 'http://mock.dapp.local',
        }}
      />
    )

    expect(screen.getByLabelText('未知应用')).toBeInTheDocument()
  })
})

