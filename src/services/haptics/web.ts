/**
 * Web 平台触觉反馈服务实现
 */

import type { IHapticsService, HapticType } from './types'

export class HapticsService implements IHapticsService {
  async impact(type?: HapticType): Promise<void> {
    if ('vibrate' in navigator) {
      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 30, 20],
        error: [30, 50, 30, 50, 30],
      }
      navigator.vibrate(patterns[type ?? 'medium'])
    }
  }

  async vibrate(duration = 100): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }
}
