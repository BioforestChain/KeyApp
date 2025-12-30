import { useCallback, useEffect, useRef, useState } from 'react';
import { IconDownload, IconPlayerPlay, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { MiniappIcon } from './miniapp-icon';
import { SourceIcon } from './source-icon';
import { IOSSearchCapsule } from './ios-search-capsule';
import type { MiniappManifest } from '@/services/ecosystem';
import { registerIconRef, unregisterIconRef } from '@/services/miniapp-runtime';

// ============================================
// iOS 桌面图标（带 Popover 菜单）
// ============================================
interface IOSDesktopIconProps {
  app: MiniappManifest;
  onTap: () => void;
  onOpen: () => void;
  onDetail: () => void;
  onRemove: () => void;
}

function IOSDesktopIcon({ app, onTap, onOpen, onDetail, onRemove }: IOSDesktopIconProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 注册图标 ref 到 runtime service（用于 FLIP 动画）
  useEffect(() => {
    if (iconRef.current) {
      registerIconRef(app.id, iconRef.current);
    }
    return () => {
      unregisterIconRef(app.id);
    };
  }, [app.id]);

  const showMenu = () => {
    const popover = popoverRef.current;
    if (!popover) return;
    
    // 计算位置（在 showPopover 之前，popover 还在文档流中）
    const rect = popover.getBoundingClientRect();
    
    // 设置 CSS 变量（通过 !important 生效）
    popover.style.setProperty('--popover-top', `${rect.top}px`);
    popover.style.setProperty('--popover-left', `${rect.left}px`);
    
    // 菜单位置（图标上方）
    const menuWidth = 224;
    const menuHeight = 180;
    const gap = 16;
    
    let menuTop = rect.top - menuHeight - gap;
    let menuLeft = rect.left + rect.width / 2 - menuWidth / 2;
    
    if (menuLeft < 16) menuLeft = 16;
    if (menuLeft + menuWidth > window.innerWidth - 16) {
      menuLeft = window.innerWidth - menuWidth - 16;
    }
    if (menuTop < 16) {
      menuTop = rect.bottom + gap;
    }
    
    setMenuPosition({ top: menuTop, left: menuLeft });
    popover.showPopover();
    setIsOpen(true);
  };

  const hideMenu = () => {
    const popover = popoverRef.current;
    if (!popover) return;
    
    // 触发退出动画
    const menu = popover.querySelector('.ios-context-menu');
    menu?.classList.add('closing');
    popover.style.setProperty('--backdrop-opacity', '0');
    
    // 等待动画完成后隐藏 popover
    setTimeout(() => {
      popover.hidePopover();
      setIsOpen(false);
      menu?.classList.remove('closing');
      popover.style.removeProperty('--backdrop-opacity');
    }, 200);
  };

  // 监听 popover toggle 事件
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    
    const handleToggle = (e: ToggleEvent) => {
      setIsOpen(e.newState === 'open');
    };
    
    el.addEventListener('toggle', handleToggle);
    return () => el.removeEventListener('toggle', handleToggle);
  }, []);

  const handleTouchStart = () => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      showMenu();
    }, 500);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!didLongPress.current) {
      e.preventDefault();
      onTap();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showMenu();
  };

  const handleAction = (action: () => void) => {
    hideMenu();
    action();
  };

  const menuItems = [
    { icon: IconPlayerPlay, label: '打开', action: onOpen },
    { icon: IconInfoCircle, label: '详情', action: onDetail },
    { icon: IconTrash, label: '移除', action: onRemove, destructive: true },
  ];

  return (
    // 占位容器（在网格中保持位置）
    <div className="ios-icon-wrapper">
      {/* Popover（打开时提升到顶层） */}
      <div
        ref={popoverRef}
        popover="manual"
        className="ios-desktop-icon"
      >
        {/* 点击拦截层（视觉效果由 ::backdrop 提供） */}
        {isOpen && (
          <div 
            className="fixed inset-0 ios-backdrop-clickarea"
            style={{ zIndex: -1 }}
            onClick={hideMenu}
          />
        )}

        {/* 图标按钮 */}
        <button
          className={cn(
            'flex flex-col items-center gap-1.5 p-2',
            'touch-manipulation select-none',
            'transition-all duration-200 ease-out',
            'active:scale-95',
          )}
          onClick={onTap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          data-testid={`ios-app-icon-${app.id}`}
        >
          <div ref={iconRef} className="relative">
            <MiniappIcon
              src={app.icon}
              name={app.name}
              size="lg"
              customSize={60}
              shadow="md"
            />
            <div className="absolute -top-1 -right-1">
              <SourceIcon src={app.sourceIcon} name={app.sourceName} size="sm" />
            </div>
          </div>
          <span className="line-clamp-2 max-w-[72px] text-center text-[11px] leading-tight font-medium text-foreground/90">
            {app.name}
          </span>
        </button>

        {/* 菜单 */}
        {isOpen && (
          <div
            className="ios-context-menu fixed w-56"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-popover/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="truncate text-sm font-semibold">{app.name}</h3>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">{app.description}</p>
              </div>
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => handleAction(item.action)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5',
                      'text-sm font-medium',
                      'transition-colors duration-100',
                      'active:bg-white/10',
                      item.destructive ? 'text-red-500 dark:text-red-400' : 'text-foreground',
                      index === menuItems.length - 1 && 'mt-1 border-t border-white/10 pt-2.5',
                    )}
                  >
                    <item.icon className="size-5" stroke={1.5} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 空状态
// ============================================
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="bg-muted/50 mb-4 flex size-20 items-center justify-center rounded-full">
        <IconDownload className="text-muted-foreground size-10" stroke={1.5} />
      </div>
      <h2 className="mb-1 text-lg font-semibold">还没有使用过的应用</h2>
      <p className="text-muted-foreground text-sm">去「发现」页面探索吧</p>
    </div>
  );
}

// ============================================
// MyAppsPage 组件
// ============================================
export interface MyAppsPageProps {
  apps: Array<{ app: MiniappManifest; lastUsed: number }>;
  onSearchClick: () => void;
  onAppOpen: (app: MiniappManifest) => void;
  onAppDetail: (app: MiniappManifest) => void;
  onAppRemove: (appId: string) => void;
}

export function MyAppsPage({ apps, onSearchClick, onAppOpen, onAppDetail, onAppRemove }: MyAppsPageProps) {
  const columns = 4;
  const pageSize = columns * 6;
  const pages = Math.ceil(apps.length / pageSize);

  return (
    <div className="my-apps-page h-full">
      <div className="relative z-10 h-full overflow-y-auto">
        {/* 顶部区域 - 搜索胶囊 */}
        <div className="flex justify-center px-5 pt-14 pb-6">
          <IOSSearchCapsule onClick={onSearchClick} />
        </div>

        {/* 内容区 */}
        {apps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-4 pb-8">
            {/* iOS 桌面网格 */}
            <div
              className="grid justify-items-center gap-y-4"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {apps.map(({ app }) => (
                <IOSDesktopIcon
                  key={app.id}
                  app={app}
                  onTap={() => onAppOpen(app)}
                  onOpen={() => onAppOpen(app)}
                  onDetail={() => onAppDetail(app)}
                  onRemove={() => onAppRemove(app.id)}
                />
              ))}
            </div>

            {/* 页面指示器 */}
            {pages > 1 && (
              <div className="mt-6 flex justify-center gap-1.5">
                {Array.from({ length: pages }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'size-2 rounded-full transition-colors',
                      i === 0 ? 'bg-foreground/80' : 'bg-foreground/20',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TabBar spacer */}
        <div className="h-[var(--tab-bar-height)]" />
      </div>
    </div>
  );
}
