/**
 * COT Recharge API
 */

import { apiClient } from './client'
import { API_ENDPOINTS } from './config'
import { tronHexToBase58, isTronHexAddress } from '@/lib/tron-address'
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
  
  for (const chainName of Object.keys(recharge)) {
    const assets = recharge[chainName]
    for (const assetType of Object.keys(assets)) {
      const item = assets[assetType]
      if (item.supportChain?.TRON) {
        item.supportChain = {
          ...item.supportChain,
          TRON: await convertTronAddresses(item.supportChain.TRON),
        }
      }
    }
  }
  
  return { recharge }
}

export const rechargeApi = {
  /** 获取支持的充值配置 (TRON addresses converted to Base58) */
  async getSupport(): Promise<RechargeSupportResDto> {
    const response = await apiClient.get<RechargeSupportResDto>(API_ENDPOINTS.RECHARGE_SUPPORT)
    return transformSupportResponse(response)
  },

  /** 发起充值（锻造） */
  submitRecharge(data: RechargeV2ReqDto): Promise<RechargeResDto> {
    return apiClient.post(API_ENDPOINTS.RECHARGE_V2, data)
  },

  /** 获取合约池信息 */
  getContractPoolInfo(params: RechargeContractPoolReqDto): Promise<RechargeContractPoolResDto> {
    return apiClient.get(API_ENDPOINTS.CONTRACT_POOL_INFO, { internalChainName: params.internalChainName })
  },

  /** 获取充值记录列表 */
  getRecords(params: RechargeRecordsReqDto): Promise<RechargeRecordsResDto> {
    return apiClient.get(API_ENDPOINTS.RECORDS, {
      page: params.page,
      pageSize: params.pageSize,
      internalChain: params.internalChain,
      internalAddress: params.internalAddress,
      recordState: params.recordState,
    })
  },

  /** 获取充值记录详情 */
  getRecordDetail(params: RechargeRecordDetailReqDto): Promise<RechargeRecordDetailResDto> {
    return apiClient.get(API_ENDPOINTS.RECORD_DETAIL, { orderId: params.orderId })
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
