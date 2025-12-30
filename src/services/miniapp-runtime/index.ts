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
} from './types'
import { DEFAULT_ANIMATION_CONFIG } from './types'
import {
  computeLaunchFrames,
  computeCloseFrames,
  playFlipAnimation,
  createSyncedAnimation,
} from './flip-animator'
import {
  createIframe,
  moveIframeToBackground,
  moveIframeToForeground,
  removeIframe,
  enforceBackgroundLimit,
  cleanupAllIframes,
} from './iframe-manager'
import type { MiniappManifest } from '../ecosystem/types'

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

/** 图标 ref 注册表 */
const iconRefs = new Map<string, HTMLElement>()

/** 窗口元素 ref */
let windowRef: HTMLElement | null = null

/** 动画配置 */
let animationConfig: AnimationConfig = DEFAULT_ANIMATION_CONFIG

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

/**
 * 注册图标元素引用
 */
export function registerIconRef(appId: string, element: HTMLElement): void {
  iconRefs.set(appId, element)
}

/**
 * 注销图标元素引用
 */
export function unregisterIconRef(appId: string): void {
  iconRefs.delete(appId)
}

/**
 * 获取图标元素引用
 */
export function getIconRef(appId: string): HTMLElement | null {
  return iconRefs.get(appId) ?? null
}

/**
 * 注册窗口元素引用
 */
export function registerWindowRef(element: HTMLElement): void {
  windowRef = element
}

/**
 * 获取窗口元素引用
 */
export function getWindowRef(): HTMLElement | null {
  return windowRef
}

/**
 * 设置动画配置
 */
export function setAnimationConfig(config: Partial<AnimationConfig>): void {
  animationConfig = { ...animationConfig, ...config }
}

/**
 * 启动小程序
 */
export function launchApp(
  appId: string,
  manifest: MiniappManifest,
  contextParams?: Record<string, string>
): MiniappInstance {
  const state = miniappRuntimeStore.state
  const existingApp = state.apps.get(appId)

  // 如果已存在，直接激活
  if (existingApp) {
    activateApp(appId)
    return existingApp
  }

  // 创建新实例
  const instance: MiniappInstance = {
    appId,
    manifest,
    state: 'launching',
    launchedAt: Date.now(),
    lastActiveAt: Date.now(),
    iframeRef: null,
    iconRef: iconRefs.get(appId) ?? null,
  }

  // 创建 iframe
  instance.iframeRef = createIframe(appId, manifest.url, contextParams)

  // 更新状态
  const newApps = new Map(state.apps)
  newApps.set(appId, instance)

  miniappRuntimeStore.setState((s) => ({
    ...s,
    apps: newApps,
    activeAppId: appId,
  }))

  emit({ type: 'app:launch', appId, manifest })

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
 * 关闭所有应用
 */
export function closeAllApps(): void {
  const state = miniappRuntimeStore.state
  state.apps.forEach((_, appId) => closeApp(appId))
  cleanupAllIframes()
}

/**
 * 获取图标位置（用于 FLIP 动画）
 */
export function getIconRect(appId: string): DOMRect | null {
  const iconRef = iconRefs.get(appId)
  return iconRef?.getBoundingClientRect() ?? null
}

/**
 * 获取窗口位置
 */
export function getWindowRect(): DOMRect | null {
  return windowRef?.getBoundingClientRect() ?? null
}

/**
 * 计算启动动画帧
 */
export function computeAppLaunchFrames(appId: string): FlipFrames | null {
  const iconRef = iconRefs.get(appId)
  if (!iconRef) return null

  return computeLaunchFrames(iconRef, animationConfig)
}

/**
 * 计算关闭动画帧
 */
export function computeAppCloseFrames(appId: string): FlipFrames | null {
  const iconRef = iconRefs.get(appId)
  if (!iconRef) return null

  return computeCloseFrames(iconRef, animationConfig)
}

/**
 * 播放启动动画
 */
export function playLaunchAnimation(
  appId: string,
  onFinish?: () => void
): Animation | null {
  if (!windowRef) return null

  const frames = computeAppLaunchFrames(appId)
  if (!frames) return null

  return playFlipAnimation(windowRef, frames, onFinish ? { onFinish } : undefined)
}

/**
 * 播放关闭动画
 */
export function playCloseAnimation(
  appId: string,
  onFinish?: () => void
): Animation | null {
  if (!windowRef) return null

  const frames = computeAppCloseFrames(appId)
  if (!frames) return null

  return playFlipAnimation(windowRef, frames, { reverse: true, ...(onFinish ? { onFinish } : {}) })
}

/**
 * 创建可手势控制的动画
 */
export function createGestureControlledAnimation(
  appId: string
): ReturnType<typeof createSyncedAnimation> | null {
  if (!windowRef) return null

  const frames = computeAppLaunchFrames(appId)
  if (!frames) return null

  return createSyncedAnimation(windowRef, frames)
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
  isStackViewOpen: (state: MiniappRuntimeState) => state.isStackViewOpen,
  getBackgroundApps: (state: MiniappRuntimeState) =>
    Array.from(state.apps.values()).filter((app) => app.state === 'background'),
}
