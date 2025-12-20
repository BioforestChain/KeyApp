/**
 * 相机服务 - Web 平台实现
 */

import { cameraServiceMeta } from './types'

export const cameraService = cameraServiceMeta.impl({
  async scanQRCode() {
    throw new Error('QR scanning not implemented in web.')
  },

  async checkPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      return result.state === 'granted'
    } catch {
      return false
    }
  },

  async requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  },
})
