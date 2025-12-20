/**
 * 相机服务 - 类型定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const ScanResultSchema = z.object({
  content: z.string(),
  format: z.string().optional(),
})

export const cameraServiceMeta = defineServiceMeta('camera', (s) =>
  s
    .description('相机服务 - 扫描二维码')
    .api('scanQRCode', {
      description: '扫描二维码',
      input: z.void(),
      output: ScanResultSchema,
    })
    .api('checkPermission', {
      description: '检查相机权限',
      input: z.void(),
      output: z.boolean(),
    })
    .api('requestPermission', {
      description: '请求相机权限',
      input: z.void(),
      output: z.boolean(),
    })
)

export type ICameraService = typeof cameraServiceMeta.Type
export type ScanResult = z.infer<typeof ScanResultSchema>
