/**
 * 触觉反馈服务 - 类型定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const HapticTypeSchema = z.enum(['light', 'medium', 'heavy', 'success', 'warning', 'error']).optional()

export const hapticsServiceMeta = defineServiceMeta('haptics', (s) =>
  s
    .description('触觉反馈服务')
    .api('impact', {
      description: '触发触觉反馈',
      input: HapticTypeSchema,
      output: z.void(),
    })
    .api('vibrate', {
      description: '振动指定时长',
      input: z.number().optional(),
      output: z.void(),
    })
)

export type IHapticsService = typeof hapticsServiceMeta.Type
export type HapticType = z.infer<typeof HapticTypeSchema>
