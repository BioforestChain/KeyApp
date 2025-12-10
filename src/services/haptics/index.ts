/**
 * 触觉反馈服务
 */

export type { HapticType, IHapticsService } from './types'

import { HapticsService } from '#haptics-impl'
export { HapticsService }

export const hapticsService = new HapticsService()
