/**
 * Miniapp Runtime Service
 *
 * 微型操作系统内核，管理小程序的生命周期和动画
 *
 * 职责：
 * - 管理应用状态（启动、激活、后台、关闭）
 * - 管理 iframe 生命周期
 * - 计算 FLIP 动画帧
 * - 提供 DOM ref 管理
 */

import { Store } from '@tanstack/react-store'
export type {
  MiniappInstance,
  MiniappState,
  MiniappRuntimeState,
  MiniappRuntimeEvent,
  MiniappRuntimeListener,
  FlipFrames,
  AnimationConfig,
  CapsuleTheme,
  MiniappContext,
} from './types'
import type { MiniappContext } from './types'
import {
  createIframe,
  mountIframeVisible,
  moveIframeToBackground,
  moveIframeToForeground,
  removeIframe,
  enforceBackgroundLimit,
  cleanupAllIframes,
} from './iframe-manager'
import type { MiniappManifest } from '../ecosystem/types'
import { getIconRef } from './runtime-refs'
export {
  getDesktopContainerRef,
  getDesktopAppSlotRect,
  getDesktopAppSlotRef,
  getDesktopRect,
  getDesktopGridHostRef,
  getIconInnerRef,
  getIconRef,
  getSplashBgRef,
  getSplashIconRef,
  getStackRect,
  getWindowInnerRef,
  getWindowRef,
  getStackContainerRef,
  registerDesktopAppSlotRef,
  registerDesktopContainerRef,
  registerDesktopGridHostRef,
  registerIconInnerRef,
  registerIconRef,
  registerSplashBgRef,
  registerSplashIconRef,
  registerStackContainerRef,
  registerWindowInnerRef,
  registerWindowRef,
  unregisterDesktopAppSlotRef,
  unregisterIconRef,
  unregisterDesktopGridHostRef,
  unregisterDesktopContainerRef,
  unregisterStackContainerRef,
  unregisterSplashBgRef,
  unregisterSplashIconRef,
} from './runtime-refs'

// 动画实现已迁移到 motion/layoutId；旧版 FLIP/Popover 动画模块保留为备份文件（*.bak）

/** 初始状态 */
const initialState: MiniappRuntimeState = {
  apps: new Map(),
  activeAppId: null,
  isStackViewOpen: false,
  maxBackgroundApps: 4,
}

/** Store 实例 */
export const miniappRuntimeStore = new Store<MiniappRuntimeState>(initialState)

/** 事件监听器 */
const listeners = new Set<MiniappRuntimeListener>()

/**
 * 发送事件
 */
function emit(event: MiniappRuntimeEvent): void {
  listeners.forEach((listener) => listener(event))
}

/**
 * 更新应用状态
 */
function updateAppState(appId: string, state: MiniappState): void {
  miniappRuntimeStore.setState((s) => {
    const app = s.apps.get(appId)
    if (!app) return s

    const newApps = new Map(s.apps)
    newApps.set(appId, { ...app, state })

    return { ...s, apps: newApps }
  })

  emit({ type: 'app:state-change', appId, state })
}

// ============================================
// Public API
// ============================================

/** 动画时间配置 */
const ANIMATION_TIMING = {
  /** 无 splash 时，launching -> active 的延时 */
  launchToActive: 700,
  /** 有 splash 时，launching -> splash 的延时 */
  launchToSplash: 100,
  /** splash -> active 的延时 */
  splashToActive: 1400,
}

const launchTimeouts = new Map<string, ReturnType<typeof setTimeout>[]>()

function clearLaunchTimeouts(appId: string): void {
  const timeouts = launchTimeouts.get(appId)
  if (!timeouts) return
  timeouts.forEach((t) => clearTimeout(t))
  launchTimeouts.delete(appId)
}

/**
 * 立即结束启动阶段（用于用户跳过 splash）
 */
export function dismissSplash(appId: string): void {
  clearLaunchTimeouts(appId)
  activateApp(appId)
}

/**
 * 启动小程序
 */
export function launchApp(
  appId: string,
  manifest: MiniappManifest,
  contextParams?: Record<string, string>
): MiniappInstance {
  console.log('[miniapp] launchApp', { appId, url: manifest.url })

  const state = miniappRuntimeStore.state
  const existingApp = state.apps.get(appId)

  // 如果已存在，直接激活
  if (existingApp) {
    activateApp(appId)
    return existingApp
  }

  const hasSplash = !!manifest.splashScreen

  // 创建新实例
  const instance: MiniappInstance = {
    appId,
    manifest,
    state: 'launching',
    ctx: {
      capsuleTheme: manifest.capsuleTheme ?? 'auto',
    },
    launchedAt: Date.now(),
    lastActiveAt: Date.now(),
    iframeRef: null,
    iconRef: getIconRef(appId),
  }

  // 创建 iframe
  instance.iframeRef = createIframe(appId, manifest.url, contextParams)
  // 先挂到可见容器，确保 iframe 一定进入 DOM；MiniappWindow 会再把它移动到自己的容器
  mountIframeVisible(instance.iframeRef)

  // 更新状态
  const newApps = new Map(state.apps)
  newApps.set(appId, instance)

  miniappRuntimeStore.setState((s) => ({
    ...s,
    apps: newApps,
    activeAppId: appId,
  }))

  emit({ type: 'app:launch', appId, manifest })

  // 状态机：launching -> (splash ->) active
  if (hasSplash) {
    const splashTimeout = setTimeout(() => {
      updateAppState(appId, 'splash')
    }, ANIMATION_TIMING.launchToSplash)

    const activeTimeout = setTimeout(() => {
      activateApp(appId)
      clearLaunchTimeouts(appId)
    }, ANIMATION_TIMING.launchToSplash + ANIMATION_TIMING.splashToActive)

    launchTimeouts.set(appId, [splashTimeout, activeTimeout])
  } else {
    const activeTimeout = setTimeout(() => {
      activateApp(appId)
      clearLaunchTimeouts(appId)
    }, ANIMATION_TIMING.launchToActive)

    launchTimeouts.set(appId, [activeTimeout])
  }

  return instance
}

/**
 * 激活应用（从后台切换到前台）
 */
export function activateApp(appId: string): void {
  const state = miniappRuntimeStore.state
  const app = state.apps.get(appId)
  if (!app) return

  // 当前激活的应用切换到后台
  if (state.activeAppId && state.activeAppId !== appId) {
    deactivateApp(state.activeAppId)
  }

  // 如果 iframe 在后台，移到前台
  if (app.iframeRef && app.state === 'background') {
    moveIframeToForeground(app.iframeRef)
  }

  // 更新状态
  updateAppState(appId, 'active')

  miniappRuntimeStore.setState((s) => {
    const newApps = new Map(s.apps)
    const existingApp = newApps.get(appId)
    if (existingApp) {
      newApps.set(appId, { ...existingApp, lastActiveAt: Date.now() })
    }
    return { ...s, apps: newApps, activeAppId: appId }
  })

  emit({ type: 'app:activate', appId })
}

/**
 * 将应用切换到后台
 */
export function deactivateApp(appId: string): void {
  const state = miniappRuntimeStore.state
  const app = state.apps.get(appId)
  if (!app) return

  // 移动 iframe 到后台
  if (app.iframeRef) {
    moveIframeToBackground(app.iframeRef)
  }

  // 更新状态
  updateAppState(appId, 'background')

  // 检查后台数量限制
  enforceBackgroundLimit(
    miniappRuntimeStore.state.apps,
    miniappRuntimeStore.state.activeAppId,
    state.maxBackgroundApps
  )

  emit({ type: 'app:deactivate', appId })
}

/**
 * 关闭应用
 */
export function closeApp(appId: string): void {
  const state = miniappRuntimeStore.state
  const app = state.apps.get(appId)
  if (!app) return

  clearLaunchTimeouts(appId)

  // 更新状态为关闭中
  updateAppState(appId, 'closing')

  // 移除 iframe
  if (app.iframeRef) {
    removeIframe(app.iframeRef)
  }

  // 从状态中移除
  miniappRuntimeStore.setState((s) => {
    const newApps = new Map(s.apps)
    newApps.delete(appId)
    return {
      ...s,
      apps: newApps,
      activeAppId: s.activeAppId === appId ? null : s.activeAppId,
    }
  })

  emit({ type: 'app:close', appId })
}

/**
 * 更新应用运行时上下文
 * 用于动态修改 capsuleTheme 等配置
 */
export function updateAppContext(
  appId: string,
  update: Partial<MiniappContext>
): void {
  const state = miniappRuntimeStore.state
  const app = state.apps.get(appId)
  if (!app) return

  const newCtx = { ...app.ctx, ...update }

  miniappRuntimeStore.setState((s) => {
    const newApps = new Map(s.apps)
    const existingApp = newApps.get(appId)
    if (existingApp) {
      newApps.set(appId, { ...existingApp, ctx: newCtx })
    }
    return { ...s, apps: newApps }
  })

  emit({ type: 'app:ctx-change', appId, ctx: newCtx })
}

/**
 * 关闭所有应用
 */
export function closeAllApps(): void {
  const state = miniappRuntimeStore.state
  state.apps.forEach((_, appId) => closeApp(appId))
  cleanupAllIframes()
}

/**
 * 打开层叠视图
 */
export function openStackView(): void {
  miniappRuntimeStore.setState((s) => ({ ...s, isStackViewOpen: true }))
  emit({ type: 'stack-view:open' })
}

/**
 * 关闭层叠视图
 */
export function closeStackView(): void {
  miniappRuntimeStore.setState((s) => ({ ...s, isStackViewOpen: false }))
  emit({ type: 'stack-view:close' })
}

/**
 * 订阅事件
 */
export function subscribe(listener: MiniappRuntimeListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * 获取所有运行中的应用
 */
export function getRunningApps(): MiniappInstance[] {
  return Array.from(miniappRuntimeStore.state.apps.values())
}

/**
 * 获取当前激活的应用
 */
export function getActiveApp(): MiniappInstance | null {
  const state = miniappRuntimeStore.state
  if (!state.activeAppId) return null
  return state.apps.get(state.activeAppId) ?? null
}

/**
 * 检查是否有运行中的应用
 */
export function hasRunningApps(): boolean {
  return miniappRuntimeStore.state.apps.size > 0
}

// ============================================
// Selectors
// ============================================

export const miniappRuntimeSelectors = {
  getApps: (state: MiniappRuntimeState) => Array.from(state.apps.values()),
  getActiveApp: (state: MiniappRuntimeState) =>
    state.activeAppId ? state.apps.get(state.activeAppId) ?? null : null,
  hasRunningApps: (state: MiniappRuntimeState) => state.apps.size > 0,
  hasRunningStackApps: (state: MiniappRuntimeState) =>
    Array.from(state.apps.values()).some((app) => (app.manifest.targetDesktop ?? 'stack') === 'stack'),
  isStackViewOpen: (state: MiniappRuntimeState) => state.isStackViewOpen,
  getBackgroundApps: (state: MiniappRuntimeState) =>
    Array.from(state.apps.values()).filter((app) => app.state === 'background'),
  /** 是否显示启动 overlay（launching 或 splash 阶段） */
  isLaunchOverlayVisible: (state: MiniappRuntimeState) => {
    const app = state.activeAppId ? state.apps.get(state.activeAppId) : null
    return app?.state === 'launching' || app?.state === 'splash'
  },
  /** 是否显示 splash 屏幕 */
  isShowingSplash: (state: MiniappRuntimeState) => {
    const app = state.activeAppId ? state.apps.get(state.activeAppId) : null
    return app?.state === 'splash'
  },
  /** 是否正在动画中（非 active/background） */
  isAnimating: (state: MiniappRuntimeState) => {
    const app = state.activeAppId ? state.apps.get(state.activeAppId) : null
    return app?.state === 'launching' || app?.state === 'splash' || app?.state === 'closing'
  },
}
