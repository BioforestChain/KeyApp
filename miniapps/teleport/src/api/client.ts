/**
 * Teleport API Client
 * 对接 MetaBox payment 后端
 */

import type {
  TransmitAssetTypeListResponse,
  TransmitRequest,
  TransmitResponse,
  TransmitRecordsRequest,
  TransmitRecordsResponse,
  TransmitRecordDetail,
  RetryResponse,
} from './types'

const API_BASE_URL = 'https://api.eth-metaverse.com/payment'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(
      data?.message || `HTTP ${response.status}`,
      response.status,
      data,
    )
  }

  return response.json()
}

/**
 * 获取传送配置（支持的链/币种/比例等）
 * GET /payment/transmit/assetTypeList
 */
export async function getTransmitAssetTypeList(): Promise<TransmitAssetTypeListResponse> {
  return request<TransmitAssetTypeListResponse>('/transmit/assetTypeList')
}

/**
 * 发起传送
 * POST /payment/transmit
 */
export async function transmit(data: TransmitRequest): Promise<TransmitResponse> {
  return request<TransmitResponse>('/transmit', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取传送记录列表
 * GET /payment/transmit/records
 */
export async function getTransmitRecords(
  params: TransmitRecordsRequest,
): Promise<TransmitRecordsResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('pageSize', String(params.pageSize))
  if (params.fromChain) searchParams.set('fromChain', params.fromChain)
  if (params.fromAddress) searchParams.set('fromAddress', params.fromAddress)
  if (params.fromAsset) searchParams.set('fromAsset', params.fromAsset)

  return request<TransmitRecordsResponse>(`/transmit/records?${searchParams}`)
}

/**
 * 获取传送记录详情
 * GET /payment/transmit/recordDetail
 */
export async function getTransmitRecordDetail(
  orderId: string,
): Promise<TransmitRecordDetail> {
  return request<TransmitRecordDetail>(
    `/transmit/recordDetail?orderId=${encodeURIComponent(orderId)}`,
  )
}

/**
 * 重试发送方交易上链
 * POST /payment/transmit/retryFromTxOnChain
 */
export async function retryFromTxOnChain(orderId: string): Promise<RetryResponse> {
  return request<RetryResponse>('/transmit/retryFromTxOnChain', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
}

/**
 * 重试接收方交易上链
 * POST /payment/transmit/retryToTxOnChain
 */
export async function retryToTxOnChain(orderId: string): Promise<RetryResponse> {
  return request<RetryResponse>('/transmit/retryToTxOnChain', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
}

export { ApiError }
