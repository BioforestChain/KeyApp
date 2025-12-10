/**
 * 相机服务
 */

export type { ScanResult, ICameraService } from './types'

import { CameraService } from '#camera-impl'
export { CameraService }

export const cameraService = new CameraService()
