/**
 * EcosystemTabIndicator - 生态 Tab 页面指示器
 *
 * 松耦合设计：
 * - 默认从 store 读取状态（无需 props）
 * - 支持外部控制（传入 props 覆盖）
 */

import { useCallback, useMemo } from 'react';
import { useStore } from '@tanstack/react-store';
import { IconApps, IconBrandMiniprogram, IconStack2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ecosystemStore, type EcosystemSubPage } from '@/stores/ecosystem';
import { miniappRuntimeStore, miniappRuntimeSelectors } from '@/services/miniapp-runtime';
import styles from './ecosystem-tab-indicator.module.css';

export interface EcosystemTabIndicatorProps {
  /** 当前页面（可选，默认从 store 读取） */
  activePage?: EcosystemSubPage;
  /** 切换页面回调（可选，用于外部控制） */
  onPageChange?: (page: EcosystemSubPage) => void;
  /** 是否有运行中的应用（可选，默认从 store 读取） */
  hasRunningApps?: boolean;
  /** 自定义类名 */
  className?: string;
}

/** 页面顺序 */
const PAGE_ORDER: EcosystemSubPage[] = ['discover', 'mine', 'stack'];

/** 页面图标配置 */
const PAGE_ICONS = {
  discover: IconApps,
  mine: IconBrandMiniprogram,
  stack: IconStack2,
} as const;

/** 页面标签 */
const PAGE_LABELS = {
  discover: '发现', // i18n-ignore: tab label
  mine: '我的', // i18n-ignore: tab label
  stack: '堆栈', // i18n-ignore: tab label
} as const;

export function EcosystemTabIndicator({
  activePage: activePageProp,
  onPageChange,
  hasRunningApps: hasRunningAppsProp,
  className,
}: EcosystemTabIndicatorProps) {
  // 从 store 读取状态（松耦合）
  const storeActivePage = useStore(ecosystemStore, (s) => s.activeSubPage);
  const storeAvailablePages = useStore(ecosystemStore, (s) => s.availableSubPages);
  const storeHasRunningApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningApps);

  // 使用 props 覆盖 store 值（支持受控模式）
  const activePage = activePageProp ?? storeActivePage;
  const hasRunningApps = hasRunningAppsProp ?? storeHasRunningApps;

  // 计算可用页面
  const availablePages = useMemo(() => {
    if (storeAvailablePages?.length) return storeAvailablePages;
    if (hasRunningApps) return PAGE_ORDER;
    return PAGE_ORDER.filter((p) => p !== 'stack');
  }, [storeAvailablePages, hasRunningApps]);

  // 当前页面索引
  const activeIndex = availablePages.indexOf(activePage);

  // 获取下一页
  const getNextPage = useCallback(() => {
    const nextIndex = (activeIndex + 1) % availablePages.length;
    return availablePages[nextIndex];
  }, [activeIndex, availablePages]);

  // 处理点击
  const handleClick = useCallback(() => {
    const nextPage = getNextPage();
    if (nextPage) {
      onPageChange?.(nextPage);
    }
  }, [getNextPage, onPageChange]);

  // 当前图标
  const Icon = PAGE_ICONS[activePage];
  const label = PAGE_LABELS[activePage];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(styles.indicator, className)}
      aria-label={`当前：${label}，点击切换`}
      data-testid="ecosystem-tab-indicator"
    >
      {/* 图标容器 - 带 crossfade 动画 */}
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} stroke={1.5} />
      </div>

      {/* 页面点指示器 */}
      <div className={styles.dots}>
        {availablePages.map((page, index) => (
          <span key={page} className={cn(styles.dot, index === activeIndex && styles.dotActive)} />
        ))}
      </div>
    </button>
  );
}

export default EcosystemTabIndicator;
