import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { TabBar, type TabItem } from './tab-bar'
import { Home, Wallet, Settings, ArrowLeftRight } from 'lucide-react'
import { walletActions, useWalletInitialized } from '@/stores'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

const tabs: TabItem[] = [
  { id: 'home', label: '首页', icon: <Home className="size-5" /> },
  { id: 'transfer', label: '转账', icon: <ArrowLeftRight className="size-5" /> },
  { id: 'wallet', label: '钱包', icon: <Wallet className="size-5" /> },
  { id: 'settings', label: '设置', icon: <Settings className="size-5" /> },
]

const tabRoutes: Record<string, string> = {
  home: '/',
  transfer: '/send',
  wallet: '/wallet',
  settings: '/settings',
}

const routeToTab: Record<string, string> = {
  '/': 'home',
  '/send': 'transfer',
  '/receive': 'transfer',
  '/wallet': 'wallet',
  '/settings': 'settings',
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const router = useRouter()
  const pathname = router.state.location.pathname
  const isInitialized = useWalletInitialized()
  
  // 应用启动时初始化钱包 store
  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize()
    }
  }, [isInitialized])
  
  // 判断是否显示 TabBar（某些页面不需要）
  const hideTabBar = ['/wallet/create', '/wallet/import'].some((p) =>
    pathname.startsWith(p)
  )

  // 获取当前激活的 tab
  const activeTab = Object.entries(routeToTab).find(([route]) =>
    pathname === route || pathname.startsWith(route + '/')
  )?.[1] || 'home'

  const handleTabChange = (tabId: string) => {
    const route = tabRoutes[tabId]
    if (route) {
      router.navigate({ to: route })
    }
  }

  return (
    <div className={cn('flex min-h-screen flex-col bg-background', className)}>
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto pb-safe">
        {children}
      </main>

      {/* 底部导航 */}
      {!hideTabBar && (
        <TabBar
          items={tabs}
          activeId={activeTab}
          onTabChange={handleTabChange}
          className="safe-area-inset-bottom"
        />
      )}
    </div>
  )
}
