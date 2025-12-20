/**
 * 相机服务 - Mock 实现
 */

import { cameraServiceMeta, type ScanResult } from './types'

let mockScanResult: ScanResult = { content: 'mock-qr-content', format: 'QR_CODE' }
let mockPermission = true

export const cameraService = cameraServiceMeta.impl({
  async scanQRCode() {
    return mockScanResult
  },

  async checkPermission() {
    return mockPermission
  },

  async requestPermission() {
    return mockPermission
  },
})

/** Mock 控制器 */
export const cameraMockController = {
  setScanResult: (result: ScanResult) => { mockScanResult = result },
  setPermission: (permission: boolean) => { mockPermission = permission },
  reset: () => {
    mockScanResult = { content: 'mock-qr-content', format: 'QR_CODE' }
    mockPermission = true
  },
}
