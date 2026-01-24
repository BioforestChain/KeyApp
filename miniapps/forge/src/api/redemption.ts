/**
 * COT Redemption API
 * 赎回接口：内链资产 → 外链资产
 */

import { apiClient, ApiError } from './client'
import { API_ENDPOINTS } from './config'
import {
  redemptionSubmitSchema,
  redemptionRecordsSchema,
  redemptionRecordDetailSchema,
} from './schemas'
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
  async submitRedemption(data: RedemptionV2ReqDto): Promise<RedemptionV2ResDto> {
    const raw = await apiClient.post<unknown>(API_ENDPOINTS.REDEMPTION_V2, data)
    const parsed = redemptionSubmitSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid redemption response', 0, parsed.error.flatten())
    }
    return parsed.data
  },

  /** 获取赎回记录列表 */
  async getRecords(params: RedemptionRecordsReqDto): Promise<RedemptionRecordsResDto> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.REDEMPTION_RECORDS, {
      page: params.page,
      pageSize: params.pageSize,
      internalChain: params.internalChain,
      internalAddress: params.internalAddress,
    })
    const parsed = redemptionRecordsSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid redemption records response', 0, parsed.error.flatten())
    }
    return parsed.data
  },

  /** 获取赎回记录详情 */
  async getRecordDetail(params: RedemptionRecordDetailReqDto): Promise<RedemptionRecordDetailResDto> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.REDEMPTION_RECORD_DETAIL, { orderId: params.orderId })
    const parsed = redemptionRecordDetailSchema.safeParse(raw)
    if (!parsed.success) {
      throw new ApiError('Invalid redemption record detail response', 0, parsed.error.flatten())
    }
    return parsed.data
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
