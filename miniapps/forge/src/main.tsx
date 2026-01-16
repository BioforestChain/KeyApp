import './index.css'
import '@fontsource-variable/noto-sans-sc'
import './i18n'
import '@biochain/bio-sdk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
