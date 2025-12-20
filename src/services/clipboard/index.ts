/**
 * 剪贴板服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { IClipboardService } from './types'
export { clipboardServiceMeta } from './types'
export { clipboardService } from '#clipboard-impl'
