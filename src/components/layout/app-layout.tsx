import { useRouter, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TabBar, type TabItem } from './tab-bar';
import {
  IconWallet as Wallet,
  IconSettings as Settings,
} from '@tabler/icons-react';
import type { CSSProperties } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const tabRoutes: Record<string, string> = {
  wallet: '/',
  settings: '/settings',
};

const routeToTab: Record<string, string> = {
  '/': 'wallet',
  '/send': 'wallet',
  '/receive': 'wallet',
  '/history': 'wallet',
  '/settings': 'settings',
};

export function AppLayout({ children, className }: AppLayoutProps) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTranslation();

  const tabWallet = t('a11y.tabWallet');
  const tabSettings = t('a11y.tabSettings');

  // Build tabs with localized labels - 简化为2个tab
  const tabs: TabItem[] = [
    { id: 'wallet', label: tabWallet, icon: <Wallet className="size-5" />, ariaLabel: tabWallet },
    { id: 'settings', label: tabSettings, icon: <Settings className="size-5" />, ariaLabel: tabSettings },
  ];

  // 判断是否显示 TabBar（某些页面不需要）
  const hideTabBar = ['/wallet/create', '/authorize', '/onboarding'].some((p) =>
    pathname.startsWith(p),
  );

  // 获取当前激活的 tab
  const activeTab =
    Object.entries(routeToTab).find(([route]) => pathname === route || pathname.startsWith(route + '/'))?.[1] || 'wallet';

  const handleTabChange = (tabId: string) => {
    const route = tabRoutes[tabId];
    if (route) {
      router.navigate({ to: route });
    }
  };

  const mainStyle: CSSProperties & { ['--safe-area-inset-bottom']: string } = {
    '--safe-area-inset-bottom': hideTabBar
      ? 'env(safe-area-inset-bottom)'
      : 'calc(env(safe-area-inset-bottom) + 3.5rem)',
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
        style={mainStyle}
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
