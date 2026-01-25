import { z } from 'zod'
import type { TransmitAssetTypeListResponse } from './types'

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date string',
  })

const fractionSchema = z.object({
  numerator: z.union([z.string(), z.number()]),
  denominator: z.union([z.string(), z.number()]),
})

const transmitSupportSchema = z.object({
  enable: z.boolean(),
  isAirdrop: z.boolean().optional().default(false),
  assetType: z.string(),
  recipientAddress: z.string(),
  targetChain: z.string(),
  targetAsset: z.string(),
  ratio: fractionSchema,
  transmitDate: z.object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  }),
  snapshotHeight: z.coerce.number().optional(),
  contractAddress: z.string().optional(),
})

const transmitSupportItemSchema = z.record(z.string(), transmitSupportSchema)

const transmitAssetTypeListSchema = z.object({
  transmitSupport: z.record(z.string(), transmitSupportItemSchema.optional()),
})

export function parseTransmitAssetTypeList(value: unknown): TransmitAssetTypeListResponse {
  const parsed = transmitAssetTypeListSchema.safeParse(value)
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid transmit config: ${detail}`)
  }
  return parsed.data as TransmitAssetTypeListResponse
}
