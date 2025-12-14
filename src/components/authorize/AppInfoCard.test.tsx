import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppInfoCard } from './AppInfoCard'

describe('AppInfoCard', () => {
  it('renders app name and origin', () => {
    render(
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
    render(
      <AppInfoCard
        appInfo={{
          appId: 'mock.dapp.local',
          appName: 'Mock DApp',
          appIcon: '',
          origin: 'http://mock.dapp.local',
        }}
      />
    )

    expect(screen.getByLabelText('Unknown app')).toBeInTheDocument()
  })
})

