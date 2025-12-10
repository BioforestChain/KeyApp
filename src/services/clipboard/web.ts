/**
 * Web 平台剪贴板服务实现
 */

import type { IClipboardService } from './types'

export class ClipboardService implements IClipboardService {
  async write(text: string): Promise<void> {
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
  }

  async read(): Promise<string> {
    if (navigator.clipboard) {
      return navigator.clipboard.readText()
    }
    return ''
  }
}
