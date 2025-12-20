/**
 * 触觉反馈服务 - Mock 实现
 */

import { hapticsServiceMeta } from './types'

const hapticHistory: Array<{ type: string; duration?: number; timestamp: number }> = []

export const hapticsService = hapticsServiceMeta.impl({
  async impact(type) {
    hapticHistory.push({ type: type ?? 'medium', timestamp: Date.now() })
  },

  async vibrate(duration) {
    hapticHistory.push({ type: 'vibrate', duration: duration ?? 100, timestamp: Date.now() })
  },
})

/** Mock 控制器 */
export const hapticsMockController = {
  getHistory: () => [...hapticHistory],
  clear: () => { hapticHistory.length = 0 },
}
