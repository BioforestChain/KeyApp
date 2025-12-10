import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { router } from './routes'
import { ServiceProvider } from './services'
import './styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ServiceProvider>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </ServiceProvider>
  </StrictMode>,
)
