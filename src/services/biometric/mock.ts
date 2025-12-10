/**
 * Mock 生物识别服务实现
 * 用于开发和 E2E 测试
 */

import type {
  IBiometricService,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
} from './types'

// 通过 window 暴露控制接口，供 E2E 测试使用
declare global {
  interface Window {
    __MOCK_BIOMETRIC__?: {
      available: boolean
      biometricType: 'fingerprint' | 'face' | 'iris' | 'none'
      shouldSucceed: boolean
    }
  }
}

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<BiometricAvailability> {
    const config = window.__MOCK_BIOMETRIC__
    return {
      isAvailable: config?.available ?? true,
      biometricType: config?.biometricType ?? 'fingerprint',
    }
  }

  async verify(_options?: BiometricVerifyOptions): Promise<BiometricVerifyResult> {
    const shouldSucceed = window.__MOCK_BIOMETRIC__?.shouldSucceed ?? true
    return {
      success: shouldSucceed,
      errorCode: shouldSucceed ? undefined : -1,
      errorMessage: shouldSucceed ? undefined : 'Mock authentication failed',
    }
  }
}
