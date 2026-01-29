/**
 * COT Recharge API
 */

import { apiClient, ApiError } from './client'
import { API_ENDPOINTS } from './config'
import { tronHexToBase58, isTronHexAddress } from '@/lib/tron-address'
import {
  rechargeSupportSchema,
  rechargeSubmitSchema,
  rechargeRecordsSchema,
  rechargeRecordDetailSchema,
  contractTokenInfoSchema,
} from './schemas'
import type {
  RechargeSupportResDto,
  RechargeV2ReqDto,
  RechargeResDto,
  RechargeContractPoolReqDto,
  RechargeContractPoolResDto,
  RechargeRecordsReqDto,
  RechargeRecordsResDto,
  RechargeRecordDetailReqDto,
  RechargeRecordDetailResDto,
  RetryOnChainReqDto,
  ExternalAssetInfoItem,
  ContractTokenInfo,
} from './types'

const tokenInfoCache = new Map<string, ContractTokenInfo>()
const tokenInfoInflight = new Map<string, Promise<ContractTokenInfo>>()

/**
 * Convert TRON hex deposit addresses in ExternalAssetInfoItem to Base58 format.
 * Contract addresses must keep their original hex format for token info API.
 */
async function convertTronAddresses(item: ExternalAssetInfoItem): Promise<ExternalAssetInfoItem> {
  const result = { ...item }
  
  // Convert depositAddress if it's TRON hex format
  if (result.depositAddress && isTronHexAddress(result.depositAddress)) {
    result.depositAddress = await tronHexToBase58(result.depositAddress)
  }
  
  return result
}

/**
 * Transform API response to convert TRON deposit addresses to Base58
 */
async function transformSupportResponse(response: RechargeSupportResDto): Promise<RechargeSupportResDto> {
  const recharge = { ...response.recharge }
  const pending: Array<Promise<void>> = []
  
  for (const chainName of Object.keys(recharge)) {
    const assets = recharge[chainName]
    for (const assetType of Object.keys(assets)) {
      const item = assets[assetType]
      if (item.supportChain?.TRON) {
        const task = convertTronAddresses(item.supportChain.TRON).then((tronAddresses) => {
          item.supportChain = {
            ...item.supportChain,
            TRON: tronAddresses,
          }
        })
        pending.push(task)
      }
    }
  }

  if (pending.length > 0) {
    await Promise.all(pending)
  }

  return { recharge }
}

export const rechargeApi = {
  /** 获取支持的充值配置 (TRON depositAddress converted to Base58) */
  async getSupport(): Promise<RechargeSupportResDto> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.RECHARGE_SUPPORT)
    const parsed = rechargeSupportSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid recharge support response', 0, parsed.error.flatten())
    }
    return transformSupportResponse(parsed.data)
  },

  /** 发起充值（锻造） */
  async submitRecharge(data: RechargeV2ReqDto): Promise<RechargeResDto> {
    const raw = await apiClient.post<unknown>(API_ENDPOINTS.RECHARGE_V2, data)
    const parsed = rechargeSubmitSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid recharge response', 0, parsed.error.flatten())
    }
    return parsed.data
  },

  /** 获取合约代币信息（精度/图标等），按 chainName+contractAddress 缓存 */
  async getTokenInfo(params: { contractAddress: string; chainName: string }): Promise<ContractTokenInfo> {
    const contractAddress = params.contractAddress.trim()
    const chainName = params.chainName.trim()
    const key = `${chainName}:${contractAddress}`.toLowerCase()
    if (tokenInfoCache.has(key)) {
      return tokenInfoCache.get(key) as ContractTokenInfo
    }
    if (tokenInfoInflight.has(key)) {
      return tokenInfoInflight.get(key) as Promise<ContractTokenInfo>
    }

    const task = (async () => {
      const raw = await apiClient.get<unknown>(API_ENDPOINTS.CONTRACT_TOKEN_INFO, {
        contractAddress,
        chainName,
      })
      const parsed = contractTokenInfoSchema.safeParse(raw)
      if (!parsed.success) {
        throw new ApiError('Invalid contract token info response', 0, parsed.error.flatten())
      }
      tokenInfoCache.set(key, parsed.data)
      return parsed.data
    })()

    tokenInfoInflight.set(key, task)
    try {
      return await task
    } finally {
      tokenInfoInflight.delete(key)
    }
  },

  /** 获取合约池信息 */
  getContractPoolInfo(params: RechargeContractPoolReqDto): Promise<RechargeContractPoolResDto> {
    return apiClient.get(API_ENDPOINTS.CONTRACT_POOL_INFO, { internalChainName: params.internalChainName })
  },

  /** 获取充值记录列表 */
  async getRecords(params: RechargeRecordsReqDto): Promise<RechargeRecordsResDto> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.RECHARGE_RECORDS, {
      page: params.page,
      pageSize: params.pageSize,
      internalChain: params.internalChain,
      internalAddress: params.internalAddress,
      recordState: params.recordState,
    })
    const parsed = rechargeRecordsSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid recharge records response', 0, parsed.error.flatten())
    }
    return parsed.data
  },

  /** 获取充值记录详情 */
  async getRecordDetail(params: RechargeRecordDetailReqDto): Promise<RechargeRecordDetailResDto> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.RECHARGE_RECORD_DETAIL, { orderId: params.orderId })
    const parsed = rechargeRecordDetailSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid recharge record detail response', 0, parsed.error.flatten())
    }
    return parsed.data
  },

  /** 外链上链重试 */
  retryExternal(data: RetryOnChainReqDto): Promise<boolean> {
    return apiClient.post(API_ENDPOINTS.RETRY_EXTERNAL, data)
  },

  /** 内链上链重试 */
  retryInternal(data: RetryOnChainReqDto): Promise<boolean> {
    return apiClient.post(API_ENDPOINTS.RETRY_INTERNAL, data)
  },
}
