/**
 * Toast 服务 - Mock 实现
 */

import { toastServiceMeta } from './types'

const toastHistory: Array<{ message: string; timestamp: number }> = []

export const toastService = toastServiceMeta.impl({
  async show(options) {
    const message = typeof options === 'string' ? options : options.message
    toastHistory.push({ message, timestamp: Date.now() })
    
  },
})

/** Mock 控制器 */
export const toastMockController = {
  getHistory: () => [...toastHistory],
  clear: () => { toastHistory.length = 0 },
}
