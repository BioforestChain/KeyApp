import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { TabBar, type TabItem } from './tab-bar'
import { Home, Wallet, Settings, ArrowLeftRight } from 'lucide-react'
import { walletActions, useWalletInitialized } from '@/stores'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

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
  const { t } = useTranslation()

  // Build tabs with localized aria-labels
  const tabs: TabItem[] = [
    { id: 'home', label: '首页', icon: <Home className="size-5" />, ariaLabel: t('a11y.tabHome') },
    { id: 'transfer', label: '转账', icon: <ArrowLeftRight className="size-5" />, ariaLabel: t('a11y.tabTransfer') },
    { id: 'wallet', label: '钱包', icon: <Wallet className="size-5" />, ariaLabel: t('a11y.tabWallet') },
    { id: 'settings', label: '设置', icon: <Settings className="size-5" />, ariaLabel: t('a11y.tabSettings') },
  ]
  
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
      {/* Skip link for keyboard navigation - S4 a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t('a11y.skipToMain')}
      </a>

      {/* 主内容区域 */}
      <main id="main-content" className="flex-1 overflow-auto pb-safe" tabIndex={-1}>
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
