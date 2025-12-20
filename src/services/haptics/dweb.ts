/**
 * 触觉反馈服务 - DWEB 平台实现
 */

import { hapticsPlugin, ImpactStyle, NotificationType } from '@plaoc/plugins'
import { hapticsServiceMeta, type HapticType } from './types'

type NonNullableHapticType = NonNullable<HapticType>

export const hapticsService = hapticsServiceMeta.impl({
  async impact(type) {
    const impactMap: Record<NonNullableHapticType, () => Promise<void>> = {
      light: () => hapticsPlugin.impactLight({ style: ImpactStyle.Light }),
      medium: () => hapticsPlugin.impactLight({ style: ImpactStyle.Medium }),
      heavy: () => hapticsPlugin.impactLight({ style: ImpactStyle.Heavy }),
      success: () => hapticsPlugin.notification({ type: NotificationType.Success }),
      warning: () => hapticsPlugin.notification({ type: NotificationType.Warning }),
      error: () => hapticsPlugin.notification({ type: NotificationType.Error }),
    }
    await impactMap[type ?? 'medium']()
  },

  async vibrate(duration) {
    await hapticsPlugin.vibrate({ duration: [duration ?? 100] })
  },
})
