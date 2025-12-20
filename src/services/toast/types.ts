/**
 * Toast 服务 - 类型定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const ToastPositionSchema = z.enum(['top', 'center', 'bottom'])

const ToastOptionsSchema = z.union([
  z.string(),
  z.object({
    message: z.string(),
    duration: z.number().optional(),
    position: ToastPositionSchema.optional(),
  }),
])

export const toastServiceMeta = defineServiceMeta('toast', (s) =>
  s
    .description('Toast 提示服务')
    .api('show', {
      description: '显示 Toast 提示',
      input: ToastOptionsSchema,
      output: z.void(),
    })
)

export type IToastService = typeof toastServiceMeta.Type
export type ToastPosition = z.infer<typeof ToastPositionSchema>
export type ToastOptions = z.infer<typeof ToastOptionsSchema>
