/**
 * Iframe Manager
 *
 * 管理小程序 iframe 的生命周期
 * - 前台应用：正常渲染
 * - 后台应用：最多 4 个，visibility: hidden
 * - 超出限制：从 DOM 移除
 */

import type { MiniappInstance } from './types'

/** 最大后台 iframe 数量 */
const MAX_BACKGROUND_IFRAMES = 4

/** iframe 容器 ID */
const IFRAME_CONTAINER_ID = 'miniapp-iframe-container'
const HIDDEN_CONTAINER_ID = 'miniapp-hidden-container'

/**
 * 获取或创建 iframe 容器
 */
function getOrCreateContainer(id: string, hidden: boolean): HTMLElement {
  let container = document.getElementById(id)
  if (!container) {
    container = document.createElement('div')
    container.id = id
    if (hidden) {
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        visibility: hidden;
        pointer-events: none;
      `
    }
    document.body.appendChild(container)
  }
  return container
}

/**
 * 创建小程序 iframe
 */
export function createIframe(
  appId: string,
  url: string,
  contextParams?: Record<string, string>
): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.id = `miniapp-iframe-${appId}`
  iframe.dataset.appId = appId

  // 构建带参数的 URL
  const iframeUrl = new URL(url, window.location.origin)
  if (contextParams) {
    Object.entries(contextParams).forEach(([key, value]) => {
      iframeUrl.searchParams.set(key, value)
    })
  }
  iframe.src = iframeUrl.toString()

  // 安全沙箱
  iframe.sandbox.add('allow-scripts', 'allow-forms', 'allow-same-origin')

  // 样式
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `

  return iframe
}

/**
 * 将 iframe 挂载到可见容器
 */
export function mountIframeVisible(iframe: HTMLIFrameElement): void {
  const container = getOrCreateContainer(IFRAME_CONTAINER_ID, false)
  container.appendChild(iframe)
}

/**
 * 将 iframe 移到隐藏容器（后台）
 */
export function moveIframeToBackground(iframe: HTMLIFrameElement): void {
  const container = getOrCreateContainer(HIDDEN_CONTAINER_ID, true)
  container.appendChild(iframe)
}

/**
 * 将 iframe 从隐藏容器移回可见
 */
export function moveIframeToForeground(iframe: HTMLIFrameElement): void {
  const container = getOrCreateContainer(IFRAME_CONTAINER_ID, false)
  container.appendChild(iframe)
}

/**
 * 从 DOM 移除 iframe
 */
export function removeIframe(iframe: HTMLIFrameElement): void {
  // 先清空 src 以停止加载
  iframe.src = 'about:blank'
  iframe.remove()
}

/**
 * 根据 appId 查找 iframe
 */
export function findIframe(appId: string): HTMLIFrameElement | null {
  return document.getElementById(`miniapp-iframe-${appId}`) as HTMLIFrameElement | null
}

/**
 * 管理后台 iframe 数量
 * 超出限制时移除最旧的
 */
export function enforceBackgroundLimit(
  apps: Map<string, MiniappInstance>,
  activeAppId: string | null,
  maxBackground: number = MAX_BACKGROUND_IFRAMES
): string[] {
  const removedAppIds: string[] = []

  // 获取所有后台应用，按最后激活时间排序
  const backgroundApps = Array.from(apps.values())
    .filter((app) => app.appId !== activeAppId && app.state === 'background')
    .toSorted((a, b) => a.lastActiveAt - b.lastActiveAt)

  // 移除超出限制的
  while (backgroundApps.length > maxBackground) {
    const oldest = backgroundApps.shift()
    if (oldest?.iframeRef) {
      removeIframe(oldest.iframeRef)
      oldest.iframeRef = null
      removedAppIds.push(oldest.appId)
    }
  }

  return removedAppIds
}

/**
 * 清理所有 iframe
 */
export function cleanupAllIframes(): void {
  const visibleContainer = document.getElementById(IFRAME_CONTAINER_ID)
  const hiddenContainer = document.getElementById(HIDDEN_CONTAINER_ID)

  if (visibleContainer) {
    visibleContainer.innerHTML = ''
    visibleContainer.remove()
  }

  if (hiddenContainer) {
    hiddenContainer.innerHTML = ''
    hiddenContainer.remove()
  }
}

/**
 * 获取当前后台 iframe 数量
 */
export function getBackgroundIframeCount(): number {
  const container = document.getElementById(HIDDEN_CONTAINER_ID)
  return container?.children.length ?? 0
}
