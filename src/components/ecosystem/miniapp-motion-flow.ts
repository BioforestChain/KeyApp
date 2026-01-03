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

export const flowToSplashBg: Record<MiniappFlow, VisibilityVariant> = {
  closed: 'hide',
  opening: 'show',
  splash: 'show',
  opened: 'hide',
  backgrounding: 'hide',
  backgrounded: 'hide',
  foregrounding: 'hide',
  closing: 'hide',
}

export const flowToSplashIcon: Record<MiniappFlow, VisibilityVariant> = {
  closed: 'hide',
  opening: 'show',
  splash: 'show',
  opened: 'hide',
  backgrounding: 'hide',
  backgrounded: 'hide',
  foregrounding: 'hide',
  closing: 'show',
}

export const flowToIframe: Record<MiniappFlow, VisibilityVariant> = {
  closed: 'hide',
  opening: 'hide',
  splash: 'hide',
  opened: 'show',
  backgrounding: 'hide',
  backgrounded: 'hide',
  foregrounding: 'show',
  closing: 'hide',
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
