/**
 * 生物识别服务类型定义
 */

/** 生物识别类型 */
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none'

/** 生物识别可用性结果 */
export interface BiometricAvailability {
  isAvailable: boolean
  /** 可用的生物识别类型 */
  biometricType: BiometricType
  /** 错误信息（仅在检查过程中出错时存在） */
  error?: string | undefined
}

/**
 * 生物识别验证选项
 *
 * 注意：@plaoc/plugins biometricsPlugin 不支持自定义参数
 * 此接口保留用于未来扩展或其他实现（Web/Mock）
 */
export interface BiometricVerifyOptions {
  /** 提示标题 */
  title?: string | undefined
  /** 提示描述 */
  description?: string | undefined
  /** 取消按钮文字 */
  cancelText?: string | undefined
  /** 最大尝试次数 */
  maxAttempts?: number | undefined
  /** 失败后是否允许使用密码 */
  fallbackToPassword?: boolean | undefined
}

/** 生物识别验证结果 */
export interface BiometricVerifyResult {
  success: boolean
  /** 错误信息（仅在验证失败时存在） */
  errorMessage?: string | undefined
}

/** 生物识别服务接口 */
export interface IBiometricService {
  /** 检查生物识别是否可用 */
  isAvailable(): Promise<BiometricAvailability>
  /** 验证生物识别 */
  verify(options?: BiometricVerifyOptions | undefined): Promise<BiometricVerifyResult>
}
