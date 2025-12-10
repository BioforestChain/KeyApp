import { lazy, Suspense } from 'react'
import {
  createRouter,
  createRootRoute,
  createRoute,
  createHashHistory,
  Outlet,
} from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { LoadingSpinner } from '@/components/common/loading-spinner'

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const WalletCreatePage = lazy(() => import('@/pages/wallet/create').then((m) => ({ default: m.WalletCreatePage })))
const WalletImportPage = lazy(() => import('@/pages/wallet/import').then((m) => ({ default: m.WalletImportPage })))
const WalletDetailPage = lazy(() => import('@/pages/wallet/detail').then((m) => ({ default: m.WalletDetailPage })))
const TokenDetailPage = lazy(() => import('@/pages/token/detail').then((m) => ({ default: m.TokenDetailPage })))
const SendPage = lazy(() => import('@/pages/send').then((m) => ({ default: m.SendPage })))
const ReceivePage = lazy(() => import('@/pages/receive').then((m) => ({ default: m.ReceivePage })))
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))
const LanguagePage = lazy(() => import('@/pages/settings/language').then((m) => ({ default: m.LanguagePage })))
const ViewMnemonicPage = lazy(() => import('@/pages/settings/view-mnemonic').then((m) => ({ default: m.ViewMnemonicPage })))

// Onboarding pages
const OnboardingCreatePage = lazy(() => import('@/pages/onboarding/create').then((m) => ({ default: m.OnboardingCreatePage })))
const OnboardingRecoverPage = lazy(() => import('@/pages/onboarding/recover').then((m) => ({ default: m.OnboardingRecoverPage })))

// 加载中占位
function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

// 包装懒加载组件
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return function SuspenseWrapper() {
    return (
      <Suspense fallback={<PageLoading />}>
        <Component />
      </Suspense>
    )
  }
}

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

// 首页
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: withSuspense(HomePage),
})

// 钱包路由
const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
})

const walletCreateRoute = createRoute({
  getParentRoute: () => walletRoute,
  path: '/create',
  component: withSuspense(WalletCreatePage),
})

const walletImportRoute = createRoute({
  getParentRoute: () => walletRoute,
  path: '/import',
  component: withSuspense(WalletImportPage),
})

const walletDetailRoute = createRoute({
  getParentRoute: () => walletRoute,
  path: '/$walletId',
  component: withSuspense(WalletDetailPage),
})

// 代币路由
const tokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/token/$tokenId',
  component: withSuspense(TokenDetailPage),
})

// 转账路由
const sendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send',
  component: withSuspense(SendPage),
})

// 收款路由
const receiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receive',
  component: withSuspense(ReceivePage),
})

// 设置路由
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: withSuspense(SettingsPage),
})

const settingsLanguageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/language',
  component: withSuspense(LanguagePage),
})

const settingsMnemonicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/mnemonic',
  component: withSuspense(ViewMnemonicPage),
})

// Onboarding 路由
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
})

const onboardingCreateRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: '/create',
  component: withSuspense(OnboardingCreatePage),
})

const onboardingRecoverRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: '/recover',
  component: withSuspense(OnboardingRecoverPage),
})

// 路由树
const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute.addChildren([
    walletCreateRoute,
    walletImportRoute,
    walletDetailRoute,
  ]),
  onboardingRoute.addChildren([
    onboardingCreateRoute,
    onboardingRecoverRoute,
  ]),
  tokenRoute,
  sendRoute,
  receiveRoute,
  settingsRoute,
  settingsLanguageRoute,
  settingsMnemonicRoute,
])

// 使用 hash history，支持部署在任意子路径下
const hashHistory = createHashHistory()

// 创建路由器
export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
})

// 类型声明
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
