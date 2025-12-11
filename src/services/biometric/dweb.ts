/**
 * DWEB 平台生物识别服务实现
 * 使用 @plaoc/plugins biometricsPlugin
 *
 * 注意：options 参数在 @plaoc/plugins 中不被使用
 * biometricsPlugin 仅需要调用后返回验证结果，不支持自定义参数
 */

import { biometricsPlugin } from '@plaoc/plugins'
import type {
  IBiometricService,
  BiometricAvailability,
  BiometricVerifyResult,
} from './types'

// Biometrics status code mappings to success/failure
const BIOMETRIC_SUCCESS = 0

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<BiometricAvailability> {
    try {
      const result = await biometricsPlugin.check()
      const isAvailable = result === BIOMETRIC_SUCCESS
      return {
        isAvailable,
        biometricType: isAvailable ? 'fingerprint' : 'none',
      }
    } catch (error) {
      return {
        isAvailable: false,
        biometricType: 'none',
        error: String(error),
      }
    }
  }

  async verify(): Promise<BiometricVerifyResult> {
    try {
      const result = await biometricsPlugin.biometrics()
      // BaseResult returns { success: boolean; message: string }
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
  }
}
