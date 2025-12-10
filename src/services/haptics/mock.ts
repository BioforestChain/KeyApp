/**
 * Mock 触觉反馈服务实现
 */

import type { IHapticsService, HapticType } from './types'

declare global {
  interface Window {
    __HAPTIC_HISTORY__?: Array<{ type: HapticType | 'vibrate'; duration?: number; timestamp: number }>
  }
}

export class HapticsService implements IHapticsService {
  async impact(type?: HapticType): Promise<void> {
    if (!window.__HAPTIC_HISTORY__) {
      window.__HAPTIC_HISTORY__ = []
    }
    window.__HAPTIC_HISTORY__.push({
      type: type ?? 'medium',
      timestamp: Date.now(),
    })
  }

  async vibrate(duration = 100): Promise<void> {
    if (!window.__HAPTIC_HISTORY__) {
      window.__HAPTIC_HISTORY__ = []
    }
    window.__HAPTIC_HISTORY__.push({
      type: 'vibrate',
      duration,
      timestamp: Date.now(),
    })
  }
}
