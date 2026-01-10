import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useStore } from '@tanstack/react-store';
import { useFlow } from '../../stackflow';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  initRegistry,
  getApps,
  subscribeApps,
  type MyAppRecord,
} from '@/services/ecosystem';
import type { MiniappManifest } from '@/services/ecosystem';
import { EcosystemDesktop, type EcosystemDesktopHandle } from '@/components/ecosystem';
import { computeFeaturedScore } from '@/services/ecosystem/scoring';
import { launchApp, useMiniappVisibilityRestore } from '@/services/miniapp-runtime';
import { ecosystemActions, ecosystemStore } from '@/stores/ecosystem';

export function EcosystemTab() {
  const { push } = useFlow();
  const desktopRef = useRef<EcosystemDesktopHandle>(null);
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subscribe to myApps from the store (Single Source of Truth)
  const myAppRecords = useStore(ecosystemStore, (state) => state.myApps);

  // 初始化数据
  useEffect(() => {
    const unsubscribe = subscribeApps((nextApps) => setApps(nextApps));

    initRegistry({ refresh: true }).then(() => {
      setApps(getApps());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 当 Activity 从 hidden 变为 visible 时，恢复小程序可见性
  useMiniappVisibilityRestore();

  // App 操作
  const handleAppDetail = useCallback(
    (app: MiniappManifest) => {
      push('MiniappDetailActivity', { appId: encodeURIComponent(app.id) });
    },
    [push],
  );

  const handleAppOpen = useCallback(
    (app: MiniappManifest) => {
      // Use store actions instead of direct service calls
      ecosystemActions.installApp(app.id);
      ecosystemActions.updateAppLastUsed(app.id);

      // 为了保证 shared layout 捕获到 icon 的起点位置，先固定到 mine
      ecosystemActions.setActiveSubPage('mine');
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => {
        launchApp(app.id, { ...app, targetDesktop: 'mine' });
      });
    },
    [],
  );

  const handleAppRemove = useCallback((appId: string) => {
    ecosystemActions.uninstallApp(appId);
  }, []);

  // 计算数据
  const myApps = useMemo(() => {
    return myAppRecords
      .map((record) => ({
        ...record,
        app: apps.find((a) => a.id === record.appId),
      }))
      .filter((item): item is MyAppRecord & { app: MiniappManifest } => !!item.app)
      .map(({ app, lastUsedAt }) => ({ app, lastUsed: lastUsedAt }));
  }, [myAppRecords, apps]);

  const featuredApps = useMemo(() => {
    if (apps.length === 0) return [];
    return [...apps].toSorted((a, b) => computeFeaturedScore(b) - computeFeaturedScore(a)).slice(0, 2);
  }, [apps]);

  const recommendedApps = useMemo(() => {
    const featuredIds = new Set(featuredApps.map((a) => a.id));
    return [...apps]
      .filter((a) => !featuredIds.has(a.id))
      .toSorted((a, b) => (b.officialScore ?? 0) - (a.officialScore ?? 0))
      .slice(0, 6);
  }, [apps, featuredApps]);

  const hotApps = useMemo(() => {
    return [...apps].toSorted((a, b) => (b.communityScore ?? 0) - (a.communityScore ?? 0)).slice(0, 10);
  }, [apps]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <EcosystemDesktop
      ref={desktopRef}
      showDiscoverPage={true}
      showStackPage="auto"
      apps={apps}
      myApps={myApps}
      featuredApps={featuredApps}
      recommendedApps={recommendedApps}
      hotApps={hotApps}
      onAppOpen={handleAppOpen}
      onAppDetail={handleAppDetail}
      onAppRemove={handleAppRemove}
    />
  );
}

