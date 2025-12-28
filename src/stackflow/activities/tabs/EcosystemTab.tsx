import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { MiniappIcon, MiniappIconWithLabel, MiniappIconGrid, SourceIcon } from '@/components/ecosystem';
import { computeFeaturedScore } from '@/services/ecosystem/scoring';
import {
  IconSearch,
  IconApps,
  IconChevronRight,
  IconDownload,
  IconSparkles,
  IconPlayerPlay,
  IconInfoCircle,
  IconTrash,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// 工具函数
// ============================================
function getTodayDate() {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

// ============================================
// iOS 风格 Context Menu
// ============================================
interface ContextMenuProps {
  app: MiniappManifest;
  position: { x: number; y: number };
  onClose: () => void;
  onOpen: () => void;
  onDetail: () => void;
  onRemove: () => void;
}

function ContextMenu({ app, position, onClose, onOpen, onDetail, onRemove }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  const adjustedPosition = useMemo(() => {
    const menuWidth = 220;
    const menuHeight = 320;
    const padding = 16;

    let x = position.x - menuWidth / 2;
    let y = position.y + 20;

    if (x < padding) x = padding;
    if (x + menuWidth > window.innerWidth - padding) x = window.innerWidth - menuWidth - padding;
    if (y + menuHeight > window.innerHeight - padding) y = position.y - menuHeight - 20;

    return { x, y };
  }, [position]);

  const menuItems = [
    { icon: IconPlayerPlay, label: '打开', action: onOpen, color: 'text-primary' },
    { icon: IconInfoCircle, label: '详情', action: onDetail, color: 'text-foreground' },
    { icon: IconTrash, label: '移除', action: onRemove, color: 'text-destructive', destructive: true },
  ];

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 bg-black/20 backdrop-blur-sm duration-200">
      <div
        ref={menuRef}
        className={cn(
          'bg-popover/95 absolute w-56 rounded-2xl shadow-2xl backdrop-blur-xl',
          'border-border/50 overflow-hidden border',
          'animate-in zoom-in-95 slide-in-from-bottom-2 duration-200',
        )}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      >
        {/* App 预览 - 使用统一图标组件 */}
        <div className="border-border/50 flex items-center gap-3 border-b p-4">
          <MiniappIcon src={app.icon} name={app.name} size="md" shadow="sm" />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{app.name}</h4>
            <p className="text-muted-foreground truncate text-xs">{app.description}</p>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="py-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-sm font-medium',
                'hover:bg-accent/50 active:bg-accent transition-colors',
                item.destructive && 'border-border/50 mt-1 border-t',
                item.color,
              )}
            >
              <item.icon className="size-5" stroke={1.5} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// iOS 桌面风格图标（带长按手势）
// ============================================
interface IOSAppIconProps {
  app: MiniappManifest;
  onTap: () => void;
  onContextMenu: (position: { x: number; y: number }) => void;
  isWiggling?: boolean;
}

function IOSAppIcon({ app, onTap, onContextMenu, isWiggling }: IOSAppIconProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsPressed(true);

    longPressTimer.current = setTimeout(() => {
      onContextMenu({ x: touch.clientX, y: touch.clientY - 60 });
      setIsPressed(false);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onTap();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu({ x: e.clientX, y: e.clientY - 60 });
  };

  return (
    <button
      data-testid={`ios-app-icon-${app.id}`}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-2xl p-2',
        'touch-manipulation select-none',
        'transition-transform duration-150',
        isPressed && 'scale-90',
        isWiggling && 'animate-wiggle',
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      onClick={(e) => {
        if (e.detail === 1 && !('ontouchstart' in window)) {
          onTap();
        }
      }}
    >
      {/* 图标容器 - 带来源标识 */}
      <div className="relative">
        <MiniappIcon src={app.icon} name={app.name} size="lg" shadow="md" />
        {/* 来源图标 - 右上角 */}
        <div className="absolute -top-1 -right-1">
          <SourceIcon src={app.sourceIcon} name={app.sourceName} size="sm" />
        </div>
      </div>

      {/* 应用名称 */}
      <span className="line-clamp-2 max-w-[70px] text-center text-[11px] leading-tight font-medium">{app.name}</span>
    </button>
  );
}

// ============================================
// 大型精选卡片
// ============================================
function FeaturedStoryCard({ app, onTap }: { app: MiniappManifest; onTap: () => void }) {
  // 使用应用自己的主题色
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
            {/* 使用统一图标组件 - 玻璃态 */}
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
  // 使用应用自己的主题色
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
        {/* 使用统一图标组件 - 玻璃态 */}
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
        {/* 使用统一图标组件 */}
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
// Tab 页内容
// ============================================
type TabType = 'discover' | 'mine';

// 默认渐变色（当应用没有配置 themeColor 时使用）
const DEFAULT_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
];

/** 获取应用的渐变色 */
function getAppGradient(app: MiniappManifest, fallbackIndex: number = 0): string {
  // 优先使用应用配置的 themeColor
  if (app.themeColor) {
    return app.themeColor;
  }
  // 否则使用默认渐变色
  return DEFAULT_GRADIENTS[fallbackIndex % DEFAULT_GRADIENTS.length];
}

export function EcosystemTab() {
  const { t } = useTranslation('common');
  const { push } = useFlow();
  const [apps, setApps] = useState<MiniappManifest[]>([]);
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  const [contextMenu, setContextMenu] = useState<{
    app: MiniappManifest;
    position: { x: number; y: number };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeApps((nextApps) => setApps(nextApps));

    initRegistry({ refresh: true }).then(() => {
      setApps(getApps());
      setMyAppRecords(loadMyApps());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (contextMenu) return;
      startX.current = e.touches[0].clientX;
      currentX.current = 0;
      isDragging.current = true;
    },
    [contextMenu],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || contextMenu) return;
      currentX.current = e.touches[0].clientX - startX.current;
    },
    [contextMenu],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || contextMenu) return;
    isDragging.current = false;

    const threshold = 80;
    // 向左滑（负值）切换到右边的"我的"，向右滑（正值）切换到左边的"发现"
    if (currentX.current < -threshold && activeTab === 'discover') {
      setActiveTab('mine');
    } else if (currentX.current > threshold && activeTab === 'mine') {
      setActiveTab('discover');
    }
  }, [activeTab, contextMenu]);

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

  const handleRemoveApp = useCallback((appId: string) => {
    removeFromMyApps(appId);
    setMyAppRecords(loadMyApps());
  }, []);

  // TODO: 分享功能 - 需要完整实现（URL协议、二维码等）
  // TODO: 收藏功能 - 需要完整实现

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
    <div
      className="bg-background flex min-h-screen flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="bg-background sticky top-0 z-20 px-5 pt-12 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{getTodayDate()}</p>
          <button
            onClick={() => {
              /* TODO: 搜索 */
            }}
            className="bg-muted/60 hover:bg-muted flex size-10 items-center justify-center rounded-full transition-colors"
            aria-label="搜索"
          >
            <IconSearch className="size-5" stroke={1.5} />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="relative flex gap-6">
          {(['discover', 'mine'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-2xl font-bold transition-colors duration-300',
                activeTab === tab ? 'text-foreground' : 'text-muted-foreground/40',
              )}
            >
              {tab === 'discover' ? '发现' : '我的'}
            </button>
          ))}

          <div
            className="bg-primary absolute -bottom-2 h-1 rounded-full transition-all duration-300 ease-out"
            style={{
              width: '48px',
              transform: `translateX(${activeTab === 'discover' ? '0' : 'calc(48px + 24px)'})`,
            }}
          />
        </div>
      </header>

      {/* Tab 内容容器 */}
      <div ref={containerRef} className="relative flex-1">
        {/* 发现页 */}
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto pb-8',
            'transition-all duration-400 ease-out',
            activeTab === 'discover' ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0',
          )}
        >
          {apps.length === 0 ? (
            <EmptyState message="暂无应用" />
          ) : (
            <div className="space-y-8 pt-4">
              {featuredApp && (
                <section className="px-5">
                  <FeaturedStoryCard app={featuredApp} onTap={() => handleAppDetail(featuredApp)} />
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
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {recommendedApps.map((app, i) => (
                      <HorizontalAppCard
                        key={app.id}
                        app={app}
                        onTap={() => handleAppDetail(app)}
                        fallbackColorIndex={i}
                      />
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
                        onTap={() => handleAppDetail(app)}
                        onOpen={() => handleAppOpen(app)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {featuredApps.length > 1 && (
                <section className="px-5">
                  <FeaturedStoryCard app={featuredApps[1]} onTap={() => handleAppDetail(featuredApps[1])} />
                </section>
              )}
            </div>
          )}
        </div>

        {/* 我的页 - iOS 桌面风格 */}
        <div
          className={cn(
            'absolute inset-0 overflow-y-auto pb-8',
            'transition-all duration-400 ease-out',
            activeTab === 'mine' ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0',
          )}
        >
          {myApps.length === 0 ? (
            <EmptyState
              message="还没有使用过的应用"
              subMessage="去「发现」页面探索吧"
              icon={<IconDownload className="text-muted-foreground size-10" stroke={1.5} />}
            />
          ) : (
            <div className="px-4 pt-6">
              {/* iOS 桌面网格 - 使用 MiniappIconGrid */}
              <MiniappIconGrid columns={4} iconSize="lg" gap="sm">
                {myApps.map(({ app }) => (
                  <IOSAppIcon
                    key={app.id}
                    app={app}
                    onTap={() => handleAppOpen(app)}
                    onContextMenu={(position) => setContextMenu({ app, position })}
                  />
                ))}
              </MiniappIconGrid>

              <p className="text-muted-foreground mt-8 text-center text-xs">长按图标查看更多选项</p>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          app={contextMenu.app}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onOpen={() => handleAppOpen(contextMenu.app)}
          onDetail={() => handleAppDetail(contextMenu.app)}
          onRemove={() => handleRemoveApp(contextMenu.app.id)}
        />
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function EmptyState({ message, subMessage, icon }: { message: string; subMessage?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="bg-muted mb-4 flex size-20 items-center justify-center rounded-full">
        {icon || <IconApps className="text-muted-foreground size-10" stroke={1.5} />}
      </div>
      <h2 className="mb-1 text-lg font-semibold">{message}</h2>
      {subMessage && <p className="text-muted-foreground text-sm">{subMessage}</p>}
    </div>
  );
}
