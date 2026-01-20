/**
 * MiniappDetailActivity - 小程序详情页 (App Store 风格)
 */

import { useEffect, useState, useCallback } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { useStore } from '@tanstack/react-store';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { useTranslation } from 'react-i18next';
import { useFlow } from '../stackflow';
import {
  getAppById,
  initRegistry,
  refreshSources,
  type MiniappManifest,
  KNOWN_PERMISSIONS,
  getPermissionInfo,
} from '@/services/ecosystem';
import { LoadingSpinner } from '@/components/common';
import { MiniappIcon } from '@/components/ecosystem';
import {
  IconArrowLeft,
  IconShieldCheck,
  IconAlertTriangle,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconShare,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { launchApp } from '@/services/miniapp-runtime';
import { ecosystemActions, ecosystemStore, ecosystemSelectors } from '@/stores/ecosystem';

type MiniappDetailActivityParams = {
  appId: string;
};

function PrivacyItem({ permission, isLast }: { permission: string; isLast: boolean }) {
  const def = KNOWN_PERMISSIONS[permission];
  const risk = def?.risk ?? 'medium';
  const info = getPermissionInfo(permission);

  const Icon = risk === 'high' ? IconAlertTriangle : IconShieldCheck;
  const iconColor = risk === 'high' ? 'text-red-500' : risk === 'medium' ? 'text-amber-500' : 'text-green-500';

  return (
    <div className={cn('flex items-start gap-3 py-3', !isLast && 'border-border/50 border-b')}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor)} stroke={1.5} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{info.label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{info.description}</p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink = false,
  href,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}) {
  const content = (
    <div className="border-border/50 flex items-center justify-between border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn('text-sm font-medium', isLink && 'text-primary flex items-center gap-1')}>
        {value}
        {isLink && <IconChevronRight className="size-4" />}
      </span>
    </div>
  );

  if (isLink && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

export const MiniappDetailActivity: ActivityComponentType<MiniappDetailActivityParams> = ({ params }) => {
  const { pop } = useFlow();
  const { t } = useTranslation('ecosystem');
  const [app, setApp] = useState<MiniappManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  // Use store selector for reactivity (Single Source of Truth)
  const installed = useStore(ecosystemStore, (state) => ecosystemSelectors.isAppInstalled(state, params.appId));

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      setLoading(true);

      await initRegistry();
      let manifest = getAppById(params.appId);

      // If opened via deep-link, cache may be empty. Refresh once to ensure we can resolve the app.
      if (!manifest) {
        await refreshSources({ force: false });
        manifest = getAppById(params.appId);
      }

      if (disposed) return;
      setApp(manifest ?? null);
      setLoading(false);
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [params.appId]);

  const handleInstall = useCallback(() => {
    if (!app) return;
    ecosystemActions.installApp(app.id);
  }, [app]);

  const handleOpen = useCallback(() => {
    if (!app) return;
    ecosystemActions.updateAppLastUsed(app.id);
    ecosystemActions.setActiveSubPage('mine');
    launchApp(app.id, { ...app, targetDesktop: 'mine' });
    pop();
  }, [app, pop]);

  if (loading) {
    return (
      <AppScreen>
        <div className="bg-background flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppScreen>
    );
  }

  if (!app) {
    return (
      <AppScreen>
        <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
          <button
            onClick={() => pop()}
            className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
          >
            {t('detail.back')}
          </button>
        </div>
      </AppScreen>
    );
  }

  const description = app.longDescription ?? app.description;
  const isDescLong = description.length > 150;
  const displayDesc = descExpanded || !isDescLong ? description : description.slice(0, 150) + '...';

  return (
    <AppScreen>
      <div className="bg-background detail-scroll-container flex min-h-screen flex-col">
        {/* Header - 滚动驱动效果：滚动后显示 app 名称 */}
        <div className="bg-background/80 border-border/50 sticky top-0 z-20 border-b backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => pop()} className="hover:bg-muted -ml-1.5 rounded-full p-1.5 transition-colors">
              <IconArrowLeft className="size-5" stroke={1.5} />
            </button>

            {/* App 名称 - 滚动后显示（渐进增强，不支持时保持隐藏） */}
            <span className="detail-header-title max-w-[200px] truncate font-semibold">{app.name}</span>

            <button className="hover:bg-muted -mr-1.5 rounded-full p-1.5 transition-colors">
              <IconShare className="size-5" stroke={1.5} />
            </button>
          </div>
        </div>

        <div className="detail-scroller flex-1 overflow-y-auto">
          {/* App Header - App Store 风格 */}
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-start gap-4">
              {/* 大图标 */}
              <MiniappIcon src={app.icon} name={app.name} size="2xl" shadow="lg" className="shrink-0" />

              {/* 信息区 */}
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="truncate text-xl font-bold">{app.name}</h1>
                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {app.author ?? t('detail.unknownDeveloper')}
                </p>

                {/* 获取/打开按钮 */}
                {installed ? (
                  <button
                    onClick={handleOpen}
                    className="bg-primary text-primary-foreground mt-4 rounded-full px-8 py-2 text-sm font-semibold"
                  >
                    {t('detail.open')}
                  </button>
                ) : (
                  <button
                    onClick={handleInstall}
                    className="bg-primary text-primary-foreground mt-4 rounded-full px-8 py-2 text-sm font-semibold"
                  >
                    {t('detail.get')}
                  </button>
                )}
              </div>
            </div>

            {/* 元信息行 */}
            <div className="text-muted-foreground mt-5 flex items-center gap-4 text-xs">
              {app.category && (
                <span className="text-foreground font-medium">
                  {t(`detail.categories.${app.category}`, { defaultValue: app.category })}
                </span>
              )}
              {app.beta && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Beta
                </span>
              )}
              <span>v{app.version}</span>
            </div>
          </div>

          {/* 截图预览 - App Store 风格 */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="border-border/50 border-t">
              <div className="px-5 py-4">
                <h2 className="mb-4 text-lg font-bold">{t('detail.preview')}</h2>
                <div
                  className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {app.screenshots.map((url, i) => (
                    <div
                      key={i}
                      className="bg-muted aspect-[9/19.5] w-[220px] shrink-0 snap-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5"
                    >
                      <img
                        src={url}
                        alt={`${app.name} screenshot ${i + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 描述 */}
          <div className="border-border/50 border-t px-5 py-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayDesc}</p>
            {isDescLong && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-primary mt-2 flex items-center gap-1 text-sm font-medium"
              >
                {descExpanded ? t('detail.collapse') : t('detail.more')}
                {descExpanded ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />}
              </button>
            )}
          </div>

          {/* 支持的链 */}
          {app.chains && app.chains.length > 0 && (
            <div className="border-border/50 border-t px-5 py-4">
              <h2 className="mb-3 text-lg font-bold">{t('detail.supportedChains')}</h2>
              <div className="flex flex-wrap gap-2">
                {app.chains.map((chain) => (
                  <span key={chain} className="bg-muted rounded-full px-3 py-1.5 text-sm font-medium">
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 隐私 / 权限 - App Store 风格 */}
          {app.permissions && app.permissions.length > 0 && (
            <div className="border-border/50 border-t px-5 py-4">
              <h2 className="mb-1 text-lg font-bold">{t('detail.privacy')}</h2>
              <p className="text-muted-foreground mb-4 text-xs">{t('detail.privacyHint')}</p>
              <div className="bg-muted/50 rounded-2xl px-4">
                {app.permissions.map((perm, i) => (
                  <PrivacyItem key={perm} permission={perm} isLast={i === app.permissions!.length - 1} />
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {app.tags && app.tags.length > 0 && (
            <div className="border-border/50 border-t px-5 py-4">
              <h2 className="mb-3 text-lg font-bold">{t('detail.tags')}</h2>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 信息 */}
          <div className="border-border/50 border-t px-5 py-4">
            <h2 className="mb-2 text-lg font-bold">{t('detail.info')}</h2>
            <div className="bg-muted/50 rounded-2xl px-4">
              {app.author && <InfoRow label={t('detail.developer')} value={app.author} />}
              <InfoRow label={t('detail.version')} value={app.version} />
              {app.category && (
                <InfoRow
                  label={t('detail.category')}
                  value={t(`detail.categories.${app.category}`, { defaultValue: app.category })}
                />
              )}
              {app.publishedAt && <InfoRow label={t('detail.publishedAt')} value={app.publishedAt} />}
              {app.updatedAt && <InfoRow label={t('detail.updatedAt')} value={app.updatedAt} />}
              {app.website && (
                <InfoRow label={t('detail.website')} value={t('detail.visit')} isLink href={app.website} />
              )}
            </div>
          </div>

          {/* 底部安全间距 */}
          <div className="h-8" />
        </div>
      </div>
    </AppScreen>
  );
};
