/**
 * 剪贴板服务 - 类型定义
 *
 * 使用 Schema-first 模式定义服务元信息
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

/** 服务元信息定义 */
export const clipboardServiceMeta = defineServiceMeta('clipboard', (s) =>
  s
    .description('剪贴板服务 - 读写系统剪贴板')
    .api('write', {
      description: '写入文本到剪贴板',
      input: z.object({ text: z.string() }),
      output: z.void(),
    })
    .api('read', {
      description: '从剪贴板读取文本',
      input: z.void(),
      output: z.string(),
    })
)

/** 服务类型 */
export type IClipboardService = typeof clipboardServiceMeta.Type
