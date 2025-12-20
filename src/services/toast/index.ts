/**
 * Toast 服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { ToastPosition, ToastOptions, IToastService } from './types'
export { toastServiceMeta } from './types'
export { toastService } from '#toast-impl'
