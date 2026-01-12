/**
 * COT Redemption API
 * 赎回接口：内链资产 → 外链资产
 */

import { apiClient } from './client'
import { API_ENDPOINTS } from './config'
import type {
  RedemptionV2ReqDto,
  RedemptionV2ResDto,
  RedemptionRecordsReqDto,
  RedemptionRecordsResDto,
  RedemptionRecordDetailReqDto,
  RedemptionRecordDetailResDto,
  RetryOnChainReqDto,
} from './types'

export const redemptionApi = {
  /** 发起赎回 */
  submitRedemption(data: RedemptionV2ReqDto): Promise<RedemptionV2ResDto> {
    return apiClient.post(API_ENDPOINTS.REDEMPTION_V2, data)
  },

  /** 获取赎回记录列表 */
  getRecords(params: RedemptionRecordsReqDto): Promise<RedemptionRecordsResDto> {
    return apiClient.get(API_ENDPOINTS.REDEMPTION_RECORDS, {
      page: params.page,
      pageSize: params.pageSize,
      internalChain: params.internalChain,
      internalAddress: params.internalAddress,
    })
  },

  /** 获取赎回记录详情 */
  getRecordDetail(params: RedemptionRecordDetailReqDto): Promise<RedemptionRecordDetailResDto> {
    return apiClient.get(API_ENDPOINTS.REDEMPTION_RECORD_DETAIL, { orderId: params.orderId })
  },

  /** 内链上链重试 */
  retryInternal(data: RetryOnChainReqDto): Promise<boolean> {
    return apiClient.post(API_ENDPOINTS.REDEMPTION_RETRY_INTERNAL, data)
  },

  /** 外链上链重试 */
  retryExternal(data: RetryOnChainReqDto): Promise<boolean> {
    return apiClient.post(API_ENDPOINTS.REDEMPTION_RETRY_EXTERNAL, data)
  },
}
