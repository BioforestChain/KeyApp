/**
 * Toast 服务
 */

export type { ToastPosition, ToastOptions, IToastService } from './types'

import { ToastService } from '#toast-impl'
export { ToastService }

export const toastService = new ToastService()
