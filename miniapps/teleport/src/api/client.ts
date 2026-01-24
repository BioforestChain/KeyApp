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
import {
  transmitAssetTypeListSchema,
  transmitSubmitSchema,
  transmitRecordsSchema,
  transmitRecordDetailSchema,
  retrySchema,
} from './schemas'

const API_BASE_URL = 'https://api.eth-metaverse.com/payment'

type WrappedResponse = {
  success: boolean
  result?: unknown
  error?: unknown
  message?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWrappedResponse(value: unknown): value is WrappedResponse {
  return (
    isRecord(value) &&
    'success' in value &&
    typeof (value as { success: unknown }).success === 'boolean'
  )
}

function extractWrappedErrorMessage(data: WrappedResponse): string {
  if (data.message) return data.message
  if (isRecord(data.error) && 'message' in data.error) {
    const message = (data.error as { message?: unknown }).message
    if (Array.isArray(message)) return message.join('; ')
    if (typeof message === 'string') return message
  }
  return 'Request failed'
}

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

async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> {
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

  const data: unknown = await response.json()
  if (isWrappedResponse(data)) {
    if (data.success) return data.result
    throw new ApiError(extractWrappedErrorMessage(data), response.status, data.error ?? data)
  }

  return data
}

/**
 * 获取传送配置（支持的链/币种/比例等）
 * GET /payment/transmit/assetTypeList
 */
export async function getTransmitAssetTypeList(): Promise<TransmitAssetTypeListResponse> {
  const data = await request('/transmit/assetTypeList')
  const parsed = transmitAssetTypeListSchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiError('Invalid transmit asset list response', 0, parsed.error.flatten())
  }
  return parsed.data
}

/**
 * 发起传送
 * POST /payment/transmit
 */
export async function transmit(data: TransmitRequest): Promise<TransmitResponse> {
  const res = await request('/transmit', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const parsed = transmitSubmitSchema.safeParse(res)
  if (!parsed.success) {
    throw new ApiError('Invalid transmit response', 0, parsed.error.flatten())
  }
  return parsed.data
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

  const data = await request(`/transmit/records?${searchParams}`)
  const parsed = transmitRecordsSchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiError('Invalid transmit records response', 0, parsed.error.flatten())
  }
  return parsed.data
}

/**
 * 获取传送记录详情
 * GET /payment/transmit/recordDetail
 */
export async function getTransmitRecordDetail(
  orderId: string,
): Promise<TransmitRecordDetail> {
  const data = await request(`/transmit/recordDetail?orderId=${encodeURIComponent(orderId)}`)
  const parsed = transmitRecordDetailSchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiError('Invalid transmit record detail response', 0, parsed.error.flatten())
  }
  return parsed.data
}

/**
 * 重试发送方交易上链
 * POST /payment/transmit/retryFromTxOnChain
 */
export async function retryFromTxOnChain(orderId: string): Promise<RetryResponse> {
  const data = await request('/transmit/retryFromTxOnChain', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
  const parsed = retrySchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiError('Invalid retry response', 0, parsed.error.flatten())
  }
  return parsed.data
}

/**
 * 重试接收方交易上链
 * POST /payment/transmit/retryToTxOnChain
 */
export async function retryToTxOnChain(orderId: string): Promise<RetryResponse> {
  const data = await request('/transmit/retryToTxOnChain', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
  const parsed = retrySchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiError('Invalid retry response', 0, parsed.error.flatten())
  }
  return parsed.data
}

export { ApiError }
