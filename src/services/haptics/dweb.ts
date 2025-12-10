/**
 * DWEB 平台触觉反馈服务实现
 */

import { hapticsPlugin } from '@plaoc/plugins'
import type { IHapticsService, HapticType } from './types'

export class HapticsService implements IHapticsService {
  async impact(type?: HapticType): Promise<void> {
    const impactMap: Record<HapticType, () => Promise<void>> = {
      light: () => hapticsPlugin.impactLight({ style: 'LIGHT' }),
      medium: () => hapticsPlugin.impactLight({ style: 'MEDIUM' }),
      heavy: () => hapticsPlugin.impactLight({ style: 'HEAVY' }),
      success: () => hapticsPlugin.notification({ type: 'SUCCESS' }),
      warning: () => hapticsPlugin.notification({ type: 'WARNING' }),
      error: () => hapticsPlugin.notification({ type: 'ERROR' }),
    }
    await impactMap[type ?? 'medium']()
  }

  async vibrate(duration = 100): Promise<void> {
    await hapticsPlugin.vibrate({ duration })
  }
}
