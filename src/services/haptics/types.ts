/**
 * 触觉反馈服务类型定义
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export interface IHapticsService {
  /** 触发触觉反馈 */
  impact(type?: HapticType): Promise<void>
  /** 振动指定时长 */
  vibrate(duration?: number): Promise<void>
}
