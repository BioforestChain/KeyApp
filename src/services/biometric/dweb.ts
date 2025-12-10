/**
 * DWEB 平台生物识别服务实现
 * 使用 @plaoc/plugins biometricsPlugin
 */

import { biometricsPlugin } from '@plaoc/plugins'
import type {
  IBiometricService,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
} from './types'

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<BiometricAvailability> {
    try {
      const result = await biometricsPlugin.checkBiometrics()
      return {
        isAvailable: result.isAvailable,
        biometricType: result.biometricType ?? 'none',
      }
    } catch (error) {
      return {
        isAvailable: false,
        biometricType: 'none',
        error: String(error),
      }
    }
  }

  async verify(options?: BiometricVerifyOptions): Promise<BiometricVerifyResult> {
    try {
      const result = await biometricsPlugin.biometricAuth({
        title: options?.title ?? '身份验证',
        subtitle: options?.description,
        negativeButtonText: options?.cancelText ?? '取消',
        maxAttempts: options?.maxAttempts ?? 3,
      })
      return {
        success: result.isSuccess,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      }
    } catch (error) {
      return {
        success: false,
        errorCode: -999,
        errorMessage: String(error),
      }
    }
  }
}
