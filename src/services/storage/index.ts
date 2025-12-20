/**
 * 安全存储服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { ISecureStorageService } from './types'
export { secureStorageServiceMeta } from './types'
export { secureStorageService } from '#storage-impl'
