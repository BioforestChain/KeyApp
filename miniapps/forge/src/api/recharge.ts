/**
 * COT Recharge API
 */

import { apiClient } from './client'
import { API_ENDPOINTS } from './config'
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
} from './types'

export const rechargeApi = {
  /** 获取支持的充值配置 */
  getSupport(): Promise<RechargeSupportResDto> {
    return apiClient.get(API_ENDPOINTS.RECHARGE_SUPPORT)
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
