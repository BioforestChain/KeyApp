/**
 * Miniapp Runtime Service Types
 *
 * 小程序运行时服务的类型定义
 */

import type { MiniappManifest } from '../ecosystem/types'

/** 小程序实例状态 */
export type MiniappState = 'launching' | 'active' | 'background' | 'closing'

/** 小程序实例 */
export interface MiniappInstance {
  /** 应用 ID */
  appId: string
  /** 应用清单 */
  manifest: MiniappManifest
  /** 当前状态 */
  state: MiniappState
  /** 启动时间 */
  launchedAt: number
  /** 最后激活时间 */
  lastActiveAt: number
  /** iframe 元素引用 */
  iframeRef: HTMLIFrameElement | null
  /** 图标元素引用（用于 FLIP 动画） */
  iconRef: HTMLElement | null
}

/** FLIP 动画帧数据 */
export interface FlipFrame {
  /** 元素位置和尺寸 */
  rect: DOMRect
  /** 不透明度 */
  opacity: number
  /** 圆角 */
  borderRadius: number
}

/** FLIP 动画帧组 */
export interface FlipFrames {
  /** 起始帧 */
  first: FlipFrame
  /** 结束帧 */
  last: FlipFrame
  /** 动画持续时间 (ms) */
  duration: number
  /** 动画曲线 */
  easing: string
}

/** 运行时状态 */
export interface MiniappRuntimeState {
  /** 所有运行中的应用 */
  apps: Map<string, MiniappInstance>
  /** 当前激活的应用 ID */
  activeAppId: string | null
  /** 是否处于层叠视图 */
  isStackViewOpen: boolean
  /** 最大后台应用数 */
  maxBackgroundApps: number
}

/** 运行时事件 */
export type MiniappRuntimeEvent =
  | { type: 'app:launch'; appId: string; manifest: MiniappManifest }
  | { type: 'app:activate'; appId: string }
  | { type: 'app:deactivate'; appId: string }
  | { type: 'app:close'; appId: string }
  | { type: 'app:state-change'; appId: string; state: MiniappState }
  | { type: 'stack-view:open' }
  | { type: 'stack-view:close' }

/** 运行时事件监听器 */
export type MiniappRuntimeListener = (event: MiniappRuntimeEvent) => void

/** 动画配置 */
export interface AnimationConfig {
  /** 启动动画持续时间 */
  launchDuration: number
  /** 关闭动画持续时间 */
  closeDuration: number
  /** iOS 动画曲线 */
  iosEasing: string
}

/** 默认动画配置 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  launchDuration: 400,
  closeDuration: 400,
  iosEasing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
}

/** 窗口位置配置 */
export interface WindowConfig {
  /** 窗口到屏幕边缘的边距 */
  margin: number
  /** 窗口圆角 */
  borderRadius: number
  /** 安全区域 */
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/** 默认窗口配置 */
export const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  margin: 0,
  borderRadius: 0,
  safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
}
