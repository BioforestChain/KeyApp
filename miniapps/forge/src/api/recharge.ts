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
} from './types'

/**
 * Convert TRON hex addresses in ExternalAssetInfoItem to Base58 format
 */
async function convertTronAddresses(item: ExternalAssetInfoItem): Promise<ExternalAssetInfoItem> {
  const result = { ...item }
  
  // Convert depositAddress if it's TRON hex format
  if (result.depositAddress && isTronHexAddress(result.depositAddress)) {
    result.depositAddress = await tronHexToBase58(result.depositAddress)
  }
  
  // Convert contract address if it's TRON hex format
  if (result.contract && isTronHexAddress(result.contract)) {
    result.contract = await tronHexToBase58(result.contract)
  }
  
  return result
}

/**
 * Transform API response to convert all TRON hex addresses to Base58
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
  /** 获取支持的充值配置 (TRON addresses converted to Base58) */
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
