import { useEffect, useRef, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import { IconDownload, IconPlayerPlay, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion, LayoutGroup } from 'motion/react';
import { isAnimationEnabled } from '@biochain/ecosystem-native';
import { MiniappIcon } from './miniapp-icon';
import { SourceIcon } from './source-icon';
import { IOSSearchCapsule } from './ios-search-capsule';
import type { MiniappManifest } from '@/services/ecosystem';
import { flowToCornerBadge, runtimeStateToStableFlow } from './miniapp-motion-flow';
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  registerDesktopContainerRef,
  registerIconRef,
  registerIconInnerRef,
  unregisterDesktopContainerRef,
  unregisterIconRef,
} from '@/services/miniapp-runtime';
import { getMiniappMotionPresets } from '@/services/miniapp-runtime/visual-config';
import styles from './my-apps-page.module.css';

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
  const { t } = useTranslation('common')
  const popoverRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const runtimeState = useStore(miniappRuntimeStore, (s) => s.apps.get(app.id)?.state ?? null);
  const visualConfig = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getVisualConfig);
  const motionPresets = getMiniappMotionPresets(visualConfig);
  const focusedAppId = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getFocusedAppId);
  const isFocusedApp = focusedAppId === app.id;
  const presentationState = useStore(
    miniappRuntimeStore,
    (s) => s.presentations.get(app.id)?.state ?? null,
  );
  const iconFlow = runtimeStateToStableFlow(runtimeState);
  const iconStackingVariant =
    isFocusedApp && (iconFlow === 'opening' || iconFlow === 'splash') ? 'elevated' : 'normal';
  const cornerBadgeVariant = flowToCornerBadge[iconFlow];
  // icon 只在窗口 transitioning 阶段持有 shared layout（present/dismiss）
  // Safari 优化：当 sharedLayout 被禁用时也禁用 layoutId
  const enableSharedLayout =
    (presentationState === null || presentationState === 'presenting' || presentationState === 'dismissing') &&
    isAnimationEnabled('sharedLayout');
  const sharedLayoutIds = enableSharedLayout
    ? {
      container: `miniapp:${app.id}:container`,
      logo: `miniapp:${app.id}:logo`,
      inner: `miniapp:${app.id}:inner`,
    }
    : null;

  const ICON_STACKING_VARIANTS = {
    normal: { zIndex: 0, pointerEvents: 'auto' },
    elevated: { zIndex: 50, pointerEvents: 'none' },
  } as const;

  const CORNER_BADGE_VARIANTS = {
    show: { opacity: 1, scale: 1 },
    hide: { opacity: 0, scale: 0.6 },
  } as const;

  // 注册图标 ref 到 runtime（用于 rect 计算 / 共享元素动画）
  useEffect(() => {
    if (popoverRef.current) {
      registerIconRef(app.id, popoverRef.current);
    }
    if (iconRef.current) {
      registerIconInnerRef(app.id, iconRef.current);
    }
    return () => {
      unregisterIconRef(app.id);
    };
  }, [app.id]);

  // 动画引用
  const popoverAnimationRef = useRef<Animation | null>(null);
  const iconAnimationRef = useRef<Animation | null>(null);
  const menuAnimationRef = useRef<Animation | null>(null);

  const showMenu = () => {
    const popover = popoverRef.current;
    const icon = iconRef.current;
    if (!popover || !icon) return;

    const rect = popover.getBoundingClientRect();

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

    // 用 Web Animation API 设置 popover 位置（fill: forwards 保持最终状态）
    popoverAnimationRef.current = popover.animate(
      [
        {
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          margin: '0',
          inset: 'auto',
          zIndex: '50',
        },
      ],
      {
        duration: 0,
        fill: 'forwards',
      },
    );

    // 图标浮起动画
    iconAnimationRef.current = icon.animate(
      [
        { transform: 'scale(1) translateY(0)', filter: 'drop-shadow(0 0 0 transparent)' },
        { transform: 'scale(1.08) translateY(-4px)', filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))' },
      ],
      {
        duration: 200,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards',
      },
    );

    popover.showPopover();
    setIsOpen(true);

    requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (menu) {
        menuAnimationRef.current = menu.animate(
          [
            { opacity: 0, transform: 'scale(0.85) translateY(8px)' },
            { opacity: 1, transform: 'scale(1) translateY(0)' },
          ],
          {
            duration: 250,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards',
          },
        );
      }
    });
  };

  const hideMenu = () => {
    const popover = popoverRef.current;
    const icon = iconRef.current;
    const menu = menuRef.current;
    if (!popover) return;

    // 图标恢复动画
    if (icon) {
      iconAnimationRef.current?.cancel();
      iconAnimationRef.current = icon.animate(
        [
          { transform: 'scale(1.08) translateY(-4px)', filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))' },
          { transform: 'scale(1) translateY(0)', filter: 'drop-shadow(0 0 0 transparent)' },
        ],
        {
          duration: 150,
          easing: 'ease-out',
          fill: 'forwards',
        },
      );
    }

    // 菜单退出动画
    if (menu) {
      menuAnimationRef.current = menu.animate(
        [
          { opacity: 1, transform: 'scale(1) translateY(0)' },
          { opacity: 0, transform: 'scale(0.9) translateY(4px)' },
        ],
        {
          duration: 150,
          easing: 'ease-out',
          fill: 'forwards',
        },
      );
    }

    setTimeout(() => {
      popover.hidePopover();
      setIsOpen(false);
      popoverAnimationRef.current?.cancel();
      iconAnimationRef.current?.cancel();
      menuAnimationRef.current?.cancel();
      popoverAnimationRef.current = null;
      iconAnimationRef.current = null;
      menuAnimationRef.current = null;
    }, 150);
  };

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
    { icon: IconPlayerPlay, label: t('ecosystem.menu.open'), action: onOpen },
    { icon: IconInfoCircle, label: t('ecosystem.menu.detail'), action: onDetail },
    { icon: IconTrash, label: t('ecosystem.menu.remove'), action: onRemove, destructive: true },
  ];

  return (
    // 占位容器（在网格中保持位置）
    <div className={cn(styles.iconWrapper, 'flex flex-col items-center gap-1.5 p-2')}>
      {/* Popover（打开时提升到顶层） */}
      <div ref={popoverRef} popover="manual" className={styles.iconPopover}>
        {/* 点击拦截层（视觉效果由 ::backdrop 提供） */}
        {isOpen && (
          <div className={cn('fixed inset-0', styles.backdropClickArea)} style={{ zIndex: -1 }} onClick={hideMenu} />
        )}

        {/* 图标按钮（只包含图标，不包含 label；label 必须留在静态布局中） */}
        <button
          className={cn(
            styles.iconButton,
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
          <LayoutGroup inherit="id">
            <motion.div
              {...(sharedLayoutIds
                ? {
                  layoutId: sharedLayoutIds.container,
                  'data-layoutid': sharedLayoutIds.container,
                }
                : {})}
              transition={motionPresets.sharedLayout}
              variants={ICON_STACKING_VARIANTS}
              initial={false}
              animate={iconStackingVariant}
              className="relative"
              style={{
                width: 68,
                height: 68,
                borderRadius: 16,
              }}
            >
              <motion.div
                {...(sharedLayoutIds
                  ? {
                    layoutId: sharedLayoutIds.inner,
                    'data-layoutid': sharedLayoutIds.inner,
                  }
                  : {})}
                transition={motionPresets.sharedLayout}
                className="absolute inset-0 flex items-center justify-center"
              />
              <motion.div
                ref={iconRef}
                {...(sharedLayoutIds
                  ? {
                    layoutId: sharedLayoutIds.logo,
                    'data-layoutid': sharedLayoutIds.logo,
                  }
                  : {})}
                transition={motionPresets.sharedLayout}
                className="absolute inset-0 flex size-15 items-center justify-center"
              >
                <MiniappIcon src={app.icon} name={app.name} size="lg" shadow />
              </motion.div>

              <div className="absolute -top-1 -right-1">
                <motion.div
                  variants={CORNER_BADGE_VARIANTS}
                  initial={false}
                  animate={cornerBadgeVariant}
                  transition={motionPresets.uiFast}
                  style={{ transformOrigin: '100% 0%' }}
                >
                  <SourceIcon src={app.sourceIcon} name={app.sourceName} size="sm" />
                </motion.div>
              </div>
            </motion.div>
          </LayoutGroup>
        </button>

        {/* 菜单 */}
        {isOpen && (
          <div
            ref={menuRef}
            className={cn(styles.contextMenu, 'fixed w-56')}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            data-testid={`context-menu-${app.id}`}
          >
            <div className="bg-popover/95 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
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

      {/* label：永远处于静态布局（不进入 popover top-layer），避免启动动画把文字一起“拎走” */}
      <span className="text-foreground/90 line-clamp-2 max-w-[72px] text-center text-[11px] leading-tight font-medium">
        {app.name}
      </span>
    </div>
  );
}

// ============================================
// 空状态
// ============================================
function EmptyState() {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="bg-muted/50 mb-4 flex size-20 items-center justify-center rounded-full">
        <IconDownload className="text-muted-foreground size-10" stroke={1.5} />
      </div>
      <h2 className="mb-1 text-lg font-semibold">{t('ecosystem.noAppsUsed')}</h2>
      <p className="text-muted-foreground text-sm">{t('ecosystem.goToDiscover')}</p>
    </div>
  );
}

// ============================================
// MyAppsPage 组件
// ============================================
export interface MyAppsPageProps {
  apps: Array<{ app: MiniappManifest; lastUsed: number }>;
  /** 是否显示搜索框（默认 true，关闭发现页时应设为 false） */
  showSearch?: boolean;
  onSearchClick: () => void;
  onAppOpen: (app: MiniappManifest) => void;
  onAppDetail: (app: MiniappManifest) => void;
  onAppRemove: (appId: string) => void;
}

export function MyAppsPage({
  apps,
  showSearch = true,
  onSearchClick,
  onAppOpen,
  onAppDetail,
  onAppRemove,
}: MyAppsPageProps) {
  const columns = 4;
  const pageSize = columns * 6;
  const pages = Math.ceil(apps.length / pageSize);

  const mineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mineContainerRef.current;
    if (!el) return;
    registerDesktopContainerRef('mine', el);
    return () => unregisterDesktopContainerRef('mine');
  }, []);

  return (
    <div ref={mineContainerRef} className="my-apps-page h-full">
      <div className="relative z-10 h-full overflow-y-auto">
        {/* 顶部区域 - 搜索胶囊（仅在有发现页时显示） */}
        {showSearch ? (
          <div className="flex justify-center px-5 pt-14 pb-6">
            <IOSSearchCapsule onClick={onSearchClick} />
          </div>
        ) : (
          <div className="pt-14" />
        )}

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
