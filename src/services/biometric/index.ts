/**
 * 生物识别服务
 * 
 * 通过 Vite alias 在编译时选择实现：
 * - web: Web 平台 (WebAuthn)
 * - dweb: DWEB 平台 (@plaoc/plugins)
 * - mock: Mock 实现 (测试用)
 */

export type {
  BiometricType,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
  IBiometricService,
} from './types'

// 编译时通过 Vite alias 替换为具体实现
// #biometric-impl -> ./web.ts | ./dweb.ts | ./mock.ts
import { BiometricService } from '#biometric-impl'
export { BiometricService }

// 单例实例
export const biometricService = new BiometricService()
