/**
 * Mock Toast 服务实现
 */

import type { IToastService, ToastOptions } from './types'

declare global {
  interface Window {
    __TOAST_HISTORY__?: Array<ToastOptions & { timestamp: number }>
  }
}

export class ToastService implements IToastService {
  async show(options: ToastOptions | string): Promise<void> {
    const opts = typeof options === 'string' ? { message: options } : options
    
    if (!window.__TOAST_HISTORY__) {
      window.__TOAST_HISTORY__ = []
    }
    
    window.__TOAST_HISTORY__.push({
      ...opts,
      timestamp: Date.now(),
    })

    // 同时在控制台输出，便于调试
    console.log('[Toast]', opts.message)
  }
}
