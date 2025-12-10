/**
 * Mock 剪贴板服务实现
 */

import type { IClipboardService } from './types'

declare global {
  interface Window {
    __CLIPBOARD__?: string
  }
}

export class ClipboardService implements IClipboardService {
  async write(text: string): Promise<void> {
    window.__CLIPBOARD__ = text
  }

  async read(): Promise<string> {
    return window.__CLIPBOARD__ ?? ''
  }
}
