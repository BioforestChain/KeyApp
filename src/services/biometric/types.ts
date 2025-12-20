/**
 * 生物识别服务 - 类型定义
 *
 * 使用 Schema-first 模式定义服务元信息
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

/** 生物识别类型 Schema */
const BiometricTypeSchema = z.enum(['fingerprint', 'face', 'iris', 'none'])

/** 生物识别可用性结果 Schema */
const BiometricAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  biometricType: BiometricTypeSchema,
  error: z.string().optional(),
})

/** 生物识别验证选项 Schema */
const BiometricVerifyOptionsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cancelText: z.string().optional(),
  maxAttempts: z.number().optional(),
  fallbackToPassword: z.boolean().optional(),
}).optional()

/** 生物识别验证结果 Schema */
const BiometricVerifyResultSchema = z.object({
  success: z.boolean(),
  errorMessage: z.string().optional(),
})

/** 服务元信息定义 */
export const biometricServiceMeta = defineServiceMeta('biometric', (s) =>
  s
    .description('生物识别服务 - 指纹/面容验证')
    .api('isAvailable', {
      description: '检查生物识别是否可用',
      input: z.void(),
      output: BiometricAvailabilitySchema,
    })
    .api('verify', {
      description: '验证生物识别',
      input: BiometricVerifyOptionsSchema,
      output: BiometricVerifyResultSchema,
    })
)

/** 服务类型 */
export type IBiometricService = typeof biometricServiceMeta.Type

/** 导出 Schema 推导的类型 */
export type BiometricType = z.infer<typeof BiometricTypeSchema>
export type BiometricAvailability = z.infer<typeof BiometricAvailabilitySchema>
export type BiometricVerifyOptions = z.infer<typeof BiometricVerifyOptionsSchema>
export type BiometricVerifyResult = z.infer<typeof BiometricVerifyResultSchema>
