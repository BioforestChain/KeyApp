/**
 * 生物识别服务 - Mock 实现
 */

import { biometricServiceMeta, type BiometricType } from './types'

/** Mock 状态 */
let mockAvailable = true
let mockBiometricType: BiometricType = 'fingerprint'
let mockShouldSucceed = true

export const biometricService = biometricServiceMeta.impl({
  async isAvailable() {
    return {
      isAvailable: mockAvailable,
      biometricType: mockBiometricType,
    }
  },

  async verify(_options) {
    return {
      success: mockShouldSucceed,
      errorMessage: mockShouldSucceed ? undefined : 'Mock authentication failed',
    }
  },
})

/** Mock 控制器 */
export const biometricMockController = {
  setAvailable: (available: boolean) => { mockAvailable = available },
  setBiometricType: (type: BiometricType) => { mockBiometricType = type },
  setShouldSucceed: (succeed: boolean) => { mockShouldSucceed = succeed },
  reset: () => {
    mockAvailable = true
    mockBiometricType = 'fingerprint'
    mockShouldSucceed = true
  },
}
