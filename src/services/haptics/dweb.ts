/**
 * DWEB 平台触觉反馈服务实现
 * 使用 @plaoc/plugins hapticsPlugin
 */

import { hapticsPlugin } from '@plaoc/plugins'
import type { IHapticsService, HapticType } from './types'
import { ImpactStyle, NotificationType } from '@plaoc/plugins'

export class HapticsService implements IHapticsService {
  async impact(type?: HapticType): Promise<void> {
    const impactMap: Record<HapticType, () => Promise<void>> = {
      light: () => hapticsPlugin.impactLight({ style: ImpactStyle.Light }),
      medium: () => hapticsPlugin.impactLight({ style: ImpactStyle.Medium }),
      heavy: () => hapticsPlugin.impactLight({ style: ImpactStyle.Heavy }),
      success: () => hapticsPlugin.notification({ type: NotificationType.Success }),
      warning: () => hapticsPlugin.notification({ type: NotificationType.Warning }),
      error: () => hapticsPlugin.notification({ type: NotificationType.Error }),
    }
    await impactMap[type ?? 'medium']()
  }

  async vibrate(duration = 100): Promise<void> {
    await hapticsPlugin.vibrate({ duration: [duration] })
  }
}
