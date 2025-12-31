import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import { EcosystemDesktop, type EcosystemDesktopHandle } from '@/components/ecosystem';
import { computeFeaturedScore } from '@/services/ecosystem/scoring';
import { launchApp } from '@/services/miniapp-runtime';

export function EcosystemTab() {
  const { push } = useFlow();
  const desktopRef = useRef<EcosystemDesktopHandle>(null);
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

      // 滑动到应用堆栈页
      setTimeout(() => desktopRef.current?.slideTo('stack'), 100);
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
      .filter((item): item is MyAppRecord & { app: MiniappManifest } => !!item.app)
      .map(({ app, lastUsedAt }) => ({ app, lastUsed: lastUsedAt }));
  }, [myAppRecords, apps]);

  const featuredApps = useMemo(() => {
    if (apps.length === 0) return [];
    return [...apps].sort((a, b) => computeFeaturedScore(b) - computeFeaturedScore(a)).slice(0, 2);
  }, [apps]);

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
