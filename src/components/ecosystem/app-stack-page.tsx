/**
 * AppStackPage - 应用堆栈页面
 *
 * Swiper 的第三页，作为小程序窗口的背景板
 * 当没有激活应用时，此页禁用滑动
 */

import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import { miniappRuntimeStore, miniappRuntimeSelectors } from '@/services/miniapp-runtime'

export interface AppStackPageProps {
  className?: string
}

export function AppStackPage({ className }: AppStackPageProps) {
  const hasRunningApps = useStore(
    miniappRuntimeStore,
    miniappRuntimeSelectors.hasRunningApps
  )

  return (
    <div
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
          <p className="text-muted-foreground text-sm">应用堆栈</p>
        </div>
      )}
    </div>
  )
}

export default AppStackPage
