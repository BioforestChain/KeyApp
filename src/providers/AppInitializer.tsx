import { useEffect, useState, type ReactNode } from 'react'
import {
  addressBookActions,
  addressBookStore,
  useChainConfigMigrationRequired,
  chainConfigActions,
  useChainConfigLoading,
  useWalletMigrationRequired,
  walletActions,
  useWalletLoading,
} from '@/stores'
import { useStore } from '@tanstack/react-store'
import { initializeThemeHue } from '@/hooks/useWalletTheme'
import { MigrationRequiredView } from '@/components/common/migration-required-view'
import { LoadingSpinner } from '@/components/common'
import { DwebUpdateDialog } from '@/components/common/dweb-update-dialog'
import { dwebUpdateActions } from '@/stores/dweb-update'

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
  const chainConfigMigrationRequired = useChainConfigMigrationRequired()
  const walletMigrationRequired = useWalletMigrationRequired()
  const chainConfigLoading = useChainConfigLoading()
  const walletLoading = useWalletLoading()

  useEffect(() => {
    // 统一初始化所有需要持久化的 store
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize()
    }
    // 初始化链配置和钱包
    Promise.all([
      chainConfigActions.initialize(),
      walletActions.initialize(),
    ]).finally(() => {
      setIsReady(true)
    })
  }, []) // 只在挂载时执行一次

  useEffect(() => {
    if (!isReady) return
    const timer = setTimeout(() => {
      void dwebUpdateActions.check('auto')
    }, 3000)
    return () => clearTimeout(timer)
  }, [isReady])

  // 检测到需要迁移时，显示迁移界面
  if (chainConfigMigrationRequired || walletMigrationRequired) {
    return <MigrationRequiredView />
  }

  // 等待初始化完成
  if (!isReady || chainConfigLoading || walletLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      {children}
      <DwebUpdateDialog />
    </>
  )
}
