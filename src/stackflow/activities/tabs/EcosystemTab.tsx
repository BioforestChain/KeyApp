import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { useStore } from '@tanstack/react-store';
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
import { miniappRuntimeStore, miniappRuntimeSelectors } from '@/services/miniapp-runtime';

type TabType = 'discover' | 'mine';

/** Parallax 视差系数 */
const PARALLAX_OFFSET = '-38.2%';

export function EcosystemTab() {
  const { push } = useFlow();
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 监听是否有运行中的应用（决定第三页是否可滑动）
  const hasRunningApps = useStore(
    miniappRuntimeStore,
    miniappRuntimeSelectors.hasRunningApps
  );

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
    const newTab = ECOSYSTEM_INDEX_SUBPAGE[swiper.activeIndex] ?? 'discover';
    setActiveTab(newTab);
    ecosystemActions.setActiveSubPage(newTab);
  }, []);

  // 控制第三页是否可滑动
  const handleSlideChangeTransitionStart = useCallback((swiper: SwiperType) => {
    // 如果没有运行中的应用，禁止滑动到第三页
    if (!hasRunningApps && swiper.activeIndex === 2) {
      swiper.slideTo(1, 0);
    }
  }, [hasRunningApps]);

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
      push('MiniappActivity', { appId: app.id });
    },
    [push],
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
    <div className="bg-background h-full">
      <Swiper
        className="h-full w-full"
        modules={[Parallax]}
        parallax={true}
        initialSlide={ECOSYSTEM_SUBPAGE_INDEX[activeTab]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionStart={handleSlideChangeTransitionStart}
        resistanceRatio={0.5}
        allowSlideNext={activeTab !== 'mine' || hasRunningApps}
      >
        {/* Parallax 共享壁纸 - 三页共享 */}
        <div
          className="absolute inset-0 z-0"
          data-swiper-parallax={PARALLAX_OFFSET}
        >
          <IOSWallpaper className="h-full w-full" />
        </div>

        {/* 发现页 - 负一屏 */}
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

        {/* 我的页 - iOS 桌面 */}
        <SwiperSlide className="!h-full !overflow-hidden">
          <div className="relative z-10 h-full">
            <MyAppsPage
              apps={myApps.map(({ app, lastUsed }) => ({ app, lastUsed }))}
              onSearchClick={handleSearchClick}
              onAppOpen={handleAppOpen}
              onAppDetail={handleAppDetail}
              onAppRemove={handleAppRemove}
            />
          </div>
        </SwiperSlide>

        {/* 应用堆栈页 - 第三页 */}
        <SwiperSlide className="!h-full !overflow-hidden">
          <div className="relative z-10 h-full">
            <AppStackPage />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
