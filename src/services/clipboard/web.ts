/**
 * 剪贴板服务 - Web 平台实现
 */

import { clipboardServiceMeta } from './types'

export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  },

  async read() {
    if (navigator.clipboard) {
      return navigator.clipboard.readText()
    }
    return ''
  },
})
