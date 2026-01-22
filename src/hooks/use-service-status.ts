/**
 * 统一服务状态判断 Hook
 * 
 * 根据错误类型判断服务状态，返回本地化的错误原因
 */

import { useMemo } from 'react'
import { NoSupportError, ServiceLimitedError } from '@biochain/key-fetch'
import type { TFunction } from 'i18next'

export interface ServiceStatus {
  /** Provider 是否实现了此能力 */
  supported: boolean
  /** API 是否受限（如免费版不支持） */
  limited: boolean
  /** 其他错误 */
  error?: Error
  /** 本地化的错误原因 */
  reason?: string
  /** 服务状态类型 */
  type: 'ok' | 'notSupported' | 'limited' | 'error'
}

/**
 * 根据错误类型判断服务状态
 * 
 * @param error - useKeyFetch 返回的 error
 * @param t - i18n 翻译函数
 * @returns ServiceStatus 对象
 * 
 * @example
 * ```tsx
 * const { data, error } = chainProvider.transactionHistory.useState(...)
 * const status = useServiceStatus(error, t)
 * 
 * if (status.limited) {
 *   return <ServiceStatusAlert type="limited" />
 * }
 * ```
 */
export function useServiceStatus(error: Error | undefined, t: TFunction): ServiceStatus {
  return useMemo(() => {
    if (!error) {
      return { supported: true, limited: false, type: 'ok' as const }
    }
    if (error instanceof NoSupportError) {
      return {
        supported: false,
        limited: false,
        type: 'notSupported' as const,
        reason: t('common:service.notSupported'),
      }
    }
    if (error instanceof ServiceLimitedError) {
      return {
        supported: true,
        limited: true,
        type: 'limited' as const,
        reason: t('common:service.limited'),
      }
    }
    return {
      supported: true,
      limited: false,
      type: 'error' as const,
      error,
      reason: error.message,
    }
  }, [error, t])
}

/**
 * 纯函数版本（不使用 useMemo）
 * 用于非 React 环境或需要手动控制的场景
 */
export function getServiceStatus(error: Error | undefined): Omit<ServiceStatus, 'reason'> {
  if (!error) {
    return { supported: true, limited: false, type: 'ok' }
  }
  if (error instanceof NoSupportError) {
    return { supported: false, limited: false, type: 'notSupported' }
  }
  if (error instanceof ServiceLimitedError) {
    return { supported: true, limited: true, type: 'limited' }
  }
  return { supported: true, limited: false, type: 'error', error }
}
