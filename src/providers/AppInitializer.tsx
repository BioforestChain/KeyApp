import { useEffect, useState, type ReactNode } from 'react'
import { addressBookActions, addressBookStore, useChainConfigMigrationRequired, chainConfigActions, useChainConfigLoading } from '@/stores'
import { useStore } from '@tanstack/react-store'
import { initializeThemeHue } from '@/hooks/useWalletTheme'
import { MigrationRequiredView } from '@/components/common/migration-required-view'
import { LoadingSpinner } from '@/components/common/loading-spinner'

// 立即执行：在 React 渲染之前应用缓存的主题色，避免闪烁
initializeThemeHue()

/**
 * App 级别的初始化组件
 * 在应用启动时统一初始化所有需要持久化的 store
 * 
 * 这确保了单一数据源原则：
 * - 初始化只在这里发生一次
 * - 所有子组件只需要读取 store，不需要各自初始化
 */
export function AppInitializer({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const addressBookState = useStore(addressBookStore)
  const migrationRequired = useChainConfigMigrationRequired()
  const chainConfigLoading = useChainConfigLoading()

  useEffect(() => {
    // 统一初始化所有需要持久化的 store
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize()
    }
    // 确保链配置初始化（可能已在 service-main 中调用，这里做保障）
    chainConfigActions.initialize().finally(() => {
      setIsReady(true)
    })
  }, []) // 只在挂载时执行一次

  // 检测到需要迁移时，显示迁移界面
  if (migrationRequired) {
    return <MigrationRequiredView />
  }

  // 等待链配置初始化完成
  if (!isReady || chainConfigLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
