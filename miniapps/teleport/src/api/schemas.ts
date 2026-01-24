/**
 * Runtime schemas for Teleport API responses.
 */

import { z } from 'zod'

const stringNumber = z.union([z.string(), z.number()])

const fractionSchema = z.object({
  numerator: stringNumber,
  denominator: stringNumber,
}).passthrough()

const transmitSupportSchema = z.object({
  enable: z.boolean(),
  isAirdrop: z.boolean(),
  assetType: z.string(),
  recipientAddress: z.string(),
  targetChain: z.string(),
  targetAsset: z.string(),
  ratio: fractionSchema,
  transmitDate: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }).passthrough(),
  snapshotHeight: stringNumber.optional(),
  contractAddress: z.string().optional(),
}).passthrough()

export const transmitAssetTypeListSchema = z.object({
  transmitSupport: z.record(z.string(), z.record(z.string(), transmitSupportSchema)),
}).passthrough()

export const transmitSubmitSchema = z.object({
  orderId: z.string(),
}).passthrough()

const recordTxInfoSchema = z.object({
  chainName: z.string(),
  amount: z.string(),
  asset: z.string(),
  decimals: z.number(),
  assetLogoUrl: z.string().optional(),
}).passthrough()

export const transmitRecordsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  dataList: z.array(z.object({
    orderId: z.string(),
    state: z.number(),
    orderState: z.number(),
    createdTime: stringNumber,
    fromTxInfo: recordTxInfoSchema.optional(),
    toTxInfo: recordTxInfoSchema.optional(),
  }).passthrough()),
}).passthrough()

export const transmitRecordDetailSchema = z.object({
  state: z.number(),
  orderState: z.number(),
  updatedTime: stringNumber,
  swapRatio: z.number(),
  orderFailReason: z.string().optional(),
  fromTxInfo: z.object({
    chainName: z.string(),
    address: z.string(),
    txId: z.string().optional(),
    txHash: z.string().optional(),
    contractAddress: z.string().optional(),
  }).passthrough(),
  toTxInfo: z.object({
    chainName: z.string(),
    address: z.string(),
    txId: z.string().optional(),
    txHash: z.string().optional(),
    contractAddress: z.string().optional(),
  }).passthrough(),
}).passthrough()

export const retrySchema = z.boolean()

