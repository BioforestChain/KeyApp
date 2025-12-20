/**
 * 生物识别服务 - DWEB 平台实现
 * 使用 @plaoc/plugins biometricsPlugin
 */

import { biometricsPlugin } from '@plaoc/plugins'
import { biometricServiceMeta } from './types'

const BIOMETRIC_SUCCESS = 0

export const biometricService = biometricServiceMeta.impl({
  async isAvailable() {
    try {
      const result = await biometricsPlugin.check()
      const isAvailable = result === BIOMETRIC_SUCCESS
      return {
        isAvailable,
        biometricType: isAvailable ? 'fingerprint' : 'none',
      } as const
    } catch (error) {
      return {
        isAvailable: false,
        biometricType: 'none',
        error: String(error),
      } as const
    }
  },

  async verify(_options) {
    try {
      const result = await biometricsPlugin.biometrics()
      return {
        success: result.success,
        errorMessage: result.success ? undefined : result.message,
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: String(error),
      }
    }
  },
})
