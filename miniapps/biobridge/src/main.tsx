import './index.css'
import '@fontsource-variable/noto-sans-sc'
import './i18n'
import {
  applyMiniappSafeAreaCssVars,
  getMiniappContext,
  onMiniappContextUpdate,
} from '@biochain/bio-sdk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const appId = window.name || undefined
void getMiniappContext({ appId }).then(applyMiniappSafeAreaCssVars)
onMiniappContextUpdate((context) => {
  applyMiniappSafeAreaCssVars(context)
}, { appId })

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
