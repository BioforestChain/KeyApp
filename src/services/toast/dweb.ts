/**
 * DWEB 平台 Toast 服务实现
 */

import { toastPlugin } from '@plaoc/plugins'
import type { IToastService, ToastOptions, ToastPosition } from './types'

const positionMap: Record<ToastPosition, string> = {
  top: 'top',
  center: 'center',
  bottom: 'bottom',
}

export class ToastService implements IToastService {
  async show(options: ToastOptions | string): Promise<void> {
    const { message, duration = 2000, position = 'bottom' } = 
      typeof options === 'string' ? { message: options } : options

    await toastPlugin.show({
      text: message,
      duration: duration,
      position: positionMap[position],
    })
  }
}
