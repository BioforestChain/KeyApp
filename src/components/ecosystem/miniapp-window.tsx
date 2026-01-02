/**
 * MiniappWindow - 小程序窗口容器
 *
 * 作为 stack-slide 的子元素，用于显示小程序内容
 * 使用 portal 渲染到 slide 提供的 slot 容器中（尺寸由 desktop/slide 决定）
 * 无 Popover API 依赖
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import { motion, MotionConfig, LayoutGroup, AnimatePresence } from 'motion/react';
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  registerWindowRef,
  registerWindowInnerRef,
  getDesktopAppSlotRef,
  getDesktopContainerRef,
  closeApp,
  dismissSplash,
} from '@/services/miniapp-runtime';
import { MiniappSplashScreen } from './miniapp-splash-screen';
import { MiniappCapsule } from './miniapp-capsule';
import { MiniappIcon } from './miniapp-icon';
import styles from './miniapp-window.module.css';

export interface MiniappWindowProps {
  className?: string;
}

export function MiniappWindow({ className }: MiniappWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  // 获取当前激活的应用
  const activeApp = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getActiveApp);
  const hasRunningApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningApps);
  const showLaunchOverlay = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isLaunchOverlayVisible);
  const showSplash = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isShowingSplash);
  const isAnimating = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isAnimating);

  const targetDesktop = activeApp?.manifest.targetDesktop ?? 'stack';

  // MiniappWindow 必须渲染在 stack-slide 容器内（static 模式下参与布局）
  useEffect(() => {
    if (!hasRunningApps || !activeApp) {
      setPortalHost(null);
      return;
    }

    setPortalHost(null);

    let rafId: number | null = null;
    let lastHost: HTMLElement | null = null;
    const loop = () => {
      const slot = getDesktopAppSlotRef(targetDesktop, activeApp.appId);
      if (slot) {
        if (lastHost !== slot) setPortalHost(slot);
        return;
      }

      const fallback = getDesktopContainerRef(targetDesktop);
      if (fallback && lastHost !== fallback) {
        lastHost = fallback;
        setPortalHost(fallback);
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [hasRunningApps, targetDesktop, activeApp?.appId]);

  // 注册 window refs（需要等待 portalHost 就绪后 node 才会挂载到 stack 容器中）
  useEffect(() => {
    if (!portalHost) return;
    if (windowRef.current) registerWindowRef(windowRef.current);
    if (iframeContainerRef.current) registerWindowInnerRef(iframeContainerRef.current);
  }, [portalHost]);

  // 挂载 iframe 到容器
  useEffect(() => {
    const iframe = activeApp?.iframeRef;
    const container = iframeContainerRef.current;

    // 需要两者都 ready 才能挂载
    if (!iframe || !container) return;

    // 如果 iframe 不在容器中，移动过来
    if (iframe.parentElement !== container) {
      container.appendChild(iframe);
    }

    // 兜底：确保 iframe 可见（可能被 runtime 挂到 global 容器）
    if (iframe.style.display === 'none') {
      iframe.style.display = '';
    }

    return () => {
      // 组件卸载时不移除 iframe，由 runtime service 管理
    };
  }, [activeApp?.iframeRef, activeApp?.appId, portalHost]);

  // 处理关闭：关闭 app 由 runtime 状态机接管
  const handleClose = useCallback(() => {
    if (!activeApp) return;
    closeApp(activeApp.appId);
  }, [activeApp]);

  const handleSplashClose = useCallback(() => {
    if (!activeApp) return;
    dismissSplash(activeApp.appId);
  }, [activeApp]);

  const renderLaunchOverlay = () => {
    if (!activeApp) return null;
    if (!showLaunchOverlay) return null;
    const appId = activeApp.appId;
    const containerLayoutId = `miniapp:${appId}:container`;
    const innerLayoutId = `miniapp:${appId}:inner`;

    // shared-element 关系（来自 CHAT.md 的语义）：
    // - icon->window-with-splash: icon-container <-> window-container；icon-inner <-> splash.icon
    // - icon->window: icon-container <-> window-container；icon-inner 跟随（不额外共享到 splash）
    const windowSharedLayoutId = containerLayoutId;

    return (
      <MotionConfig transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.85, duration: 10_000 }}>
        <LayoutGroup inherit="id">
          <div className="pointer-events-none absolute inset-0 z-[999]" aria-label="miniapp-launch-overlay">
            <AnimatePresence mode="popLayout">
              {showLaunchOverlay && (
                <motion.div
                  key="window"
                  layoutId={windowSharedLayoutId}
                  data-layoutid={windowSharedLayoutId}
                  className="bg-background absolute overflow-hidden shadow-2xl"
                  style={{
                    inset: 0,
                    borderRadius: 40,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* window-inner: 没有 splash 时，用 icon 占位（避免与 splash.icon 重复 layoutId） */}
                  {!showSplash && (
                    <div className="absolute inset-0">
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <motion.div
                          layoutId={innerLayoutId}
                          data-layoutid={innerLayoutId}
                          className="flex items-center justify-center"
                        >
                          <MiniappIcon src={activeApp.manifest.icon} name={activeApp.manifest.name} size="2xl" />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* splash: 让 MiniappSplashScreen 持有 icon 的 layoutId，避免只能淡出 */}
                  {showSplash && (
                    <MiniappSplashScreen
                      appId={activeApp.appId}
                      app={{
                        name: activeApp.manifest.name,
                        icon: activeApp.manifest.icon,
                        themeColor: activeApp.manifest.themeColorFrom ?? 280,
                      }}
                      visible={showSplash}
                      iconLayoutId={innerLayoutId}
                      onClose={handleSplashClose}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </MotionConfig>
    );
  };

  const node = (
    <div
      ref={windowRef}
      className={cn(styles.window, showSplash && styles.withSplash, isAnimating && styles.animating, className)}
      data-testid="miniapp-window"
      data-app-id={activeApp?.appId}
    >
      <div className={styles.windowInner}>
        {renderLaunchOverlay()}

        {/* 启动屏幕 */}
        {activeApp && showSplash && !showLaunchOverlay && (
          <MiniappSplashScreen
            appId={activeApp.appId}
            app={{
              name: activeApp.manifest.name,
              icon: activeApp.manifest.icon,
              themeColor: activeApp.manifest.themeColorFrom ?? 280,
            }}
            visible={showSplash}
          iconLayoutId={`miniapp:${activeApp.appId}:inner`}
            onClose={handleSplashClose}
          />
        )}

        {/* iframe 容器 */}
        <div
          ref={iframeContainerRef}
          className={styles.iframeContainer}
          style={{ opacity: showLaunchOverlay ? 0 : 1 }}
        />

        {/* 胶囊容器层 - 作为 window 态唯一 UI（共享元素目标） */}
        <div className={styles.capsuleLayer} style={{ zIndex: 1000 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showLaunchOverlay ? 0 : 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <MiniappCapsule
              visible={!showLaunchOverlay}
              onAction={() => {
                // TODO: 显示更多操作菜单
              }}
              onClose={handleClose}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );

  // 如果没有运行中的应用，不渲染
  if (!hasRunningApps || !portalHost) {
    return null;
  }

  return createPortal(node, portalHost);
}

export default MiniappWindow;
