/**
 * DWEB 平台剪贴板服务实现
 */

import { clipboardPlugin } from '@plaoc/plugins'
import type { IClipboardService } from './types'

export class ClipboardService implements IClipboardService {
  async write(text: string): Promise<void> {
    await clipboardPlugin.write({ string: text })
  }

  async read(): Promise<string> {
    const result = await clipboardPlugin.read()
    return result.value ?? ''
  }
}
