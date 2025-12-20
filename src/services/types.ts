/**
 * Service 层类型定义
 * 
 * 设计原则：
 * 1. 接口优先 - 所有服务定义为接口
 * 2. 多实现 - DWEB/Web/Mock 三套实现
 * 3. Context 注入 - 通过 React Context 注入，便于测试
 */

/** 平台类型 */
export type Platform = 'dweb' | 'web' | 'mock'

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
  /** 错误详情（仅在验证失败时存在） */
  errorMessage?: string | undefined
}

/** 生物识别服务接口 */
export interface IBiometricService {
  /** 检查生物识别是否可用 */
  isAvailable(): Promise<BiometricAvailability>
  /** 验证生物识别 */
  verify(options?: BiometricVerifyOptions): Promise<BiometricVerifyResult>
}

/** 安全存储项 */
export interface SecureStorageItem {
  key: string
  value: string
}

/** 安全存储服务接口 */
export interface ISecureStorageService {
  /** 存储数据 */
  set(input: { key: string; value: string }): Promise<void>
  /** 获取数据 */
  get(input: { key: string }): Promise<string | null>
  /** 删除数据 */
  remove(input: { key: string }): Promise<void>
  /** 检查是否存在 */
  has(input: { key: string }): Promise<boolean>
  /** 清空所有数据 */
  clear(): Promise<void>
}

/** 剪贴板服务接口 */
export interface IClipboardService {
  /** 写入文本 */
  write(input: { text: string }): Promise<void>
  /** 读取文本 */
  read(): Promise<string>
}

/** Toast 位置 */
export type ToastPosition = 'top' | 'center' | 'bottom'

/** Toast 选项 */
export interface ToastOptions {
  message: string
  duration?: number
  position?: ToastPosition
}

/** Toast 服务接口 */
export interface IToastService {
  /** 显示 Toast */
  show(options: ToastOptions | string): Promise<void>
}

/** 相机扫描结果 */
export interface ScanResult {
  content: string
  format?: string
}

/** 相机服务接口 */
export interface ICameraService {
  scanQRCode(): Promise<ScanResult>
  checkPermission(): Promise<boolean>
  requestPermission(): Promise<boolean>
}

/** 触觉反馈类型 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/** 触觉服务接口 */
export interface IHapticsService {
  /** 触发触觉反馈 */
  impact(type?: HapticType): Promise<void>
  /** 振动 */
  vibrate(duration?: number): Promise<void>
}

/** 汇率响应数据 */
export interface ExchangeRateResponse {
  /** 基准货币 */
  base: string
  /** 汇率日期 */
  date: string
  /** 目标货币汇率映射 */
  rates: Record<string, number>
}

/** 货币兑换服务接口 */
export interface ICurrencyExchangeService {
  getExchangeRates(input: { baseCurrency: string; targetCurrencies: string[] }): Promise<ExchangeRateResponse>
}

/** 所有服务的聚合接口 */
export interface IServices {
  biometric: IBiometricService
  secureStorage: ISecureStorageService
  clipboard: IClipboardService
  toast: IToastService
  camera: ICameraService
  haptics: IHapticsService
  currencyExchange: ICurrencyExchangeService
}
