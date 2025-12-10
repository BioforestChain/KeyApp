import { Buffer } from 'buffer'

// 注入全局 Buffer
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

export {}
