/**
 * BioForest API Response Schemas
 * 
 * 用于验证外部 API 返回的数据
 */

import { z } from 'zod'

/** 单个资产信息 */
const AssetInfoSchema = z.object({
  assetNumber: z.string(),
  assetType: z.string().min(1),
  sourceChainMagic: z.string(),
  sourceChainName: z.string(),
  iconUrl: z.string().optional(),
})

/** POST /wallet/{chainId}/address/asset 响应 */
export const AddressAssetsResponseSchema = z.object({
  success: z.boolean(),
  result: z
    .object({
      address: z.string(),
      assets: z.record(z.string(), z.record(z.string(), AssetInfoSchema)),
      forgingRewards: z.string().optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      info: z.string().optional(),
    })
    .optional(),
})

export type AddressAssetsResponse = z.infer<typeof AddressAssetsResponseSchema>
