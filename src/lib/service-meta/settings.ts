/**
 * 全局 Mock 设置
 * 提供响应式的全局配置，与中间件系统集成
 */

import type { Middleware, MiddlewareContext } from './types'

/** 设置状态 */
interface MockSettings {
  /** 全局延迟 (ms) */
  globalDelay: number
  /** 全局错误 */
  globalError: Error | null
  /** 是否启用 Mock */
  enabled: boolean
}

/** 当前设置 */
const settings: MockSettings = {
  globalDelay: 0,
  globalError: null,
  enabled: true,
}

/** 订阅者 */
type SettingsListener = (settings: MockSettings) => void
const listeners = new Set<SettingsListener>()

/** 通知变更 */
function notify(): void {
  listeners.forEach((fn) => fn({ ...settings }))
}

/** 订阅设置变更 */
export function subscribeSettings(listener: SettingsListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** 获取当前设置 */
export function getSettings(): Readonly<MockSettings> {
  return { ...settings }
}

/** 设置全局延迟 */
export function setGlobalDelay(ms: number): void {
  settings.globalDelay = Math.max(0, ms)
  notify()
}

/** 获取全局延迟 */
export function getGlobalDelay(): number {
  return settings.globalDelay
}

/** 设置全局错误 */
export function setGlobalError(error: Error | null): void {
  settings.globalError = error
  notify()
}

/** 获取全局错误 */
export function getGlobalError(): Error | null {
  return settings.globalError
}

/** 设置是否启用 Mock */
export function setMockEnabled(enabled: boolean): void {
  settings.enabled = enabled
  notify()
}

/** 获取是否启用 Mock */
export function isMockEnabled(): boolean {
  return settings.enabled
}

/** 重置所有设置 */
export function resetSettings(): void {
  settings.globalDelay = 0
  settings.globalError = null
  settings.enabled = true
  notify()
}

/**
 * 全局设置中间件
 * 根据全局设置应用延迟和错误
 */
export const settingsMiddleware: Middleware = async (
  _ctx: MiddlewareContext,
  next: () => Promise<unknown>,
): Promise<unknown> => {
  // 检查全局错误
  if (settings.globalError) {
    throw settings.globalError
  }

  // 应用全局延迟
  if (settings.globalDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, settings.globalDelay))
  }

  return next()
}
