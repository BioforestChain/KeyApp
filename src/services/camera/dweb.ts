/**
 * DWEB 平台相机服务实现
 */

import { barcodeScannerPlugin } from '@plaoc/plugins'
import type { ICameraService, ScanResult } from './types'

export class CameraService implements ICameraService {
  async scanQRCode(): Promise<ScanResult> {
    const result = await barcodeScannerPlugin.startScan()
    return {
      content: result.content ?? '',
      format: result.format,
    }
  }

  async checkPermission(): Promise<boolean> {
    const result = await barcodeScannerPlugin.checkPermission()
    return result.granted === true
  }

  async requestPermission(): Promise<boolean> {
    const result = await barcodeScannerPlugin.requestPermission()
    return result.granted === true
  }
}
