/**
 * MiniappWindow - 小程序窗口容器
 *
 * 作为 stack-slide 的子元素，用于显示小程序内容
 * 使用 portal 渲染到 slide 提供的 slot 容器中（尺寸由 desktop/slide 决定）
 * 无 Popover API 依赖
 *
 * Safari 优化：支持配置化降级，禁用 sharedLayout 动画
 */

import { useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { isAnimationEnabled } from '@biochain/ecosystem-native';
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  type MiniappInstance,
  type MiniappPresentation,
  registerWindowRef,
  registerWindowInnerRef,
  getDesktopAppSlotRef,
  requestDismiss,
  requestDismissSplash,
  didDismiss,
  didPresent,
  settleFlow,
  useSlotStatus,
} from '@/services/miniapp-runtime';
import { getMiniappMotionPresets, type MiniappMotionPresets } from '@/services/miniapp-runtime/visual-config';
import { MiniappSplashScreen } from './miniapp-splash-screen';
import { MiniappCapsule } from './miniapp-capsule';
import { MiniappCapsuleInfoSheet } from './miniapp-capsule-info-sheet';
import { MiniappIcon } from './miniapp-icon';
import {
  flowToCapsule,
  flowToSplashBgLayer,
  flowToSplashIconLayer,
  flowToIframeLayer,
  flowToSplashIconLayoutId,
  flowToWindowContainer,
  type MiniappFlow,
} from './miniapp-motion-flow';
import styles from './miniapp-window.module.css';

export interface MiniappWindowProps {
  className?: string;
}

const WINDOW_CONTAINER_VARIANTS = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
} as const;

const VISIBILITY_VARIANTS = {
  show: { opacity: 1 },
  hide: { opacity: 0 },
} as const;

/**
 * 层级变体：z-index 和 opacity 联动
 * top: 上层可见，bottom: 下层隐藏
 */
const LAYER_VARIANTS = {
  top: { zIndex: 10, opacity: 1, pointerEvents: 'auto' },
  bottom: { zIndex: 0, opacity: 0, pointerEvents: 'none' },
};

type WindowDomBindingState = {
  visible: boolean;
  interactive: boolean;
};

function domBindDeriveWindowState(
  appState: MiniappInstance['state'] | undefined,
  isFocused: boolean,
  isSlotLost: boolean,
): WindowDomBindingState {
  const visible = !isSlotLost && appState !== 'background' && appState !== 'preparing';
  const interactive = appState === 'active' && isFocused && !isSlotLost;
  return { visible, interactive };
}

export function MiniappWindow({ className }: MiniappWindowProps) {
  const presentations = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getPresentations);
  const focusedAppId = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getFocusedAppId);
  const visualConfig = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getVisualConfig);
  const motionPresets = getMiniappMotionPresets(visualConfig);

  if (presentations.length === 0) return null;

  return (
    <>
      {presentations
        .filter((p) => p.state !== 'hidden')
        .map((p) => (
          <MiniappWindowPortal
            key={p.appId}
            appId={p.appId}
            presentation={p}
            motionPresets={motionPresets}
            className={className}
            isFocused={p.appId === focusedAppId}
          />
        ))}
    </>
  );
}

function MiniappWindowPortal({
  appId,
  presentation,
  motionPresets,
  className,
  isFocused,
}: {
  appId: string;
  presentation: MiniappPresentation;
  motionPresets: MiniappMotionPresets;
  className?: string;
  isFocused: boolean;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [presentApp, setPresentApp] = useState<MiniappInstance | null>(null);
  const [isCapsuleInfoOpen, setIsCapsuleInfoOpen] = useState(false);
  const exitScheduledRef = useRef(false);
  const exitingTransitionIdRef = useRef<string | null>(null);

  const app = useStore(miniappRuntimeStore, (s) => s.apps.get(appId) ?? null);
  const isAnimating = useStore(miniappRuntimeStore, (s) => {
    const a = s.apps.get(appId);
    return a?.state === 'launching' || a?.state === 'splash' || a?.state === 'closing';
  });

  // 订阅 slot 状态，响应式感知 slot 注册/注销
  const slotStatus = useSlotStatus(presentation.desktop, appId);
  const portalHost = getDesktopAppSlotRef(presentation.desktop, appId);
  const actualHost = portalHost;
  const isSlotLost = slotStatus === 'lost' || !portalHost;

  useLayoutEffect(() => {
    if (!app) {
      setPresentApp(null);
      exitScheduledRef.current = false;
      return;
    }

    if (app.state === 'preparing') {
      setPresentApp(null);
      exitScheduledRef.current = false;
      return;
    }

    if (presentation.state === 'dismissing' || app.state === 'closing') {
      if (exitScheduledRef.current) return;

      // 先渲染一帧 closing visuals，再触发 exit（layoutId -> icon）
      setPresentApp(app);
      exitingTransitionIdRef.current = presentation.transitionId;
      exitScheduledRef.current = true;
      requestAnimationFrame(() => setPresentApp(null));
      return;
    }

    exitScheduledRef.current = false;
    setPresentApp(app);
  }, [app?.appId, app?.state, presentation.state, presentation.transitionId]);

  useEffect(() => {
    if (!presentApp) return;
    if (presentation.state !== 'presenting') return;
    if (presentation.transitionKind !== 'present') return;
    if (!presentation.transitionId) return;
    didPresent(appId, presentation.transitionId);
  }, [appId, presentApp, presentation.state, presentation.transitionKind, presentation.transitionId]);

  useEffect(() => {
    setIsCapsuleInfoOpen(false);
  }, [appId]);

  const lastFlowRef = useRef<string>('closed');
  if (presentApp?.flow) {
    lastFlowRef.current = presentApp.flow;
  }
  const flow = presentApp ? presentApp.flow : lastFlowRef.current;

  const handleLayoutAnimationComplete = useCallback(() => {
    if (presentApp?.appId) {
      settleFlow(presentApp.appId);
    }
  }, [presentApp?.appId]);

  const windowContainerVariant = flowToWindowContainer[flow as MiniappFlow];
  const splashBgLayerVariant = flowToSplashBgLayer[flow as MiniappFlow];
  const splashIconLayerVariant = flowToSplashIconLayer[flow as MiniappFlow];
  const iframeLayerVariant = flowToIframeLayer[flow as MiniappFlow];
  const splashIconHasLayoutId = flowToSplashIconLayoutId[flow as MiniappFlow];
  const capsuleVariant = flowToCapsule[flow as MiniappFlow];
  const isTransitioning = flow === 'opening' || flow === 'closing';
  const windowDomState = domBindDeriveWindowState(presentApp?.state, isFocused, isSlotLost);

  const appDisplay = useMemo(() => {
    return {
      appId: presentApp?.appId ?? '',
      name: presentApp?.manifest.name ?? '',
      icon: presentApp?.manifest.icon ?? '',
      themeColor: presentApp?.manifest.themeColorFrom ?? 280,
    };
  }, [presentApp?.appId, presentApp?.manifest.name, presentApp?.manifest.icon, presentApp?.manifest.themeColorFrom]);
  const currentUrl = presentApp?.containerHandle?.getIframe()?.src ?? presentApp?.manifest.url ?? '';

  useEffect(() => {
    if (!portalHost) return;
    if (windowRef.current) registerWindowRef(windowRef.current);
    if (iframeContainerRef.current) registerWindowInnerRef(iframeContainerRef.current);
  }, [portalHost]);

  useEffect(() => {
    const containerHandle = presentApp?.containerHandle;
    const container = iframeContainerRef.current;
    if (!containerHandle || !container) return;

    const element = containerHandle.element;
    if (element.parentElement !== container) {
      container.appendChild(element);
    }

    containerHandle.setMountTarget?.(container);

    if (element.style.display === 'none') {
      element.style.display = '';
    }
  }, [presentApp?.containerHandle, presentApp?.appId, presentApp?.state, portalHost]);

  const handleClose = useCallback(() => {
    requestDismiss(appId);
  }, [appId]);

  const handleSplashClose = useCallback(() => {
    requestDismissSplash(appId);
  }, [appId]);

  // 当 slot lost 时禁用 layoutId，防止动画到错误位置
  // Safari 优化：当 sharedLayout 被禁用时也禁用 layoutId
  const enableLayoutId = !isSlotLost && isAnimationEnabled('sharedLayout');

  if (!actualHost) {
    return null;
  }

  const node = (
    <AnimatePresence
      initial={false}
      onExitComplete={() => {
        const exitingTransitionId = exitingTransitionIdRef.current;
        if (exitingTransitionId) {
          didDismiss(appId, exitingTransitionId);
        }
        exitingTransitionIdRef.current = null;
        lastFlowRef.current = 'closed';
      }}
    >
      {presentApp && (
        <div
          ref={windowRef}
          className={cn(styles.window, isAnimating && styles.animating, className)}
          style={{
            zIndex: presentation.zOrder,
            display: windowDomState.visible ? undefined : 'none',
            pointerEvents: windowDomState.interactive ? 'auto' : 'none',
          }}
          inert={!windowDomState.interactive || undefined}
          data-testid="miniapp-window"
          data-app-id={presentApp.appId}
          data-slot-lost={isSlotLost ? 'true' : undefined}
        >
          <motion.div
            className={styles.windowInner}
            variants={WINDOW_CONTAINER_VARIANTS}
            initial={false}
            animate={windowContainerVariant}
            onLayoutAnimationComplete={handleLayoutAnimationComplete}
            {...(enableLayoutId && appDisplay.appId
              ? {
                  layoutId: `miniapp:${appDisplay.appId}:container`,
                  'data-layoutid': `miniapp:${appDisplay.appId}:container`,
                }
              : {})}
            transition={motionPresets.sharedLayout}
            data-flow={flow}
          >
            <motion.div
              className={cn(styles.contentLayer, isTransitioning && styles.blending)}
              {...(enableLayoutId && appDisplay.appId
                ? {
                    layoutId: `miniapp:${appDisplay.appId}:inner`,
                    'data-layoutid': `miniapp:${appDisplay.appId}:inner`,
                  }
                : {})}
              transition={motionPresets.sharedLayout}
            >
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

              <motion.div
                ref={iframeContainerRef}
                className={styles.iframeLayer}
                variants={LAYER_VARIANTS}
                initial={false}
                animate={iframeLayerVariant}
                data-animate={iframeLayerVariant}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={LAYER_VARIANTS}
              initial={false}
              animate={splashIconLayerVariant}
              aria-hidden={splashIconLayerVariant !== 'top'}
            >
              <motion.div
                className="size-30 items-center justify-center"
                {...(enableLayoutId && splashIconHasLayoutId && appDisplay.appId
                  ? {
                      layoutId: `miniapp:${appDisplay.appId}:logo`,
                      'data-layoutid': `miniapp:${appDisplay.appId}:logo`,
                    }
                  : {})}
                transition={motionPresets.sharedLayout}
              >
                <MiniappIcon src={appDisplay.icon} name={appDisplay.name} size="2xl" />
              </motion.div>
            </motion.div>

            <div className={styles.capsuleLayer}>
              <motion.div variants={VISIBILITY_VARIANTS} initial={false} animate={capsuleVariant}>
                <MiniappCapsule
                  visible={true}
                  theme={presentApp?.ctx.capsuleTheme ?? 'auto'}
                  onAction={() => {
                    setIsCapsuleInfoOpen(true);
                  }}
                  onClose={handleClose}
                />
              </motion.div>
            </div>

            <MiniappCapsuleInfoSheet
              open={isCapsuleInfoOpen}
              onOpenChange={setIsCapsuleInfoOpen}
              appName={appDisplay.name || appId}
              appId={appId}
              version={presentApp?.manifest.version ?? '0.0.0'}
              author={presentApp?.manifest.author}
              sourceName={presentApp?.manifest.sourceName}
              runtime={presentApp?.containerType ?? presentApp?.manifest.runtime ?? 'iframe'}
              entryUrl={presentApp?.manifest.url ?? ''}
              currentUrl={currentUrl}
              sourceUrl={presentApp?.manifest.sourceUrl}
              strictUrl={presentApp?.manifest.strictUrl ?? false}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, actualHost);
}

export default MiniappWindow;
