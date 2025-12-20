/**
 * Toast 服务 - DWEB 平台实现
 */

import { toastPlugin } from '@plaoc/plugins'
import { toastServiceMeta, type ToastPosition } from './types'
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

export const toastService = toastServiceMeta.impl({
  async show(options) {
    const { message, duration = 2000, position = 'bottom' } =
      typeof options === 'string' ? { message: options } : options

    const toastDuration = durationMap[duration] ?? 'short'

    await toastPlugin.show({
      text: message,
      duration: toastDuration,
      position: positionMap[position],
    })
  },
})
