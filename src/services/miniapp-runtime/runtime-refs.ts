/**
 * Miniapp Runtime Refs
 *
 * 统一管理运行时所需的 DOM 引用（icon/window/stack/splash）。
 *
 * 设计原则：
 * - SRP：这里只做 ref 的注册/查询/注销
 * - KISS：不耦合动画实现细节
 */

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

/** Stack Slide 容器 ref（window 的最终目标区域） */
let stackContainerRef: HTMLElement | null = null

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
// Stack
// ============================================

/** 注册 Stack Slide 容器引用（window 最终目标区域） */
export function registerStackContainerRef(element: HTMLElement): void {
  stackContainerRef = element
}

/** 注销 Stack Slide 容器引用 */
export function unregisterStackContainerRef(): void {
  stackContainerRef = null
}

/** 获取 Stack Slide 容器引用 */
export function getStackContainerRef(): HTMLElement | null {
  return stackContainerRef
}

/**
 * 获取 Stack Slide 容器的 bounding rect
 *
 * 注意：只有当 stack slide 为 active 时，这个 rect 才是最终目标位置
 */
export function getStackRect(): DOMRect | null {
  if (!stackContainerRef) return null

  const slideEl = stackContainerRef.closest('.swiper-slide')
  if (slideEl && !slideEl.classList.contains('swiper-slide-active')) {
    return null
  }

  const rect = stackContainerRef.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  return rect
}

