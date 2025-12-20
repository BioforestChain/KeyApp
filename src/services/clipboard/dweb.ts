/**
 * 剪贴板服务 - DWEB 平台实现
 */

import { clipboardPlugin } from '@plaoc/plugins'
import { clipboardServiceMeta } from './types'

export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    await clipboardPlugin.write({ string: text })
  },

  async read() {
    const result = await clipboardPlugin.read()
    return result.value ?? ''
  },
})
