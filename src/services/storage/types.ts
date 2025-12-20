/**
 * 安全存储服务 - 类型定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

/** 服务元信息定义 */
export const secureStorageServiceMeta = defineServiceMeta('secureStorage', (s) =>
  s
    .description('安全存储服务 - 加密存储键值对')
    .api('set', {
      description: '存储数据',
      input: z.object({ key: z.string(), value: z.string() }),
      output: z.void(),
    })
    .api('get', {
      description: '获取数据',
      input: z.object({ key: z.string() }),
      output: z.string().nullable(),
    })
    .api('remove', {
      description: '删除数据',
      input: z.object({ key: z.string() }),
      output: z.void(),
    })
    .api('has', {
      description: '检查是否存在',
      input: z.object({ key: z.string() }),
      output: z.boolean(),
    })
    .api('clear', {
      description: '清空存储',
      input: z.void(),
      output: z.void(),
    })
)

/** 服务类型 */
export type ISecureStorageService = typeof secureStorageServiceMeta.Type
