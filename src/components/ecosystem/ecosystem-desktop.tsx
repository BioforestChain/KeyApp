/**
 * EcosystemDesktop - 生态系统桌面组件
 *
 * 灵活配置的三页式桌面：发现页 | 我的页 | 应用堆栈页
 * 支持动态开关页面，壁纸宽度自适应
 */
import { useCallback, useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Controller } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { useStore } from '@tanstack/react-store';
import { useSwiperMember } from '@/components/common/swiper-sync-context';
import { DiscoverPage, MyAppsPage, IOSWallpaper, type DiscoverPageRef } from '@/components/ecosystem';
import { AppStackPage } from '@/components/ecosystem/app-stack-page';
import { MiniappWindowStack } from '@/components/ecosystem/miniapp-window-stack';
import { ecosystemActions, ecosystemStore, type EcosystemSubPage } from '@/stores/ecosystem';
import { miniappRuntimeStore, miniappRuntimeSelectors } from '@/services/miniapp-runtime';
import type { MiniappManifest } from '@/services/ecosystem';

/** Parallax 视差系数 */
const PARALLAX_OFFSET = '-38.2%';
/** 最大页面数量（用于计算壁纸宽度） */
const MAX_PAGE_COUNT = 3;
/** Parallax 壁纸宽度：始终按最大页数计算，避免动态变化导致的问题 */
const PARALLAX_WIDTH = `${100 + (MAX_PAGE_COUNT - 1) * Math.abs(parseFloat(PARALLAX_OFFSET))}%`;

/** 桌面配置 */
export interface EcosystemDesktopConfig {
  /** 是否显示发现页（默认 true） */
  showDiscoverPage?: boolean;
  /** 是否显示应用堆栈页（默认 'auto'，根据是否有运行中的应用自动判断） */
  showStackPage?: boolean | 'auto';
  /** 初始页面（默认根据配置自动选择） */
  initialPage?: EcosystemSubPage;
}

/** 桌面数据 */
export interface EcosystemDesktopData {
  /** 所有应用列表 */
  apps: MiniappManifest[];
  /** 我的应用（带最后使用时间） */
  myApps: Array<{ app: MiniappManifest; lastUsed: number }>;
  /** 精选应用 */
  featuredApps?: MiniappManifest[];
  /** 推荐应用 */
  recommendedApps?: MiniappManifest[];
  /** 热门应用 */
  hotApps?: MiniappManifest[];
}

/** 桌面回调 */
export interface EcosystemDesktopCallbacks {
  /** 打开应用 */
  onAppOpen: (app: MiniappManifest) => void;
  /** 查看应用详情 */
  onAppDetail: (app: MiniappManifest) => void;
  /** 移除应用 */
  onAppRemove: (appId: string) => void;
}

export interface EcosystemDesktopProps
  extends EcosystemDesktopConfig, EcosystemDesktopData, EcosystemDesktopCallbacks {}

/** 桌面控制句柄 */
export interface EcosystemDesktopHandle {
  /** 滑动到指定页面 */
  slideTo: (page: EcosystemSubPage) => void;
  /** 聚焦搜索框（需要发现页可见） */
  focusSearch: () => void;
  /** 获取当前页面 */
  getCurrentPage: () => EcosystemSubPage;
  /** 获取 Swiper 实例 */
  getSwiper: () => SwiperType | null;
}

export const EcosystemDesktop = forwardRef<EcosystemDesktopHandle, EcosystemDesktopProps>(
  function EcosystemDesktop(props, ref) {
    const {
      // 配置
      showDiscoverPage = true,
      showStackPage = 'auto',
      initialPage,
      // 数据
      apps,
      myApps,
      featuredApps = [],
      recommendedApps = [],
      hotApps = [],
      // 回调
      onAppOpen,
      onAppDetail,
      onAppRemove,
    } = props;

    const swiperRef = useRef<SwiperType | null>(null);
    const discoverPageRef = useRef<DiscoverPageRef>(null);
    const currentPageRef = useRef<EcosystemSubPage>('mine');

    // 如果启动了小程序，则强制滑到对应的 targetDesktop（mine/stack）
    const forcedSubPage = useStore(miniappRuntimeStore, (state) => {
      if (state.presentations.size === 0) return null;

      const visiblePresentations = Array.from(state.presentations.values()).filter((p) => p.state !== 'hidden');
      if (visiblePresentations.length === 0) return null;

      const focusedId = state.focusedAppId ?? state.activeAppId;
      const focusedPresentation = focusedId ? state.presentations.get(focusedId) : null;
      const targetDesktop =
        focusedPresentation?.desktop ??
        (focusedId ? (state.apps.get(focusedId)?.manifest.targetDesktop ?? null) : null);

      const desktopToSubPage = (desktop: string | null | undefined): EcosystemSubPage => {
        return desktop === 'stack' ? 'stack' : 'mine';
      };

      if (targetDesktop) return desktopToSubPage(targetDesktop);

      const topmost = visiblePresentations.reduce((acc, cur) => (cur.zOrder > acc.zOrder ? cur : acc));
      return desktopToSubPage(topmost.desktop);
    });

    // 监听是否有 stack-target 应用（用于决定是否展示 stack 页）
    const hasRunningStackApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningStackApps);

    // 计算实际显示的页面
    const actualShowStackPage = showStackPage === 'auto' ? hasRunningStackApps : showStackPage;

    // 可用页面列表
    const availablePages = useMemo(() => {
      const pages: EcosystemSubPage[] = [];
      if (showDiscoverPage) pages.push('discover');
      pages.push('mine');
      if (actualShowStackPage) pages.push('stack');
      return pages;
    }, [showDiscoverPage, actualShowStackPage]);

    const pageCount = availablePages.length;

    // 从 store 读取上次保存的 activeSubPage
    const savedActiveSubPage = useStore(ecosystemStore, (state) => state.activeSubPage);

    // 计算初始滑动索引（优先级：props > store 保存的 > 默认值）
    const initialSlideIndex = useMemo(() => {
      const page = initialPage ?? savedActiveSubPage ?? (showDiscoverPage ? 'discover' : 'mine');
      const idx = availablePages.indexOf(page);
      return idx >= 0 ? idx : 0;
    }, [initialPage, savedActiveSubPage, showDiscoverPage, availablePages]);

    // 使用 Swiper 同步 hook
    const { onSwiper: syncOnSwiper, onSlideChange: syncOnSlideChange } = useSwiperMember(
      'ecosystem-main',
      'ecosystem-indicator',
      {
        initialIndex: initialSlideIndex,
        onSlideChange: (swiper) => {
          const newPage = availablePages[swiper.activeIndex] ?? 'mine';
          currentPageRef.current = newPage;
          ecosystemActions.setActiveSubPage(newPage);
        },
      },
    );

    // 注册主 Swiper
    const handleMainSwiper = useCallback(
      (swiper: SwiperType) => {
        swiperRef.current = swiper;
        syncOnSwiper(swiper);

        const page = availablePages[initialSlideIndex] ?? 'mine';
        currentPageRef.current = page;
        ecosystemActions.setAvailableSubPages(availablePages);
      },
      [syncOnSwiper, availablePages, initialSlideIndex],
    );

    // 当可用页面列表变化时，同步到 store，避免指示器与页面不一致
    useEffect(() => {
      ecosystemActions.setAvailableSubPages(availablePages);
    }, [availablePages]);

    // 当有小程序启动时，强制切到 targetDesktop 所在页
    useEffect(() => {
      if (!forcedSubPage) return;
      if (currentPageRef.current === forcedSubPage) return;

      const idx = availablePages.indexOf(forcedSubPage);
      if (idx < 0) return;
      swiperRef.current?.slideTo(idx);
    }, [forcedSubPage, availablePages]);

    // 更新进度到 Store
    const handleProgress = useCallback(
      (_: SwiperType, progress: number) => {
        ecosystemActions.setSwiperProgress(progress * (pageCount - 1));
      },
      [pageCount],
    );

    // 搜索胶囊点击：滑到发现页 + 聚焦搜索框
    const handleSearchClick = useCallback(() => {
      if (!showDiscoverPage) return;
      const discoverIndex = availablePages.indexOf('discover');
      if (discoverIndex >= 0) {
        swiperRef.current?.slideTo(discoverIndex);
        setTimeout(() => discoverPageRef.current?.focusSearch(), 300);
      }
    }, [showDiscoverPage, availablePages]);

    // 暴露控制句柄
    useImperativeHandle(
      ref,
      () => ({
        slideTo: (page: EcosystemSubPage) => {
          const idx = availablePages.indexOf(page);
          if (idx >= 0) swiperRef.current?.slideTo(idx);
        },
        focusSearch: () => {
          if (showDiscoverPage) {
            discoverPageRef.current?.focusSearch();
          }
        },
        getCurrentPage: () => currentPageRef.current,
        getSwiper: () => swiperRef.current,
      }),
      [availablePages, showDiscoverPage],
    );

    // 精选应用第一个
    const featuredApp = featuredApps[0];

    return (
      <div className="bg-background relative h-full">
        <Swiper
          className="h-full w-full"
          modules={[Parallax, Controller]}
          parallax={true}
          onSwiper={handleMainSwiper}
          onSlideChange={syncOnSlideChange}
          onProgress={handleProgress}
          resistanceRatio={0.5}
        >
          {/* Parallax 共享壁纸 */}
          <div
            className="absolute inset-y-0 left-0 z-0"
            style={{ width: PARALLAX_WIDTH }}
            data-swiper-parallax={PARALLAX_OFFSET}
          >
            <IOSWallpaper className="h-full w-full" />
          </div>

          {/* 发现页 */}
          {showDiscoverPage && (
            <SwiperSlide className="!h-full !overflow-hidden">
              <div className="relative z-10 h-full">
                <DiscoverPage
                  ref={discoverPageRef}
                  apps={apps}
                  featuredApp={featuredApp}
                  featuredApps={featuredApps}
                  recommendedApps={recommendedApps}
                  hotApps={hotApps}
                  onAppDetail={onAppDetail}
                  onAppOpen={onAppOpen}
                />
              </div>
            </SwiperSlide>
          )}

          {/* 我的页 */}
          <SwiperSlide className="!h-full !overflow-hidden">
            <div className="relative z-10 h-full" data-ecosystem-subpage="mine">
              <MyAppsPage
                apps={myApps}
                showSearch={showDiscoverPage}
                onSearchClick={handleSearchClick}
                onAppOpen={onAppOpen}
                onAppDetail={onAppDetail}
                onAppRemove={onAppRemove}
              />
              <MiniappWindowStack desktop="mine" />
            </div>
          </SwiperSlide>

          {/* 应用堆栈页 */}
          {actualShowStackPage && (
            <SwiperSlide className="!h-full !overflow-hidden">
              <div className="relative z-10 h-full" data-ecosystem-subpage="stack">
                <AppStackPage />
                <MiniappWindowStack desktop="stack" />
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    );
  },
);
