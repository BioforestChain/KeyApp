import { useEffect } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TabBar, type TabItem } from './tab-bar';
import {
  IconHome as Home,
  IconWallet as Wallet,
  IconSettings as Settings,
  IconArrowLeftRight as ArrowLeftRight,
} from '@tabler/icons-react';
import { chainConfigActions, preferencesActions, walletActions, useWalletInitialized } from '@/stores';
import { installAuthorizeDeepLinkListener } from '@/services/authorize/deep-link';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const tabRoutes: Record<string, string> = {
  home: '/',
  transfer: '/send',
  wallet: '/wallet',
  settings: '/settings',
};

const routeToTab: Record<string, string> = {
  '/': 'home',
  '/send': 'transfer',
  '/receive': 'transfer',
  '/wallet': 'wallet',
  '/settings': 'settings',
};

export function AppLayout({ children, className }: AppLayoutProps) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isInitialized = useWalletInitialized();
  const { t } = useTranslation();

  const tabHome = t('a11y.tabHome');
  const tabTransfer = t('a11y.tabTransfer');
  const tabWallet = t('a11y.tabWallet');
  const tabSettings = t('a11y.tabSettings');

  // Build tabs with localized labels
  const tabs: TabItem[] = [
    { id: 'home', label: tabHome, icon: <Home className="size-5" />, ariaLabel: tabHome },
    { id: 'transfer', label: tabTransfer, icon: <ArrowLeftRight className="size-5" />, ariaLabel: tabTransfer },
    { id: 'wallet', label: tabWallet, icon: <Wallet className="size-5" />, ariaLabel: tabWallet },
    { id: 'settings', label: tabSettings, icon: <Settings className="size-5" />, ariaLabel: tabSettings },
  ];

  // 应用启动时初始化钱包 store
  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize();
    }
  }, [isInitialized]);

  // 应用启动时初始化 chain-config（用于后续页面/业务读取 enabled chains）
  useEffect(() => {
    void chainConfigActions.initialize();
  }, []);

  // 应用启动时初始化 preferences（同步 i18n 语言与 RTL）
  useEffect(() => {
    preferencesActions.initialize();
  }, []);

  // Authorize deep-link support (mpay legacy schema) - mock-first, no real IPC required.
  useEffect(() => {
    return installAuthorizeDeepLinkListener(router);
  }, [router]);

  // 判断是否显示 TabBar（某些页面不需要）
  const hideTabBar = ['/wallet/create', '/wallet/import', '/authorize', '/onboarding'].some((p) =>
    pathname.startsWith(p),
  );

  // 获取当前激活的 tab
  const activeTab =
    Object.entries(routeToTab).find(([route]) => pathname === route || pathname.startsWith(route + '/'))?.[1] || 'home';

  const handleTabChange = (tabId: string) => {
    const route = tabRoutes[tabId];
    if (route) {
      router.navigate({ to: route });
    }
  };

  return (
    <div className={cn('bg-background flex min-h-screen flex-col', className)}>
      {/* Skip link for keyboard navigation - S4 a11y */}
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        {t('a11y.skipToMain')}
      </a>

      {/* 主内容区域 */}
      <main
        id="main-content"
        className={cn('flex-1 *:h-screen *:overflow-auto *:pb-(--safe-area-inset-bottom)')}
        tabIndex={-1}
        style={
          {
            '--safe-area-inset-bottom': hideTabBar
              ? 'env(safe-area-inset-bottom)'
              : 'calc(env(safe-area-inset-bottom) + 3.5rem)',
          } as any
        }
      >
        {children}
      </main>

      {/* 底部导航 */}
      {!hideTabBar && (
        <TabBar items={tabs} activeId={activeTab} onTabChange={handleTabChange} className="safe-area-inset-bottom" />
      )}
    </div>
  );
}
