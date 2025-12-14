/**
 * Web 平台货币兑换服务实现
 * 使用 Frankfurter API 获取实时汇率
 *
 * API 文档: https://www.frankfurter.app/docs/
 * - 免费、无需密钥
 * - 支持 30+ 货币
 * - 数据来源于欧洲央行
 */

import type { ICurrencyExchangeService, ExchangeRateResponse, FrankfurterApiResponse } from './types'

/** Frankfurter API 基础 URL */
const FRANKFURTER_API_BASE = 'https://api.frankfurter.app'

/** API 请求超时时间 (毫秒) */
const REQUEST_TIMEOUT = 10000

export class CurrencyExchangeService implements ICurrencyExchangeService {
  async getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRateResponse> {
    // 过滤掉与基准货币相同的目标货币
    const filteredTargets = targetCurrencies.filter(c => c !== baseCurrency)

    // 如果没有需要查询的目标货币，返回空结果
    if (filteredTargets.length === 0) {
      const now = new Date()
      const datePart = now.toISOString().split('T')[0]
      return {
        base: baseCurrency,
        date: datePart ?? now.toISOString().slice(0, 10),
        rates: {},
      }
    }

    // 构建 API URL
    const params = new URLSearchParams({
      from: baseCurrency,
      to: filteredTargets.join(','),
    })
    const url = `${FRANKFURTER_API_BASE}/latest?${params.toString()}`

    // 发起请求 (带超时)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Frankfurter API error: ${response.status} ${response.statusText}`)
      }

      const data: FrankfurterApiResponse = await response.json()

      // 转换为标准响应格式
      return {
        base: data.base,
        date: data.date,
        rates: data.rates,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Exchange rate request timeout')
        }
        throw error
      }

      throw new Error('Failed to fetch exchange rates')
    }
  }
}
