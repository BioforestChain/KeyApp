/**
 * 生物识别服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type {
  BiometricType,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
  IBiometricService,
} from './types'
export { biometricServiceMeta } from './types'
export { biometricService } from '#biometric-impl'
