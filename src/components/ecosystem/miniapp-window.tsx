/**
 * MiniappWindow - 小程序窗口容器
 *
 * 作为 stack-slide 的子元素，用于显示小程序内容
 * 使用 portal 渲染到 slide 提供的 slot 容器中（尺寸由 desktop/slide 决定）
 * 无 Popover API 依赖
 */

import { useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  type MiniappInstance,
  registerWindowRef,
  registerWindowInnerRef,
  getDesktopAppSlotRef,
  closeApp,
  dismissSplash,
  finalizeCloseApp,
  settleFlow,
} from '@/services/miniapp-runtime';
import { MiniappSplashScreen } from './miniapp-splash-screen';
import { MiniappCapsule } from './miniapp-capsule';
import { MiniappIcon } from './miniapp-icon';
import {
  flowToCapsule,
  flowToSplashBgLayer,
  flowToSplashIconLayer,
  flowToIframeLayer,
  flowToSplashIconLayoutId,
  flowToWindowContainer,
} from './miniapp-motion-flow';
import styles from './miniapp-window.module.css';

export interface MiniappWindowProps {
  className?: string;
}

const WINDOW_CONTAINER_VARIANTS = {
  open: { opacity: 1, pointerEvents: 'auto' },
  closed: { opacity: 0, pointerEvents: 'none' },
} as const;

const VISIBILITY_VARIANTS = {
  show: { opacity: 1, pointerEvents: 'auto' },
  hide: { opacity: 0, pointerEvents: 'none' },
} as const;

/**
 * 层级变体：z-index 和 opacity 联动
 * top: 上层可见，bottom: 下层隐藏，gone: display:none
 */
const LAYER_VARIANTS = {
  top: { zIndex: 10, opacity: 1 },
  bottom: { zIndex: 0, opacity: 0, pointerEvents: 'none' },
  gone: { zIndex: 0, opacity: 0, display: 'none', pointerEvents: 'none' },
};

export function MiniappWindow({ className }: MiniappWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [presentApp, setPresentApp] = useState<MiniappInstance | null>(null);
  const exitScheduledRef = useRef(false);
  const exitingAppIdRef = useRef<string | null>(null);

  // 获取当前激活的应用
  const activeApp = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getActiveApp);
  const hasRunningApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningApps);
  const isAnimating = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isAnimating);

  useLayoutEffect(() => {
    if (!activeApp) {
      setPresentApp(null);
      exitScheduledRef.current = false;
      return;
    }

    if (activeApp.state === 'preparing') {
      setPresentApp(null);
      exitScheduledRef.current = false;
      return;
    }

    if (activeApp.state === 'closing') {
      if (exitScheduledRef.current) return;

      // 先渲染一帧 closing visuals，再触发 exit（layoutId -> icon）
      setPresentApp(activeApp);
      exitingAppIdRef.current = activeApp.appId;
      exitScheduledRef.current = true;
      requestAnimationFrame(() => setPresentApp(null));
      return;
    }

    exitScheduledRef.current = false;
    setPresentApp(activeApp);
  }, [activeApp?.appId, activeApp?.state]);

  // 直接从 runtime 获取 flow（同步，无延迟）
  // 使用 ref 保留 closing 时的 flow，直到 exit 动画完成
  const lastFlowRef = useRef<string>('closed');
  if (presentApp?.flow) {
    lastFlowRef.current = presentApp.flow;
  }
  const flow = presentApp ? presentApp.flow : lastFlowRef.current;

  // DEBUG: 追踪关闭时的 flow 变化
  console.log(`[Window:render] presentApp=${presentApp?.appId ?? 'null'}, presentApp.flow=${presentApp?.flow ?? 'null'}, lastFlowRef=${lastFlowRef.current}, flow=${flow}`);

  // 当动画完成后，将方向性 flow 转为稳定态
  const handleLayoutAnimationComplete = useCallback(() => {
    if (presentApp?.appId) {
      settleFlow(presentApp.appId);
    }
  }, [presentApp?.appId]);

  const windowContainerVariant = flowToWindowContainer[flow];
  const splashBgLayerVariant = flowToSplashBgLayer[flow];
  const splashIconLayerVariant = flowToSplashIconLayer[flow];
  const iframeLayerVariant = flowToIframeLayer[flow];
  const splashIconHasLayoutId = flowToSplashIconLayoutId[flow];
  const capsuleVariant = flowToCapsule[flow];

  // 只在动画过程中启用混合模式（opening/closing）
  const isTransitioning = flow === 'opening' || flow === 'closing';

  const appDisplay = useMemo(() => {
    return {
      appId: presentApp?.appId ?? '',
      name: presentApp?.manifest.name ?? '',
      icon: presentApp?.manifest.icon ?? '',
      themeColor: presentApp?.manifest.themeColorFrom ?? 280,
    };
  }, [presentApp?.appId, presentApp?.manifest.name, presentApp?.manifest.icon, presentApp?.manifest.themeColorFrom]);

  const targetDesktop = activeApp?.manifest.targetDesktop ?? 'stack';

  const portalHost = activeApp ? getDesktopAppSlotRef(targetDesktop, activeApp.appId) : null;

  // DEBUG: 追踪 window 的 layoutId 挂载时机
  useEffect(() => {
    console.log(
      `[Window] presentApp=${presentApp?.appId ?? 'null'}, state=${presentApp?.state ?? 'null'}, flow=${flow}, hasPortalHost=${!!portalHost}`,
    );
  }, [presentApp?.appId, presentApp?.state, flow, portalHost]);

  // 注册 window refs
  useEffect(() => {
    if (!portalHost) return;
    if (windowRef.current) registerWindowRef(windowRef.current);
    if (iframeContainerRef.current) registerWindowInnerRef(iframeContainerRef.current);
  }, [portalHost]);

  // 挂载 iframe 到容器
  useEffect(() => {
    const iframe = presentApp?.iframeRef;
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
  }, [presentApp?.iframeRef, presentApp?.appId, portalHost]);

  // 处理关闭：关闭 app 由 runtime 状态机接管
  const handleClose = useCallback(() => {
    if (!activeApp) return;
    closeApp(activeApp.appId);
  }, [activeApp]);

  const handleSplashClose = useCallback(() => {
    if (!activeApp) return;
    dismissSplash(activeApp.appId);
  }, [activeApp]);

  const node = (
    <AnimatePresence
      initial={false}
      onExitComplete={() => {
        const exitingAppId = exitingAppIdRef.current;
        if (exitingAppId) finalizeCloseApp(exitingAppId);
        exitingAppIdRef.current = null;
        // 重置 flow，准备下次启动
        lastFlowRef.current = 'closed';
      }}
    >
      {presentApp && (
        <div
          ref={windowRef}
          className={cn(styles.window, isAnimating && styles.animating, className)}
          data-testid="miniapp-window"
          data-app-id={presentApp.appId}
        >
          <motion.div
            className={styles.windowInner}
            variants={WINDOW_CONTAINER_VARIANTS}
            initial={false}
            animate={windowContainerVariant}
            onLayoutAnimationComplete={handleLayoutAnimationComplete}
            {...(appDisplay.appId
              ? {
                  layoutId: `miniapp:${appDisplay.appId}:container`,
                  'data-layoutid': `miniapp:${appDisplay.appId}:container`,
                }
              : {})}
            data-flow={flow}
          >
            {/* 内容层容器：隔离混合模式 */}
            <motion.div
              className={cn(styles.contentLayer, isTransitioning && styles.blending)}
              {...(appDisplay.appId
                ? {
                    layoutId: `miniapp:${appDisplay.appId}:inner`,
                    'data-layoutid': `miniapp:${appDisplay.appId}:inner`,
                  }
                : {})}
            >
              {/* splash-bg 层 */}
              <motion.div
                className={styles.splashBgLayer}
                variants={LAYER_VARIANTS}
                initial={false}
                animate={splashBgLayerVariant}
                data-animate={splashBgLayerVariant}
              >
                <MiniappSplashScreen
                  appId={appDisplay.appId}
                  app={{
                    name: appDisplay.name,
                    icon: appDisplay.icon,
                    themeColor: appDisplay.themeColor,
                  }}
                  visible={true}
                  showIcon={false}
                  showSpinner={false}
                  onClose={handleSplashClose}
                />
              </motion.div>

              {/* iframe 层 */}
              <motion.div
                ref={iframeContainerRef}
                className={styles.iframeLayer}
                variants={LAYER_VARIANTS}
                initial={false}
                animate={iframeLayerVariant}
                data-animate={iframeLayerVariant}
              />
            </motion.div>

            {/* splash-icon 层（独立于内容层，做 shared layout 动画） */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={LAYER_VARIANTS}
              initial={false}
              animate={splashIconLayerVariant}
              aria-hidden={splashIconLayerVariant !== 'top'}
            >
              <motion.div
                className="size-30 items-center justify-center"
                {...(appDisplay.appId
                  ? {
                      layoutId: `miniapp:${appDisplay.appId}:logo`,
                      'data-layoutid': `miniapp:${appDisplay.appId}:logo`,
                    }
                  : {})}
              >
                <MiniappIcon src={appDisplay.icon} name={appDisplay.name} size="2xl" />
              </motion.div>
            </motion.div>

            {/* capsule */}
            <div className={styles.capsuleLayer}>
              <motion.div variants={VISIBILITY_VARIANTS} initial={false} animate={capsuleVariant}>
                <MiniappCapsule
                  visible={true}
                  onAction={() => {
                    // TODO: 显示更多操作菜单
                  }}
                  onClose={handleClose}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!hasRunningApps || !portalHost) return null;

  return createPortal(node, portalHost);
}

export default MiniappWindow;
