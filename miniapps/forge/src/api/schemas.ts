/**
 * Runtime schemas for Forge API responses.
 */

import { z } from 'zod'

const stringNumber = z.union([z.string(), z.number()])

const externalAssetInfoItemSchema = z.object({
  enable: z.boolean(),
  contract: z.string().optional(),
  depositAddress: z.string(),
  assetType: z.string(),
  logo: z.string().optional(),
  decimals: z.coerce.number().optional(),
}).passthrough()

const redemptionConfigSchema = z.object({
  enable: z.boolean(),
  min: stringNumber,
  max: stringNumber,
  fee: z.record(z.string(), z.string()),
  radioFee: z.string(),
}).passthrough()

const rechargeItemSchema = z.object({
  enable: z.boolean(),
  chainName: z.string(),
  assetType: z.string(),
  applyAddress: z.string(),
  supportChain: z.object({
    ETH: externalAssetInfoItemSchema.optional(),
    BSC: externalAssetInfoItemSchema.optional(),
    TRON: externalAssetInfoItemSchema.optional(),
  }).passthrough(),
  redemption: redemptionConfigSchema.optional(),
  logo: z.string().optional(),
}).passthrough()

export const rechargeSupportSchema = z.object({
  recharge: z.record(z.string(), z.record(z.string(), rechargeItemSchema)),
}).passthrough()

export const rechargeSubmitSchema = z.object({
  orderId: z.string(),
}).passthrough()

const recordTxInfoSchema = z.object({
  chainName: z.string(),
  assetType: z.string(),
  address: z.string(),
  amount: z.string(),
  txHash: z.string().optional(),
}).passthrough()

export const rechargeRecordsSchema = z.object({
  dataList: z.array(z.object({
    orderId: z.string(),
    state: z.number(),
    orderState: z.number(),
    createdTime: stringNumber,
    fromTxInfo: recordTxInfoSchema,
    toTxInfoArray: z.array(recordTxInfoSchema),
  }).passthrough()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
  skip: z.number(),
}).passthrough()

export const rechargeRecordDetailSchema = z.object({
  orderId: z.string(),
  state: z.number(),
  orderState: z.number(),
  createdTime: stringNumber,
  fromTxInfo: recordTxInfoSchema,
  toTxInfos: z.record(z.string(), recordTxInfoSchema),
}).passthrough()

export const redemptionSubmitSchema = z.object({
  orderId: z.string(),
}).passthrough()

export const redemptionRecordsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  dataList: z.array(z.object({
    orderId: z.string(),
    state: z.number(),
    orderState: z.number(),
    redemptionFee: z.string().optional(),
    createdTime: stringNumber,
    fromTxInfo: z.object({
      chainName: z.string(),
      amount: z.string(),
      asset: z.string(),
      decimals: z.number(),
    }).passthrough(),
    toTxInfo: z.object({
      chainName: z.string(),
      amount: z.string(),
      asset: z.string(),
      decimals: z.number(),
    }).passthrough(),
  }).passthrough()),
  total: z.number(),
  hasMore: z.boolean(),
  skip: z.number(),
}).passthrough()

export const redemptionRecordDetailSchema = z.object({
  state: z.number(),
  orderState: z.number(),
  redemptionRatio: z.number(),
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
