/**
 * 剪贴板服务 - Mock 实现
 */

import { clipboardServiceMeta } from './types'

/** Mock 存储 */
let mockClipboard = ''

export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    mockClipboard = text
  },

  async read() {
    return mockClipboard
  },
})

/** Mock 控制器 (测试/调试用) */
export const clipboardMockController = {
  getContent: () => mockClipboard,
  setContent: (text: string) => { mockClipboard = text },
  clear: () => { mockClipboard = '' },
}
