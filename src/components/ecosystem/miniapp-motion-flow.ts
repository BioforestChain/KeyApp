import type { MiniappState } from '@/services/miniapp-runtime'

export const MINIAPP_FLOW = [
  'closed',
  'opening',
  'splash',
  'opened',
  'backgrounding',
  'backgrounded',
  'foregrounding',
  'closing',
] as const

export type MiniappFlow = (typeof MINIAPP_FLOW)[number]

export type WindowContainerVariant = 'open' | 'closed'
export type VisibilityVariant = 'show' | 'hide'
/** 层级变体：top=上层可见，bottom=下层隐藏，gone=display:none */
export type LayerVariant = 'top' | 'bottom' | 'gone'

export const flowToWindowContainer: Record<MiniappFlow, WindowContainerVariant> = {
  closed: 'closed',
  opening: 'open',
  splash: 'open',
  opened: 'open',
  backgrounding: 'open',
  backgrounded: 'closed',
  foregrounding: 'open',
  closing: 'open',
}

/**
 * splash-bg 层级（和 iframe 互斥，作为内容层）
 * - top: 在 iframe 上方，可见（启动中）
 * - bottom: 在 iframe 下方，隐藏（已打开）
 * - gone: display:none（后台、已关闭）
 */
export const flowToSplashBgLayer: Record<MiniappFlow, LayerVariant> = {
  closed: 'gone',
  opening: 'top',
  splash: 'top',
  opened: 'bottom',
  backgrounding: 'bottom',
  backgrounded: 'gone',
  foregrounding: 'bottom',
  closing: 'bottom', // 关闭时 splash-bg 不显示，只有 splash-icon 做动画
}

/**
 * iframe 层级（和 splash-bg 互斥，作为内容层）
 * - top: 在 splash-bg 上方，可见（已打开）
 * - bottom: 在 splash-bg 下方，隐藏（启动中）
 * - gone: display:none（后台、已关闭）
 */
export const flowToIframeLayer: Record<MiniappFlow, LayerVariant> = {
  closed: 'gone',
  opening: 'bottom',
  splash: 'bottom',
  opened: 'top',
  backgrounding: 'top',
  backgrounded: 'gone',
  foregrounding: 'top',
  closing: 'top', // 关闭时 iframe 保持在上层，通过 opacity 淡出
}

/**
 * splash-icon 层级（独立于内容层，只在 opening/closing 时出现做动画）
 */
export const flowToSplashIconLayer: Record<MiniappFlow, LayerVariant> = {
  closed: 'gone',
  opening: 'top',
  splash: 'top',
  opened: 'gone',
  backgrounding: 'gone',
  backgrounded: 'gone',
  foregrounding: 'gone',
  closing: 'top',
}

export const flowToCapsule: Record<MiniappFlow, VisibilityVariant> = {
  closed: 'hide',
  opening: 'show',
  splash: 'show',
  opened: 'show',
  backgrounding: 'show',
  backgrounded: 'hide',
  foregrounding: 'show',
  closing: 'show',
}

export const flowToCornerBadge: Record<MiniappFlow, VisibilityVariant> = {
  closed: 'show',
  opening: 'hide',
  splash: 'hide',
  opened: 'hide',
  backgrounding: 'hide',
  backgrounded: 'show',
  foregrounding: 'hide',
  closing: 'hide',
}

/**
 * splash-icon 的 layoutId 是否启用
 * 只在 opening 和 closing 时启用，做 shared layout 动画
 */
export const flowToSplashIconLayoutId: Record<MiniappFlow, boolean> = {
  closed: false,
  opening: true,
  splash: false,
  opened: false,
  backgrounding: false,
  backgrounded: false,
  foregrounding: false,
  closing: true,
}

/**
 * 将 runtime state 映射到稳定态 flow（不包含方向性瞬时态）
 *
 * 方向性（opening/backgrounding/foregrounding）由上层根据前后状态推导。
 */
export function runtimeStateToStableFlow(state: MiniappState | null): MiniappFlow {
  if (!state) return 'closed'
  if (state === 'preparing') return 'closed'
  if (state === 'launching') return 'opening'
  if (state === 'splash') return 'splash'
  if (state === 'active') return 'opened'
  if (state === 'background') return 'backgrounded'
  return 'closing'
}
