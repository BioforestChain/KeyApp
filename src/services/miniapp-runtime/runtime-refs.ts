/**
 * Miniapp Runtime Refs
 *
 * 统一管理运行时所需的 DOM 引用（icon/window/stack/splash）。
 *
 * 设计原则：
 * - SRP：这里只做 ref 的注册/查询/注销
 * - KISS：不耦合动画实现细节
 */

import type { MiniappTargetDesktop } from '../ecosystem/types'
import type { SlotStatus } from './types'

// ============================================
// Slot 状态管理
// ============================================

/** Slot 状态 Map（key: `${desktop}:${appId}`） */
const slotStatusMap = new Map<string, SlotStatus>()

/** Slot 状态变化监听器 */
const slotStatusListeners = new Set<() => void>()

/**
 * 获取 slot 状态
 */
export function getSlotStatus(desktop: MiniappTargetDesktop, appId: string): SlotStatus | null {
  const key = `${desktop}:${appId}`
  return slotStatusMap.get(key) ?? null
}

/**
 * 订阅 slot 状态变化
 * @returns 取消订阅函数
 */
export function subscribeSlotStatus(listener: () => void): () => void {
  slotStatusListeners.add(listener)
  return () => slotStatusListeners.delete(listener)
}

/** 通知所有监听器 */
function notifySlotStatusChange(): void {
  slotStatusListeners.forEach((listener) => listener())
}

/** 图标 container ref（popover-container） */
const iconRefs = new Map<string, HTMLElement>()

/** 图标 inner ref（popover-inner，用于 cover 缩放与淡入淡出） */
const iconInnerRefs = new Map<string, HTMLElement>()

/** Splash 背景 ref（用于启动屏动画） */
const splashBgRefs = new Map<string, HTMLElement>()

/** Splash 图标 ref（用于启动屏动画） */
const splashIconRefs = new Map<string, HTMLElement>()

/** window container ref（Popover） */
let windowRef: HTMLElement | null = null

/** window inner ref（用于 cover 缩放） */
let windowInnerRef: HTMLElement | null = null

/** Desktop slide 容器 refs（window 的最终目标区域） */
const desktopContainerRefs = new Map<MiniappTargetDesktop, HTMLElement>()

/** Desktop overlay grid host refs（MiniappWindowStack） */
const desktopGridHostRefs = new Map<MiniappTargetDesktop, HTMLElement>()

/** Desktop per-app slot refs（grid-area = appId） */
const desktopAppSlotRefs = new Map<MiniappTargetDesktop, Map<string, HTMLElement>>()

// ============================================
// Icon
// ============================================

/** 注册图标容器元素引用（popover-container） */
export function registerIconRef(appId: string, element: HTMLElement): void {
  iconRefs.set(appId, element)
}

/** 注册图标内容元素引用（popover-inner） */
export function registerIconInnerRef(appId: string, element: HTMLElement): void {
  iconInnerRefs.set(appId, element)
}

/** 注销图标元素引用（container/inner） */
export function unregisterIconRef(appId: string): void {
  iconRefs.delete(appId)
  iconInnerRefs.delete(appId)
}

/** 获取图标 container 元素引用 */
export function getIconRef(appId: string): HTMLElement | null {
  return iconRefs.get(appId) ?? null
}

/** 获取图标 inner 元素引用 */
export function getIconInnerRef(appId: string): HTMLElement | null {
  return iconInnerRefs.get(appId) ?? null
}

// ============================================
// Splash
// ============================================

/** 注册 Splash 背景元素引用 */
export function registerSplashBgRef(appId: string, element: HTMLElement): void {
  splashBgRefs.set(appId, element)
}

/** 注销 Splash 背景元素引用 */
export function unregisterSplashBgRef(appId: string): void {
  splashBgRefs.delete(appId)
}

/** 获取 Splash 背景元素引用 */
export function getSplashBgRef(appId: string): HTMLElement | null {
  return splashBgRefs.get(appId) ?? null
}

/** 注册 Splash 图标元素引用 */
export function registerSplashIconRef(appId: string, element: HTMLElement): void {
  splashIconRefs.set(appId, element)
}

/** 注销 Splash 图标元素引用 */
export function unregisterSplashIconRef(appId: string): void {
  splashIconRefs.delete(appId)
}

/** 获取 Splash 图标元素引用 */
export function getSplashIconRef(appId: string): HTMLElement | null {
  return splashIconRefs.get(appId) ?? null
}

// ============================================
// Window
// ============================================

/** 注册 window container 元素引用 */
export function registerWindowRef(element: HTMLElement): void {
  windowRef = element
}

/** 获取 window container 元素引用 */
export function getWindowRef(): HTMLElement | null {
  return windowRef
}

/** 注册 window inner 元素引用 */
export function registerWindowInnerRef(element: HTMLElement): void {
  windowInnerRef = element
}

/** 获取 window inner 元素引用 */
export function getWindowInnerRef(): HTMLElement | null {
  return windowInnerRef
}

// ============================================
// Desktop Containers
// ============================================

/** 注册 Desktop Slide 容器引用（window 最终目标区域） */
export function registerDesktopContainerRef(targetDesktop: MiniappTargetDesktop, element: HTMLElement): void {
  desktopContainerRefs.set(targetDesktop, element)
}

/** 注销 Desktop Slide 容器引用 */
export function unregisterDesktopContainerRef(targetDesktop: MiniappTargetDesktop): void {
  desktopContainerRefs.delete(targetDesktop)
}

/** 获取 Desktop Slide 容器引用 */
export function getDesktopContainerRef(targetDesktop: MiniappTargetDesktop): HTMLElement | null {
  return desktopContainerRefs.get(targetDesktop) ?? null
}

/**
 * 获取 Desktop Slide 容器的 bounding rect
 *
 * 注意：只有当对应 slide 为 active 时，这个 rect 才是最终目标位置
 */
export function getDesktopRect(targetDesktop: MiniappTargetDesktop): DOMRect | null {
  const containerRef = getDesktopContainerRef(targetDesktop)
  if (!containerRef) return null

  const slideEl = containerRef.closest('.swiper-slide')
  if (slideEl && !slideEl.classList.contains('swiper-slide-active')) {
    return null
  }

  const rect = containerRef.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  return rect
}

// ============================================
// Desktop Grid Host (MiniappWindowStack)
// ============================================

export function registerDesktopGridHostRef(targetDesktop: MiniappTargetDesktop, element: HTMLElement): void {
  desktopGridHostRefs.set(targetDesktop, element)
}

export function unregisterDesktopGridHostRef(targetDesktop: MiniappTargetDesktop): void {
  desktopGridHostRefs.delete(targetDesktop)
}

export function getDesktopGridHostRef(targetDesktop: MiniappTargetDesktop): HTMLElement | null {
  return desktopGridHostRefs.get(targetDesktop) ?? null
}

// ============================================
// Desktop App Slots
// ============================================

export function registerDesktopAppSlotRef(targetDesktop: MiniappTargetDesktop, appId: string, element: HTMLElement): void {
  const byApp = desktopAppSlotRefs.get(targetDesktop) ?? new Map<string, HTMLElement>()
  byApp.set(appId, element)
  desktopAppSlotRefs.set(targetDesktop, byApp)
  // 更新 slot 状态并通知监听器
  const key = `${targetDesktop}:${appId}`
  slotStatusMap.set(key, 'ready')
  notifySlotStatusChange()
}

export function unregisterDesktopAppSlotRef(targetDesktop: MiniappTargetDesktop, appId: string): void {
  const byApp = desktopAppSlotRefs.get(targetDesktop)
  if (!byApp) return
  byApp.delete(appId)
  if (byApp.size === 0) {
    desktopAppSlotRefs.delete(targetDesktop)
  }
  // 更新 slot 状态并通知监听器
  const key = `${targetDesktop}:${appId}`
  slotStatusMap.set(key, 'lost')
  notifySlotStatusChange()
}

export function getDesktopAppSlotRef(targetDesktop: MiniappTargetDesktop, appId: string): HTMLElement | null {
  return desktopAppSlotRefs.get(targetDesktop)?.get(appId) ?? null
}

/**
 * 获取 app slot 的 rect
 *
 * 注意：只有当对应 slide 为 active 时，这个 rect 才是最终目标位置
 */
export function getDesktopAppSlotRect(targetDesktop: MiniappTargetDesktop, appId: string): DOMRect | null {
  const slotRef = getDesktopAppSlotRef(targetDesktop, appId)
  if (!slotRef) return null

  const slideEl = slotRef.closest('.swiper-slide')
  if (slideEl && !slideEl.classList.contains('swiper-slide-active')) {
    return null
  }

  const rect = slotRef.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  return rect
}

// ============================================
// Stack (compat)
// ============================================

/** 注册 Stack Slide 容器引用（window 最终目标区域） */
export function registerStackContainerRef(element: HTMLElement): void {
  registerDesktopContainerRef('stack', element)
}

/** 注销 Stack Slide 容器引用 */
export function unregisterStackContainerRef(): void {
  unregisterDesktopContainerRef('stack')
}

/** 获取 Stack Slide 容器引用 */
export function getStackContainerRef(): HTMLElement | null {
  return getDesktopContainerRef('stack')
}

/**
 * 获取 Stack Slide 容器的 bounding rect
 *
 * 注意：只有当 stack slide 为 active 时，这个 rect 才是最终目标位置
 */
export function getStackRect(): DOMRect | null {
  return getDesktopRect('stack')
}

