import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
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
import { DiscoverPage, MyAppsPage, type DiscoverPageRef } from '@/components/ecosystem';
import { computeFeaturedScore } from '@/services/ecosystem/scoring';
import { ecosystemActions } from '@/stores/ecosystem';

type TabType = 'discover' | 'mine';

export function EcosystemTab() {
  const { push } = useFlow();
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 读取上次的 tab
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem('ecosystem_active_tab');
      const tab = saved === 'mine' ? 'mine' : 'discover';
      // 同步到 store
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
    const newTab = swiper.activeIndex === 0 ? 'discover' : 'mine';
    setActiveTab(newTab);
    // 同步到 store（用于 TabBar 图标切换）
    ecosystemActions.setActiveSubPage(newTab);
  }, []);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      <Swiper
        className="h-full w-full"
        initialSlide={activeTab === 'mine' ? 1 : 0}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        resistanceRatio={0.5}
      >
        {/* 发现页 - 负一屏 */}
        <SwiperSlide className="!h-full !overflow-hidden">
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
        </SwiperSlide>

        {/* 我的页 - iOS 桌面 */}
        <SwiperSlide className="!h-full !overflow-hidden">
          <MyAppsPage
            apps={myApps.map(({ app, lastUsed }) => ({ app, lastUsed }))}
            onSearchClick={handleSearchClick}
            onAppOpen={handleAppOpen}
            onAppDetail={handleAppDetail}
            onAppRemove={handleAppRemove}
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
