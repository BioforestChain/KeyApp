/**
 * Web 平台相机服务实现
 */

import type { ICameraService, ScanResult } from './types'

export class CameraService implements ICameraService {
  async scanQRCode(): Promise<ScanResult> {
    // Web 环境下需要使用第三方库如 html5-qrcode
    throw new Error('QR scanning not implemented in web. Use file input or camera stream.')
  }

  async checkPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      return result.state === 'granted'
    } catch {
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  }
}
