/**
 * DWEB 平台 Toast 服务实现
 * 使用 @plaoc/plugins toastPlugin
 */

import { toastPlugin } from '@plaoc/plugins'
import type { IToastService, ToastOptions, ToastPosition } from './types'
import type { ToastDuration } from '@plaoc/plugins'

const durationMap: Record<number, ToastDuration> = {
  2000: 'short',
  3500: 'long',
}

const positionMap: Record<ToastPosition, 'top' | 'center' | 'bottom'> = {
  top: 'top',
  center: 'center',
  bottom: 'bottom',
}

export class ToastService implements IToastService {
  async show(options: ToastOptions | string): Promise<void> {
    const { message, duration = 2000, position = 'bottom' } =
      typeof options === 'string' ? { message: options } : options

    // 将毫秒转换为 'short' 或 'long' duration
    const toastDuration = durationMap[duration] ?? 'short'

    await toastPlugin.show({
      text: message,
      duration: toastDuration,
      position: positionMap[position],
    })
  }
}
