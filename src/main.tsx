import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { ServiceProvider } from './services'
import { MigrationProvider } from './contexts/MigrationContext'
import { preferencesActions } from './stores/preferences'
import { StackflowApp } from './StackflowApp'
import './styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

preferencesActions.initialize()

createRoot(rootElement).render(
  <StrictMode>
    <ServiceProvider>
      <MigrationProvider>
        <I18nextProvider i18n={i18n}>
          <StackflowApp />
        </I18nextProvider>
      </MigrationProvider>
    </ServiceProvider>
  </StrictMode>,
)
