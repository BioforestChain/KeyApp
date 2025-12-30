import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Controller } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { useStore } from '@tanstack/react-store';
import { useSwiperMember } from '@/components/common/swiper-sync-context';
import { useFlow } from '../../stackflow';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  initRegistry,
  getApps,
  subscribeApps,
  loadMyApps,
  addToMyApps,
  updateLastUsed,
  removeFromMyApps,
  type MyAppRecord,
} from '@/services/ecosystem';
import type { MiniappManifest } from '@/services/ecosystem';
import { DiscoverPage, MyAppsPage, IOSWallpaper, type DiscoverPageRef } from '@/components/ecosystem';
import { AppStackPage } from '@/components/ecosystem/app-stack-page';
import { computeFeaturedScore } from '@/services/ecosystem/scoring';
import {
  ecosystemActions,
  ECOSYSTEM_SUBPAGE_INDEX,
  ECOSYSTEM_INDEX_SUBPAGE,
  type EcosystemSubPage,
} from '@/stores/ecosystem';
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  launchApp,
} from '@/services/miniapp-runtime';

/** Parallax 视差系数 */
const PARALLAX_OFFSET = '-38.2%';
/** 最大页面数量 */
const MAX_PAGE_COUNT = 3;
/** Parallax 壁纸宽度：需覆盖最大偏移量 (页数-1) * |offset| */
const PARALLAX_WIDTH = `${100 + (MAX_PAGE_COUNT - 1) * Math.abs(parseFloat(PARALLAX_OFFSET))}%`;

/** 所有页面顺序 */
const ALL_PAGES: EcosystemSubPage[] = ['discover', 'mine', 'stack'];

export function EcosystemTab() {
  const { push } = useFlow();
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 监听是否有运行中的应用
  const hasRunningApps = useStore(
    miniappRuntimeStore,
    miniappRuntimeSelectors.hasRunningApps
  );

  // 可用页面（与 TabBar 指示器一致）
  const availablePages = useMemo(() => 
    hasRunningApps ? ALL_PAGES : ALL_PAGES.filter(p => p !== 'stack'),
    [hasRunningApps]
  );
  const pageCount = availablePages.length;

  // 从 localStorage 读取上次的 tab
  const [activeTab, setActiveTab] = useState<EcosystemSubPage>(() => {
    try {
      const saved = localStorage.getItem('ecosystem_active_tab') as EcosystemSubPage | null;
      // 如果保存的是 'stack' 但没有运行中的应用，回退到 'mine'
      if (saved === 'stack') {
        return 'mine';
      }
      const tab = saved === 'mine' ? 'mine' : 'discover';
      ecosystemActions.setActiveSubPage(tab);
      return tab;
    } catch {
      return 'discover';
    }
  });

  // 保存 tab 到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecosystem_active_tab', activeTab);
    } catch {
      // ignore
    }
  }, [activeTab]);

  const swiperRef = useRef<SwiperType | null>(null);
  const discoverPageRef = useRef<DiscoverPageRef>(null);

  // 使用 Context + Controller 模块实现与 TabBar 指示器的双向绑定
  const { onSwiper: syncOnSwiper, controlledSwiper } = useSwiperMember('ecosystem-main', 'ecosystem-indicator');

  // 注册主 Swiper
  const handleMainSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    syncOnSwiper(swiper);
  }, [syncOnSwiper]);

  // 更新进度到 Store（仅用于 UI 显示）
  const handleProgress = useCallback((_: SwiperType, progress: number) => {
    ecosystemActions.setSwiperProgress(progress * (pageCount - 1));
  }, [pageCount]);

  // 初始化数据
  useEffect(() => {
    const unsubscribe = subscribeApps((nextApps) => setApps(nextApps));

    initRegistry({ refresh: true }).then(() => {
      setApps(getApps());
      setMyAppRecords(loadMyApps());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Swiper 事件
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const newTab = availablePages[swiper.activeIndex] ?? 'discover';
    setActiveTab(newTab);
    ecosystemActions.setActiveSubPage(newTab);
  }, [availablePages]);



  // 搜索胶囊点击：滑到发现页 + 聚焦搜索框
  const handleSearchClick = useCallback(() => {
    swiperRef.current?.slideTo(0);
    // 延迟聚焦，等待滑动完成
    setTimeout(() => {
      discoverPageRef.current?.focusSearch();
    }, 300);
  }, []);

  // App 操作
  const handleAppDetail = useCallback(
    (app: MiniappManifest) => {
      push('MiniappDetailActivity', { appId: encodeURIComponent(app.id) });
    },
    [push],
  );

  const handleAppOpen = useCallback(
    (app: MiniappManifest) => {
      addToMyApps(app.id);
      updateLastUsed(app.id);
      setMyAppRecords(loadMyApps());

      // 使用 runtime service 启动应用
      launchApp(app.id, app);

      // 滑动到应用堆栈页（启动后 hasRunningApps 为 true，stack 在最后一页）
      swiperRef.current?.slideTo(2);
    },
    [],
  );

  const handleAppRemove = useCallback((appId: string) => {
    removeFromMyApps(appId);
    setMyAppRecords(loadMyApps());
  }, []);

  // 计算数据
  const myApps = useMemo(() => {
    return myAppRecords
      .map((record) => ({
        ...record,
        app: apps.find((a) => a.id === record.appId),
      }))
      .filter((item): item is MyAppRecord & { app: MiniappManifest } => !!item.app);
  }, [myAppRecords, apps]);

  const featuredApps = useMemo(() => {
    if (apps.length === 0) return [];
    return [...apps].sort((a, b) => computeFeaturedScore(b) - computeFeaturedScore(a)).slice(0, 2);
  }, [apps]);

  const featuredApp = featuredApps[0];

  const recommendedApps = useMemo(() => {
    const featuredIds = new Set(featuredApps.map((a) => a.id));
    return [...apps]
      .filter((a) => !featuredIds.has(a.id))
      .sort((a, b) => (b.officialScore ?? 0) - (a.officialScore ?? 0))
      .slice(0, 6);
  }, [apps, featuredApps]);

  const hotApps = useMemo(() => {
    return [...apps].sort((a, b) => (b.communityScore ?? 0) - (a.communityScore ?? 0)).slice(0, 10);
  }, [apps]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background relative h-full">
      <Swiper
        className="h-full w-full"
        modules={[Parallax, Controller]}
        controller={{ control: controlledSwiper }}
        parallax={true}
        initialSlide={availablePages.indexOf(activeTab)}
        onSwiper={handleMainSwiper}
        onSlideChange={handleSlideChange}
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
        <SwiperSlide className="!h-full !overflow-hidden">
          <div className="relative z-10 h-full">
            <DiscoverPage
              ref={discoverPageRef}
              apps={apps}
              featuredApp={featuredApp}
              featuredApps={featuredApps}
              recommendedApps={recommendedApps}
              hotApps={hotApps}
              onAppDetail={handleAppDetail}
              onAppOpen={handleAppOpen}
            />
          </div>
        </SwiperSlide>

        {/* 我的页 */}
        <SwiperSlide className="!h-full !overflow-hidden">
          <div className="relative z-10 h-full">
            <MyAppsPage
              apps={myApps.map(({ app, lastUsedAt }) => ({ app, lastUsed: lastUsedAt }))}
              onSearchClick={handleSearchClick}
              onAppOpen={handleAppOpen}
              onAppDetail={handleAppDetail}
              onAppRemove={handleAppRemove}
            />
          </div>
        </SwiperSlide>

        {/* 应用堆栈页 - 仅在有运行中应用时渲染 */}
        {hasRunningApps && (
          <SwiperSlide className="!h-full !overflow-hidden">
            <div className="relative z-10 h-full">
              <AppStackPage />
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
