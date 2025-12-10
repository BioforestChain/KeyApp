/**
 * Toast 服务类型定义
 */

export type ToastPosition = 'top' | 'center' | 'bottom'

export interface ToastOptions {
  message: string
  duration?: number
  position?: ToastPosition
}

export interface IToastService {
  /** 显示 Toast */
  show(options: ToastOptions | string): Promise<void>
}
