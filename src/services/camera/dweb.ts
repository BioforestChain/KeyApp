/**
 * DWEB 平台相机服务实现
 *
 * 注意：@plaoc/plugins 的 barcodeScannerPlugin 只支持图像处理，不支持实时摄像头扫描
 * 该实现为 ICameraService 接口提供适配，实际的扫描功能需要通过其他方式实现
 * （��如通过原生应用 API 或专门的相机扫描库）
 */

import type { ICameraService, ScanResult } from './types'

export class CameraService implements ICameraService {
  async scanQRCode(): Promise<ScanResult> {
    try {
      // barcodeScannerPlugin 只能处理已有的图像数据（Uint8Array | Blob）
      // 无法直接启动摄像头扫描。这需要通过其他方式获取摄像头流
      throw new Error('实时摄像头扫描需要通过其他插件或 WebRTC API 实现')
    } catch (error) {
      return {
        content: '',
      }
    }
  }

  async checkPermission(): Promise<boolean> {
    // barcodeScannerPlugin 不提供权限检查 API
    // 相机权限通常由操作系统和浏览器直接处理
    return true
  }

  async requestPermission(): Promise<boolean> {
    // barcodeScannerPlugin 不提供权限请求 API
    // 相机权限由浏览器在访问摄像头时自动请求
    return true
  }
}
