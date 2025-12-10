/**
 * 安全存储服务
 */

export type { ISecureStorageService } from './types'

import { SecureStorageService } from '#storage-impl'
export { SecureStorageService }

export const secureStorageService = new SecureStorageService()
