/**
 * 触觉反馈服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { HapticType, IHapticsService } from './types'
export { hapticsServiceMeta } from './types'
export { hapticsService } from '#haptics-impl'
