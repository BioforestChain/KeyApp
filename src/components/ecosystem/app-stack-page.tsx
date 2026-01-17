import { useCallback } from 'react'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  registerStackContainerRef,
  unregisterStackContainerRef,
} from '@/services/miniapp-runtime'

export interface AppStackPageProps {
  className?: string
}

export function AppStackPage({ className }: AppStackPageProps) {
  const { t } = useTranslation('ecosystem')
  const hasRunningApps = useStore(
    miniappRuntimeStore,
    miniappRuntimeSelectors.hasRunningApps
  )

  const setStackContainerRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      registerStackContainerRef(element)
      return
    }
    unregisterStackContainerRef()
  }, [])

  return (
    <div
      ref={setStackContainerRef}
      className={cn(
        'relative h-full w-full',
        // 背景板样式 - 透明，让 Parallax 壁纸显示
        'bg-transparent',
        className
      )}
      data-testid="app-stack-page"
      data-has-apps={hasRunningApps}
    >
      {/* 空状态提示（调试用，生产环境可移除） */}
      {!hasRunningApps && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0">
          <p className="text-muted-foreground text-sm">{t('stack.title')}</p>
        </div>
      )}
    </div>
  )
}

export default AppStackPage
