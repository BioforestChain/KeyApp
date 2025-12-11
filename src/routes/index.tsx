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
const WalletListPage = lazy(() => import('@/pages/wallet/list').then((m) => ({ default: m.WalletListPage })))
const TokenDetailPage = lazy(() => import('@/pages/token/detail').then((m) => ({ default: m.TokenDetailPage })))
const SendPage = lazy(() => import('@/pages/send').then((m) => ({ default: m.SendPage })))
const ReceivePage = lazy(() => import('@/pages/receive').then((m) => ({ default: m.ReceivePage })))
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))
const LanguagePage = lazy(() => import('@/pages/settings/language').then((m) => ({ default: m.LanguagePage })))
const ViewMnemonicPage = lazy(() => import('@/pages/settings/view-mnemonic').then((m) => ({ default: m.ViewMnemonicPage })))
const ChangePasswordPage = lazy(() => import('@/pages/settings/change-password').then((m) => ({ default: m.ChangePasswordPage })))
const CurrencyPage = lazy(() => import('@/pages/settings/currency').then((m) => ({ default: m.CurrencyPage })))

// History pages
const TransactionHistoryPage = lazy(() => import('@/pages/history').then((m) => ({ default: m.TransactionHistoryPage })))
const TransactionDetailPage = lazy(() => import('@/pages/history/detail').then((m) => ({ default: m.TransactionDetailPage })))

// Onboarding pages
const OnboardingCreatePage = lazy(() => import('@/pages/onboarding/create').then((m) => ({ default: m.OnboardingCreatePage })))
const OnboardingRecoverPage = lazy(() => import('@/pages/onboarding/recover').then((m) => ({ default: m.OnboardingRecoverPage })))

// Address Book page
const AddressBookPage = lazy(() => import('@/pages/address-book').then((m) => ({ default: m.AddressBookPage })))

// Notifications page
const NotificationCenterPage = lazy(() => import('@/pages/notifications').then((m) => ({ default: m.NotificationCenterPage })))

// Staking pages
const StakingPage = lazy(() => import('@/pages/staking').then((m) => ({ default: m.StakingPage })))

// Scanner page
const ScannerPage = lazy(() => import('@/pages/scanner').then((m) => ({ default: m.ScannerPage })))

// Guide pages
const WelcomeScreen = lazy(() => import('@/pages/guide/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen })))

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

// Root Route with AppLayout (main routes)
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

const walletListRoute = createRoute({
  getParentRoute: () => walletRoute,
  path: '/list',
  component: withSuspense(WalletListPage),
})

// 代币路由
const tokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/token/$tokenId',
  component: withSuspense(TokenDetailPage),
})

// 转账路由 - 支持从扫码器预填地址
const sendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/send',
  component: withSuspense(SendPage),
  validateSearch: (search: Record<string, unknown>) => ({
    address: typeof search.address === 'string' ? search.address : undefined,
    chain: typeof search.chain === 'string' ? search.chain : undefined,
    amount: typeof search.amount === 'string' ? search.amount : undefined,
  }),
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

const settingsPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/password',
  component: withSuspense(ChangePasswordPage),
})

const settingsCurrencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/currency',
  component: withSuspense(CurrencyPage),
})

// History 路由
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: withSuspense(TransactionHistoryPage),
})

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transaction/$txId',
  component: withSuspense(TransactionDetailPage),
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

// Address Book 路由
const addressBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/address-book',
  component: withSuspense(AddressBookPage),
})

// Notifications 路由
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: withSuspense(NotificationCenterPage),
})

// Staking 路由
const stakingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staking',
  component: withSuspense(StakingPage),
})

// Scanner 路由
const scannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scanner',
  component: withSuspense(ScannerPage),
})

// Guide 路由
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/welcome',
  component: withSuspense(WelcomeScreen),
})

// 路由树
const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute.addChildren([
    walletCreateRoute,
    walletImportRoute,
    walletDetailRoute,
    walletListRoute,
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
  settingsPasswordRoute,
  settingsCurrencyRoute,
  historyRoute,
  transactionDetailRoute,
  addressBookRoute,
  notificationsRoute,
  stakingRoute,
  scannerRoute,
  welcomeRoute,
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
