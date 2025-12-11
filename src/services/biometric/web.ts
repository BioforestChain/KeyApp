/**
 * Web 平台生物识别服务实现
 * 使用 WebAuthn API
 */

import type {
  IBiometricService,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
} from './types'

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<BiometricAvailability> {
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        return {
          isAvailable: available,
          biometricType: available ? 'fingerprint' : 'none',
        }
      } catch {
        return { isAvailable: false, biometricType: 'none' }
      }
    }
    return { isAvailable: false, biometricType: 'none' }
  }

  async verify(_options?: BiometricVerifyOptions): Promise<BiometricVerifyResult> {
    // Web 环境下可以集成 WebAuthn，目前降级返回失败
    console.warn('Biometric not available in web, falling back to password')
    return {
      success: false,
      errorMessage: 'Biometric authentication not available in web browser',
    }
  }
}
