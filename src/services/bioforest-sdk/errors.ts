/**
 * BioForest SDK Errors
 * 
 * 广播错误类和错误码翻译
 */

import i18n from '@/i18n'

/** 广播错误类 */
export class BroadcastError extends Error {
  /** 是否可重试（网络超时等临时错误） */
  public readonly isRetryable: boolean

  constructor(
    public readonly code: string | undefined,
    message: string,
    public readonly minFee?: string
  ) {
    super(message)
    this.name = 'BroadcastError'

    // 判断是否可重试
    this.isRetryable = isRetryableError(code, message)
  }
}

/**
 * 判断错误是否可重试
 * 网络超时、连接失败等临时错误可以重试
 * 余额不足、手续费不足等业务错误不应重试
 */
function isRetryableError(code: string | undefined, message: string): boolean {
  // 永久失败的错误码（业务错误）
  const permanentErrorCodes = [
    '001-11028', // Asset not enough
    '001-11029', // Fee not enough
    '002-41011', // Transaction fee is not enough
    '001-00034', // Transaction already exists (though this is treated as success)
  ]

  if (code && permanentErrorCodes.includes(code)) {
    return false
  }

  // 检查消息中的临时错误关键词
  const lowerMessage = message.toLowerCase()
  const retryableKeywords = [
    'timeout',
    'timed out',
    'network',
    'connection',
    'econnrefused',
    'enotfound',
    'socket',
    'fetch failed',
    'failed to fetch',
  ]

  if (retryableKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return true
  }

  // 检查消息中的永久错误关键词
  const permanentKeywords = [
    'insufficient',
    'not enough',
    'rejected',
    'invalid',
    'expired',
  ]

  if (permanentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return false
  }

  // 默认：无错误码的未知错误假设可重试
  return code === undefined
}

/** 广播结果类型 */
export interface BroadcastResult {
  txHash: string
  /** 交易已存在于链上（重复广播），应直接标记为 confirmed */
  alreadyExists: boolean
}

/** 错误码到 i18n key 的映射 */
const BROADCAST_ERROR_I18N_KEYS: Record<string, string> = {
  '001-11028': 'transaction:broadcast.assetNotEnough',
  '001-11029': 'transaction:broadcast.feeNotEnough',
  '002-41011': 'transaction:broadcast.feeNotEnough',
  '001-00034': 'transaction:broadcast.alreadyExists',
  '001-11038': 'transaction:broadcast.forbidden',
  '001-11039': 'transaction:broadcast.assetNotExist',
  '001-22001': 'transaction:broadcast.invalidParams',
  '001-11067': 'transaction:broadcast.accountFrozen',
}

/**
 * 获取错误码对应的 i18n key
 */
export function getBroadcastErrorI18nKey(code: string | undefined): string | null {
  if (!code) return null
  return BROADCAST_ERROR_I18N_KEYS[code] ?? null
}

/**
 * 翻译广播错误为用户友好的消息
 */
export function translateBroadcastError(err: BroadcastError): string {
  // 1. 尝试通过错误码翻译
  const i18nKey = getBroadcastErrorI18nKey(err.code)
  if (i18nKey && i18n.exists(i18nKey)) {
    return i18n.t(i18nKey, i18nKey)
  }

  // 2. 尝试从原始消息中识别错误类型
  const message = err.message.toLowerCase()
  if (message.includes('asset not enough') || message.includes('insufficient')) {
    return i18n.t('transaction:broadcast.assetNotEnough')
  }
  if (message.includes('fee')) {
    return i18n.t('transaction:broadcast.feeNotEnough')
  }
  if (message.includes('rejected')) {
    return i18n.t('transaction:broadcast.rejected')
  }

  // 3. 使用原始消息或默认消息
  return err.message || i18n.t('transaction:broadcast.unknown')
}
