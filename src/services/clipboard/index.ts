/**
 * 剪贴板服务
 */

export type { IClipboardService } from './types'

import { ClipboardService } from '#clipboard-impl'
export { ClipboardService }

export const clipboardService = new ClipboardService()
