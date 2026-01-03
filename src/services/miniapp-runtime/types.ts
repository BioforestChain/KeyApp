/**
 * Miniapp Runtime Service Types
 *
 * 小程序运行时服务的类型定义
 */

import type { MiniappManifest } from '../ecosystem/types'
import type { MiniappTargetDesktop } from '../ecosystem/types'
import type { MiniappVisualConfig } from './visual-config'

/** 小程序实例状态 */
export type MiniappState = 'preparing' | 'launching' | 'splash' | 'active' | 'background' | 'closing'

/** 窗口呈现状态（系统级，可见性） */
export type MiniappPresentationState = 'hidden' | 'presenting' | 'presented' | 'dismissing'

/** 进程/内容载体状态（iframe） */
export type MiniappProcessStatus = 'loading' | 'loaded'

/** 应用就绪状态（可交互门闩） */
export type MiniappReadinessState = 'notReady' | 'ready'

export type MiniappTransitionKind = 'present' | 'dismiss'

export type MiniappTransitionStatus = 'requested' | 'inProgress' | 'completed' | 'cancelled'

export interface MiniappTransition {
  id: string
  kind: MiniappTransitionKind
  status: MiniappTransitionStatus
  startedAt: number
}

export interface MiniappPresentation {
  appId: string
  desktop: MiniappTargetDesktop
  state: MiniappPresentationState
  zOrder: number
  transitionId: string | null
  transitionKind: MiniappTransitionKind | null
}

/** 小程序动画流（包含方向性） */
export type MiniappFlow =
  | 'closed'
  | 'opening'
  | 'splash'
  | 'opened'
  | 'backgrounding'
  | 'backgrounded'
  | 'foregrounding'
  | 'closing'

/** 胶囊主题 */
export type CapsuleTheme = 'auto' | 'dark' | 'light'

/**
 * 小程序可控设置（miniapp → KeyApp）
 * 
 * 通过 bio.updateContext() API 动态修改
 * 修改后会触发 app:ctx-change 事件
 * 
 * 注意：这与 KeyApp → miniapp 的 contextState 不同
 * contextState 通过 postMessage 传递 theme/locale/env/a11y 给 miniapp
 */
export interface MiniappContext {
  /** 
   * 胶囊按钮主题
   * - 'auto': 跟随 KeyApp 主题（默认）
   * - 'dark': 强制深色胶囊（适合浅色背景 app）
   * - 'light': 强制浅色胶囊（适合深色背景 app）
   */
  capsuleTheme: CapsuleTheme
}

/** 小程序实例 */
export interface MiniappInstance {
  /** 应用 ID */
  appId: string
  /** 应用清单 */
  manifest: MiniappManifest
  /** 当前状态 */
  state: MiniappState
  /** 动画流状态（包含方向性） */
  flow: MiniappFlow
  /** 运行时上下文（可动态修改） */
  ctx: MiniappContext
  /** iframe 加载状态 */
  processStatus: MiniappProcessStatus
  /** 是否已就绪（由 iframe load 或 splash 关闭触发） */
  readiness: MiniappReadinessState
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
  /** miniapp 视觉配置（motion + css token） */
  visualConfig: MiniappVisualConfig
  /** 当前交互焦点的应用 ID（兼容字段，旧逻辑仍使用） */
  activeAppId: string | null
  /** 当前交互焦点（多窗口架构下的正式字段） */
  focusedAppId: string | null
  /** 当前呈现中的窗口集合（多窗口） */
  presentations: Map<string, MiniappPresentation>
  /** z-index 递增种子 */
  zOrderSeed: number
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
  | { type: 'app:ctx-change'; appId: string; ctx: MiniappContext }
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
