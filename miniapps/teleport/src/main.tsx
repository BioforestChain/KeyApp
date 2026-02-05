import './index.css'
import {
  applyMiniappSafeAreaCssVars,
  getMiniappContext,
  onMiniappContextUpdate,
} from '@biochain/bio-sdk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const appId = window.name || undefined
void getMiniappContext({ appId }).then(applyMiniappSafeAreaCssVars)
onMiniappContextUpdate((context) => {
  applyMiniappSafeAreaCssVars(context)
}, { appId })

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
