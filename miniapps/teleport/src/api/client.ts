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
import { buildPaymentUrl } from './config'
import {
  transmitAssetTypeListSchema,
  transmitSubmitSchema,
  transmitRecordsSchema,
  transmitRecordDetailSchema,
  retrySchema,
} from './schemas'

const TRANSMIT_API_REQUEST = {
  TRANSMIT: '/transmit',
  RETRY_FROM_TX_ONCHAIN: '/transmit/retryFromTxOnChain',
  RETRY_TO_TX_ONCHAIN: '/transmit/retryToTxOnChain',
  RECORDS: '/transmit/records',
  RECORD_DETAIL: '/transmit/recordDetail',
  ASSET_TYPE_LIST: '/transmit/assetTypeList',
} as const

type ApiEnvelope = {
  success: boolean
  result?: unknown
  error?: { message?: string }
  message?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return (
    isRecord(value) &&
    'success' in value &&
    typeof (value as { success: unknown }).success === 'boolean'
  )
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

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '')
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function unwrapResponse(data: unknown, status: number): unknown {
  if (isApiEnvelope(data)) {
    if (data.success) {
      if ('result' in data) return data.result
      return data
    }
    const message =
      (data.error && typeof data.error.message === 'string' && data.error.message) ||
      (typeof data.message === 'string' && data.message) ||
      'Request failed'
    throw new ApiError(message, status, data)
  }
  return data
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = buildPaymentUrl(endpoint)

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return unwrapResponse(data, response.status) as T
}

/**
 * 获取传送配置（支持的链/币种/比例等）
 * GET /payment/transmit/assetTypeList
 */
export async function getTransmitAssetTypeList(): Promise<TransmitAssetTypeListResponse> {
  const data = await request(TRANSMIT_API_REQUEST.ASSET_TYPE_LIST)
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
  const res = await request(TRANSMIT_API_REQUEST.TRANSMIT, {
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

  const data = await request(`${TRANSMIT_API_REQUEST.RECORDS}?${searchParams}`)
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
  const data = await request(
    `${TRANSMIT_API_REQUEST.RECORD_DETAIL}?orderId=${encodeURIComponent(orderId)}`,
  )
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
  const data = await request(TRANSMIT_API_REQUEST.RETRY_FROM_TX_ONCHAIN, {
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
  const data = await request(TRANSMIT_API_REQUEST.RETRY_TO_TX_ONCHAIN, {
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
