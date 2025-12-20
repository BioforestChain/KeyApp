/**
 * 相机服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { ScanResult, ICameraService } from './types'
export { cameraServiceMeta } from './types'
export { cameraService } from '#camera-impl'
