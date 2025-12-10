/**
 * 相机服务类型定义
 */

export interface ScanResult {
  /** 扫描内容 */
  content: string
  /** 格式类型 */
  format?: string
}

export interface ICameraService {
  /** 扫描二维码 */
  scanQRCode(): Promise<ScanResult>
  /** 检查相机权限 */
  checkPermission(): Promise<boolean>
  /** 请求相机权限 */
  requestPermission(): Promise<boolean>
}
