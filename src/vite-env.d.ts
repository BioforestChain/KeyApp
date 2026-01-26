/// <reference types="vite/client" />


declare global {
  /** Mock 模式标识 - 通过 vite.config.ts define 配置 */
  const __MOCK_MODE__: boolean

  /** Dev 模式标识 - 通过 vite.config.ts define 配置 */
  const __DEV_MODE__: boolean

  /** App 版本号 - 通过 vite.config.ts define 配置 */
  const __APP_VERSION__: string

  /** API Keys 映射 - 通过 vite.config.ts / Storybook viteFinal define 配置 */
  const __API_KEYS__: Record<string, string>

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

export { }
