import { StrictMode, lazy, Suspense, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { queryClient } from './lib/query-client'
import { ServiceProvider } from './services'
import { MigrationProvider } from './contexts/MigrationContext'
import { StackflowApp } from './StackflowApp'
import { ChainIconProvider, TokenIconProvider } from './components/wallet'
import { useChainConfigs } from './stores/chain-config'
import './styles/globals.css'

// Mock 模式下注册全局中间件
if (__MOCK_MODE__) {
  import('./lib/service-meta').then(({ ServiceMeta, loggingMiddleware, breakpointMiddleware, settingsMiddleware }) => {
    // 执行顺序: loggingMiddleware → settingsMiddleware → breakpointMiddleware → 实现
    // - loggingMiddleware: 记录完整耗时（包括设置延迟和断点延迟）
    // - settingsMiddleware: 应用全局延迟和错误设置
    // - breakpointMiddleware: 断点暂停
    ServiceMeta.useGlobal(loggingMiddleware)
    ServiceMeta.useGlobal(settingsMiddleware)
    ServiceMeta.useGlobal(breakpointMiddleware)
  })
}

// 懒加载 MockDevTools（仅在 mock 模式下加载）
const MockDevTools = __MOCK_MODE__
  ? lazy(() => import('./services/mock-devtools').then((m) => ({ default: m.MockDevTools })))
  : null

function ChainIconProviderWrapper({ children }: { children: React.ReactNode }) {
  const configs = useChainConfigs()
  
  const getIconUrl = useCallback(
    (chainId: string) => configs.find((c) => c.id === chainId)?.icon,
    [configs],
  )

  return <ChainIconProvider getIconUrl={getIconUrl}>{children}</ChainIconProvider>
}

export function startFrontendMain(rootElement: HTMLElement): void {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ServiceProvider>
          <MigrationProvider>
            <I18nextProvider i18n={i18n}>
              <ChainIconProviderWrapper>
                <TokenIconProvider>
                  <StackflowApp />
                </TokenIconProvider>
              </ChainIconProviderWrapper>
              {/* Mock DevTools - 仅在 mock 模式下显示 */}
              {MockDevTools && (
                <Suspense fallback={null}>
                  <MockDevTools />
                </Suspense>
              )}
            </I18nextProvider>
          </MigrationProvider>
        </ServiceProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
