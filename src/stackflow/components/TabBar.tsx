import { cn } from '@/lib/utils';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  IconWallet,
  IconSettings,
  IconApps,
  IconBrandMiniprogram,
  IconAppWindowFilled,
  type Icon,
} from '@tabler/icons-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Controller } from 'swiper/modules';
import 'swiper/css';
import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { useSwiperMember } from '@/components/common/swiper-sync-context';
import { ecosystemStore, type EcosystemSubPage } from '@/stores/ecosystem';
import { miniappRuntimeStore, miniappRuntimeSelectors, openStackView } from '@/services/miniapp-runtime';
import { usePendingTransactions } from '@/hooks/use-pending-transactions';
import { useCurrentWallet } from '@/stores';

/** 生态页面顺序 */
const ECOSYSTEM_PAGE_ORDER: EcosystemSubPage[] = ['discover', 'mine', 'stack'];

/** 页面图标配置 */
const PAGE_ICONS: Record<EcosystemSubPage, Icon> = {
  discover: IconApps,
  mine: IconBrandMiniprogram,
  stack: IconAppWindowFilled,
};

/** 生态页面指示器（真实项目使用） - 使用 Controller 模块实现双向绑定 */
function useEcosystemIndicator(availablePages: EcosystemSubPage[], isActive: boolean) {
  const pageCount = availablePages.length;
  const maxIndex = pageCount - 1;

  const swiperRef = useRef<import('swiper').Swiper | null>(null);

  const initialSlideIndex = useMemo(() => {
    const savedPage = ecosystemStore.state.activeSubPage;
    const idx = availablePages.indexOf(savedPage);
    return idx >= 0 ? idx : 0;
  }, [availablePages]);

  const { onSwiper, onSlideChange } = useSwiperMember('ecosystem-indicator', 'ecosystem-main', {
    initialIndex: initialSlideIndex,
  });

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.allowTouchMove = isActive;
    }
  }, [isActive]);

  const [progress, setProgress] = useState(0);
  const indexProgress = maxIndex > 0 ? progress * maxIndex : 0;

  const getIconOpacity = (index: number) => {
    const distance = Math.abs(indexProgress - index);
    return Math.max(0, 1 - distance);
  };

  return {
    icon: (
      <Swiper
        className="-my-2.5 !h-10 !w-15"
        modules={[Controller]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          onSwiper(swiper);
        }}
        onSlideChange={onSlideChange}
        onProgress={(_, p) => setProgress(p)}
        slidesPerView="auto"
        centeredSlides={true}
        spaceBetween={8}
        allowTouchMove={isActive}
        resistance={true}
        resistanceRatio={0.5}
      >
        {availablePages.map((page, index) => {
          const PageIcon = PAGE_ICONS[page];
          const opacity = getIconOpacity(index);
          return (
            <SwiperSlide key={page} className="!flex !w-5 cursor-pointer !items-center !justify-center">
              <PageIcon
                className={cn(
                  'size-5 transition-opacity duration-100',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                style={{ opacity }}
                stroke={1.5}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    ),
    label: (
      <div className="flex h-4 items-center justify-center gap-1">
        {availablePages.map((page, index) => {
          const isActiveDot = Math.round(indexProgress) === index;
          return (
            <span
              key={page}
              className={cn(
                'size-1 rounded-full transition-all duration-200',
                isActiveDot ? 'bg-primary scale-125' : 'bg-muted-foreground/40',
              )}
            />
          );
        })}
      </div>
    ),
  };
}

// 3个tab：钱包、生态、设置
export type TabId = 'wallet' | 'ecosystem' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: Icon;
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

export function TabBar({ activeTab, onTabChange, className }: TabBarProps) {
  const { t } = useTranslation('common');
  const ecosystemSubPage = useStore(ecosystemStore, (s) => s.activeSubPage);
  const storeAvailablePages = useStore(ecosystemStore, (s) => s.availableSubPages);
  const hasRunningApps = useStore(miniappRuntimeStore, (s) => miniappRuntimeSelectors.getApps(s).length > 0);
  const hasRunningStackApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningStackApps);

  // Pending transactions count for wallet tab badge
  const currentWallet = useCurrentWallet();
  const { transactions: pendingTxs } = usePendingTransactions(currentWallet?.id);
  const pendingTxCount = pendingTxs.filter((tx) => tx.status !== 'confirmed').length;

  // 生态 Tab 是否激活
  const isEcosystemActive = activeTab === 'ecosystem';

  // 生态指示器（图标slider + 分页点）
  const availablePages = useMemo(() => {
    if (storeAvailablePages?.length) return storeAvailablePages;
    return hasRunningStackApps ? ECOSYSTEM_PAGE_ORDER : ECOSYSTEM_PAGE_ORDER.filter((p) => p !== 'stack');
  }, [storeAvailablePages, hasRunningStackApps]);

  const ecosystemIndicator = useEcosystemIndicator(availablePages, isEcosystemActive);

  // 生态 tab 图标：
  // - 在"应用堆栈"页或有运行中应用时：IconAppWindowFilled
  // - 在"我的"页：IconBrandMiniprogram
  // - 在"发现"页：IconApps
  const ecosystemIcon = useMemo(() => {
    if (ecosystemSubPage === 'stack' || hasRunningApps) {
      return IconAppWindowFilled;
    }
    if (ecosystemSubPage === 'mine') {
      return IconBrandMiniprogram;
    }
    return IconApps;
  }, [ecosystemSubPage, hasRunningApps]);

  const tabConfigs: Tab[] = useMemo(
    () => [
      { id: 'wallet', label: t('a11y.tabWallet'), icon: IconWallet },
      { id: 'ecosystem', label: t('a11y.tabEcosystem'), icon: ecosystemIcon },
      { id: 'settings', label: t('a11y.tabSettings'), icon: IconSettings },
    ],
    [t, ecosystemIcon],
  );

  // 生态按钮上滑手势检测
  const touchState = useRef({ startY: 0, startTime: 0 });
  const SWIPE_THRESHOLD = 30;
  const SWIPE_VELOCITY = 0.3;

  const handleEcosystemTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchState.current = { startY: touch.clientY, startTime: Date.now() };
    }
  }, []);

  const handleEcosystemTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaY = touchState.current.startY - touch.clientY;
      const deltaTime = Date.now() - touchState.current.startTime;
      const velocity = deltaY / deltaTime;

      // 检测上滑手势：需要有运行中的应用才能打开层叠视图
      if (hasRunningApps && (deltaY > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY)) {
        e.preventDefault();
        openStackView();
      }
    },
    [hasRunningApps],
  );

  return (
    <div
      data-testid="tab-bar"
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50',
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      style={{ height: 'var(--tab-bar-height)' }}
    >
      <div className="mx-auto flex h-[52px] max-w-md">
        {tabConfigs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = tab.label;
          const isEcosystem = tab.id === 'ecosystem';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onTouchStart={isEcosystem ? handleEcosystemTouchStart : undefined}
              onTouchEnd={isEcosystem ? handleEcosystemTouchEnd : undefined}
              data-testid={`tab-${tab.id}`}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* 图标区域 */}
              <div className="relative">
                {isEcosystem ? (
                  // 生态 Tab 始终使用 Swiper 渲染，减少 DOM 抖动
                  ecosystemIndicator.icon
                ) : (
                  <Icon className={cn('size-5', isActive && 'text-primary')} stroke={1.5} />
                )}
                {/* 运行中应用指示器（红点） */}
                {isEcosystem && hasRunningApps && !isActive && (
                  <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />
                )}
                {/* Pending transactions badge */}
                {tab.id === 'wallet' && pendingTxCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-2 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
                    {pendingTxCount > 9 ? '9+' : pendingTxCount}
                  </span>
                )}
              </div>
              {/* 标签区域 */}
              {isEcosystem && isActive ? (
                ecosystemIndicator.label
              ) : (
                <span className="text-xs font-medium">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const tabIds: TabId[] = ['wallet', 'ecosystem', 'settings'];
