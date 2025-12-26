import { useEffect, useState, type ReactNode } from 'react'
import { addressBookActions, addressBookStore } from '@/stores'
import { useStore } from '@tanstack/react-store'

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

  useEffect(() => {
    // 统一初始化所有需要持久化的 store
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize()
    }
    setIsReady(true)
  }, []) // 只在挂载时执行一次

  // 可选：在 store 未初始化完成时显示 loading
  // 但这里因为是同步初始化，所以直接渲染
  if (!isReady) {
    return null
  }

  return <>{children}</>
}
