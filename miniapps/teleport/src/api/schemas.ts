/**
 * Runtime schemas for Teleport API responses.
 */

import { z } from 'zod'
import type {
  ChainName,
  InternalAssetType,
  InternalChainName,
} from './types'
import { SWAP_ORDER_STATE_ID, SWAP_RECORD_STATE } from './types'

const stringNumber = z.union([z.string(), z.number()])

const chainNameSchema = z.custom<ChainName>((value) => typeof value === 'string')
const internalChainNameSchema = z.custom<InternalChainName>(
  (value) => typeof value === 'string',
)
const internalAssetTypeSchema = z.custom<InternalAssetType>(
  (value) => typeof value === 'string',
)

const fractionSchema = z.object({
  numerator: stringNumber,
  denominator: stringNumber,
})

const snapshotHeightSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }
  return value
}, z.number())

const transmitSupportSchema = z.object({
  enable: z.boolean(),
  isAirdrop: z.boolean(),
  assetType: z.string(),
  recipientAddress: z.string(),
  targetChain: internalChainNameSchema,
  targetAsset: internalAssetTypeSchema,
  ratio: fractionSchema,
  transmitDate: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  snapshotHeight: snapshotHeightSchema.optional(),
  contractAddress: z.string().optional(),
})

export const transmitAssetTypeListSchema = z.object({
  transmitSupport: z.record(z.string(), z.record(z.string(), transmitSupportSchema)),
})

export const transmitSubmitSchema = z.object({
  orderId: z.string(),
})

const recordTxInfoSchema = z.object({
  chainName: chainNameSchema,
  amount: z.string(),
  asset: z.string(),
  decimals: z.number(),
  assetLogoUrl: z.string().optional(),
})

export const transmitRecordsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  dataList: z.array(z.object({
    orderId: z.string(),
    state: z.nativeEnum(SWAP_RECORD_STATE),
    orderState: z.nativeEnum(SWAP_ORDER_STATE_ID),
    createdTime: stringNumber,
    fromTxInfo: recordTxInfoSchema.optional(),
    toTxInfo: recordTxInfoSchema.optional(),
  })),
})

export const transmitRecordDetailSchema = z.object({
  state: z.nativeEnum(SWAP_RECORD_STATE),
  orderState: z.nativeEnum(SWAP_ORDER_STATE_ID),
  updatedTime: stringNumber,
  swapRatio: z.number(),
  orderFailReason: z.string().optional(),
  fromTxInfo: z.object({
    chainName: chainNameSchema,
    address: z.string(),
    txId: z.string().optional(),
    txHash: z.string().optional(),
    contractAddress: z.string().optional(),
  }).optional(),
  toTxInfo: z.object({
    chainName: chainNameSchema,
    address: z.string(),
    txId: z.string().optional(),
    txHash: z.string().optional(),
    contractAddress: z.string().optional(),
  }).optional(),
})

export const retrySchema = z.boolean()
