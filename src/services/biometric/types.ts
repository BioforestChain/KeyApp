/**
 * 生物识别服务类型定义
 */

/** 生物识别类型 */
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none'

/** 生物识别可用性结果 */
export interface BiometricAvailability {
  isAvailable: boolean
  biometricType?: BiometricType
  error?: string
}

/** 生物识别验证选项 */
export interface BiometricVerifyOptions {
  /** 提示标题 */
  title?: string
  /** 提示描述 */
  description?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 最大尝试次数 */
  maxAttempts?: number
  /** 失败后是否允许使用密码 */
  fallbackToPassword?: boolean
}

/** 生物识别验证结果 */
export interface BiometricVerifyResult {
  success: boolean
  errorCode?: number
  errorMessage?: string
}

/** 生物识别服务接口 */
export interface IBiometricService {
  /** 检查生物识别是否可用 */
  isAvailable(): Promise<BiometricAvailability>
  /** 验证生物识别 */
  verify(options?: BiometricVerifyOptions): Promise<BiometricVerifyResult>
}
