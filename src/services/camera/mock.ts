/**
 * Mock 相机服务实现
 */

import type { ICameraService, ScanResult } from './types'

declare global {
  interface Window {
    __MOCK_CAMERA__?: {
      permission: boolean
      scanResult?: ScanResult
    }
  }
}

export class CameraService implements ICameraService {
  async scanQRCode(): Promise<ScanResult> {
    const result = window.__MOCK_CAMERA__?.scanResult
    if (result) {
      return result
    }
    return { content: 'mock-qr-content', format: 'QR_CODE' }
  }

  async checkPermission(): Promise<boolean> {
    return window.__MOCK_CAMERA__?.permission ?? true
  }

  async requestPermission(): Promise<boolean> {
    return window.__MOCK_CAMERA__?.permission ?? true
  }
}
