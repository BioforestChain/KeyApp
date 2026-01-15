/**
 * 生物识别服务 - Web 平台实现
 * 使用 WebAuthn API
 */

import { biometricServiceMeta } from './types'

export const biometricService = biometricServiceMeta.impl({
  async isAvailable() {
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        return {
          isAvailable: available,
          biometricType: available ? 'fingerprint' : 'none',
        } as const
      } catch {
        return { isAvailable: false, biometricType: 'none' } as const
      }
    }
    return { isAvailable: false, biometricType: 'none' } as const
  },

  async verify(_options) {
    
    return {
      success: false,
      errorMessage: 'Biometric authentication not available in web browser',
    }
  },
})
