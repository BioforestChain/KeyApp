/**
 * Toast 服务 - Web 平台实现
 */

import { toastServiceMeta } from './types'

export const toastService = toastServiceMeta.impl({
  async show(options) {
    const { message, duration = 2000, position = 'bottom' } =
      typeof options === 'string' ? { message: options } : options

    const toast = document.createElement('div')
    toast.textContent = message
    toast.className = 'bfm-toast'
    toast.style.cssText = `
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s;
      ${position === 'top' ? 'top: 60px;' : ''}
      ${position === 'center' ? 'top: 50%; transform: translate(-50%, -50%);' : ''}
      ${position === 'bottom' ? 'bottom: 100px;' : ''}
    `

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  },
})
