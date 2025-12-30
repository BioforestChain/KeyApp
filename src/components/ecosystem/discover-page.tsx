import { useRef, forwardRef, useImperativeHandle } from 'react';
import { IconSearch, IconSparkles, IconChevronRight, IconApps } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import styles from './discover-page.module.css';
import { Button } from '@/components/ui/button';
import { MiniappIcon } from './miniapp-icon';
import type { MiniappManifest } from '@/services/ecosystem';

// ============================================
// 工具函数
// ============================================
function getTodayDate() {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

// 默认渐变色
const DEFAULT_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
];

function getAppGradient(app: MiniappManifest, fallbackIndex: number = 0): string {
  return app.themeColor || DEFAULT_GRADIENTS[fallbackIndex % DEFAULT_GRADIENTS.length];
}

// ============================================
// 大型精选卡片
// ============================================
function FeaturedStoryCard({ app, onTap }: { app: MiniappManifest; onTap: () => void }) {
  const gradient = app.themeColor || 'from-violet-600 via-purple-600 to-indigo-700';

  return (
    <button
      onClick={onTap}
      className={cn(
        'group relative w-full overflow-hidden rounded-3xl text-left',
        'shadow-xl shadow-black/10 dark:shadow-black/30',
        'transition-all duration-300 ease-out active:scale-[0.98]',
        'hover:shadow-2xl hover:shadow-black/20',
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(0,0,0,0.2),transparent_50%)]" />

      <div className="@container relative flex min-h-[300px] flex-col p-6">
        <div className="mb-auto flex items-center gap-2 text-xs font-semibold tracking-wider text-white/80 uppercase">
          <IconSparkles className="size-4" />
          精选应用
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-4 @sm:gap-5">
            <MiniappIcon src={app.icon} name={app.name} size="xl" glass className="@sm:!size-24 @sm:!rounded-[24px]" />
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="mb-1.5 text-2xl leading-tight font-bold text-white @sm:text-3xl">{app.name}</h2>
              <p className="line-clamp-2 text-sm leading-relaxed text-white/75 @sm:text-base">
                {app.longDescription?.split('\n')[0] || app.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================
// 横向滚动卡片
// ============================================
function HorizontalAppCard({
  app,
  onTap,
  fallbackColorIndex = 0,
}: {
  app: MiniappManifest;
  onTap: () => void;
  fallbackColorIndex?: number;
}) {
  const gradient = getAppGradient(app, fallbackColorIndex);

  return (
    <button
      onClick={onTap}
      className={cn(
        'relative w-44 shrink-0 overflow-hidden rounded-2xl text-left',
        'shadow-lg transition-all duration-200 active:scale-[0.96]',
        'snap-start scroll-ml-5',
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(255,255,255,0.25),transparent_40%)]" />

      <div className="relative flex h-[160px] flex-col p-4">
        <MiniappIcon src={app.icon} name={app.name} size="lg" customSize={56} glass className="mb-auto" />
        <div>
          <h3 className="truncate text-base font-bold text-white">{app.name}</h3>
          <p className="mt-0.5 truncate text-xs text-white/70">{app.description}</p>
        </div>
      </div>
    </button>
  );
}

// ============================================
// 应用列表项
// ============================================
function AppListItem({
  app,
  onTap,
  onOpen,
  rank,
  showRank = false,
}: {
  app: MiniappManifest;
  onTap: () => void;
  onOpen: () => void;
  rank?: number;
  showRank?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      {showRank && rank !== undefined && (
        <span className="text-muted-foreground/50 w-6 text-center text-lg font-bold">{rank}</span>
      )}

      <button onClick={onTap} className="shrink-0">
        <MiniappIcon src={app.icon} name={app.name} size="lg" customSize={64} shadow="sm" />
      </button>

      <button onClick={onTap} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-semibold">{app.name}</h3>
          {app.beta && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              Beta
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">{app.description}</p>
      </button>

      <Button
        size="sm"
        variant="secondary"
        className="h-8 shrink-0 rounded-full px-5 text-xs font-bold"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        获取
      </Button>
    </div>
  );
}

// ============================================
// 空状态
// ============================================
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="bg-muted mb-4 flex size-20 items-center justify-center rounded-full">
        <IconApps className="text-muted-foreground size-10" stroke={1.5} />
      </div>
      <h2 className="mb-1 text-lg font-semibold">{message}</h2>
    </div>
  );
}

// ============================================
// DiscoverPage 组件
// ============================================
export interface DiscoverPageRef {
  focusSearch: () => void;
}

export interface DiscoverPageProps {
  apps: MiniappManifest[];
  featuredApp?: MiniappManifest;
  featuredApps: MiniappManifest[];
  recommendedApps: MiniappManifest[];
  hotApps: MiniappManifest[];
  onAppDetail: (app: MiniappManifest) => void;
  onAppOpen: (app: MiniappManifest) => void;
}

export const DiscoverPage = forwardRef<DiscoverPageRef, DiscoverPageProps>(function DiscoverPage(
  { apps, featuredApp, featuredApps, recommendedApps, hotApps, onAppDetail, onAppOpen },
  ref,
) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
  }));

  return (
    <div className={cn(styles.discoverPage, 'h-full overflow-y-auto')}>
      {/* BigHeader - sticky，scroll-driven background */}
      <header className={cn(styles.discoverHeader, 'sticky top-0 z-10 px-5 pt-12 pb-4 backdrop-blur-xl')}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-foreground text-sm font-medium">{getTodayDate()}</p>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" stroke={1.5} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索应用"
            className={cn(
              'bg-muted/60 w-full rounded-xl py-3 pr-4 pl-12',
              'placeholder:text-muted-foreground/60 text-base',
              'focus:ring-primary/30 focus:ring-2 focus:outline-none',
              'transition-all duration-200',
            )}
          />
        </div>
      </header>

      {/* 内容区 */}
      <div className="space-y-8">
        {apps.length === 0 ? (
          <EmptyState message="暂无应用" />
        ) : (
          <>
            {featuredApp && (
              <section className="px-5">
                <FeaturedStoryCard app={featuredApp} onTap={() => onAppDetail(featuredApp)} />
              </section>
            )}

            {recommendedApps.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between px-5">
                  <h2 className="text-xl font-bold">推荐</h2>
                  <button className="text-primary flex items-center text-sm font-medium">
                    查看全部
                    <IconChevronRight className="size-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'flex gap-3 overflow-x-auto px-5 pb-3',
                    'snap-x snap-mandatory scroll-smooth',
                    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  )}
                >
                  {recommendedApps.map((app, i) => (
                    <HorizontalAppCard key={app.id} app={app} onTap={() => onAppDetail(app)} fallbackColorIndex={i} />
                  ))}
                </div>
              </section>
            )}

            <section className="px-5">
              <h2 className="mb-3 text-xl font-bold">热门应用</h2>
              <div className="bg-card divide-y rounded-2xl border">
                {hotApps.map((app, i) => (
                  <div key={app.id} className="px-4">
                    <AppListItem
                      app={app}
                      rank={i + 1}
                      showRank
                      onTap={() => onAppDetail(app)}
                      onOpen={() => onAppOpen(app)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {featuredApps.length > 1 && (
              <section className="px-5">
                <FeaturedStoryCard app={featuredApps[1]} onTap={() => onAppDetail(featuredApps[1])} />
              </section>
            )}
          </>
        )}

        {/* TabBar spacer */}
        <div className="h-[var(--tab-bar-height)]" />
      </div>
    </div>
  );
});
