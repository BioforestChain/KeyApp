/**
 * 触觉反馈服务 - Web 平台实现
 */

import { hapticsServiceMeta, type HapticType } from './types'

type NonNullableHapticType = NonNullable<HapticType>

export const hapticsService = hapticsServiceMeta.impl({
  async impact(type) {
    if ('vibrate' in navigator) {
      const patterns: Record<NonNullableHapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 30, 20],
        error: [30, 50, 30, 50, 30],
      }
      navigator.vibrate(patterns[type ?? 'medium'])
    }
  },

  async vibrate(duration) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration ?? 100)
    }
  },
})
