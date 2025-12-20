/// <reference types="vite/client" />

import { Buffer } from 'buffer'

declare global {
  /** Mock 模式标识 - 通过 vite.config.ts define 配置 */
  const __MOCK_MODE__: boolean

  interface Window {
    Buffer: typeof Buffer
  }
  var Buffer: typeof Buffer
}

/** 编译时服务实现替换 - 通过 vite.config.ts alias 配置 */
declare module '#services-impl' {
  import type { IServices } from '@/services/types'
  export function createServices(): IServices
}
