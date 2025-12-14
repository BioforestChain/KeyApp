/**
 * Mock 货币兑换服务实现
 * 使用静态汇率数据，用于测试和 Storybook
 */

import type { ICurrencyExchangeService, ExchangeRateResponse } from './types'

/** 静态汇率数据 (以 USD 为基准) */
const MOCK_USD_RATES: Record<string, number> = {
  CNY: 7.24,
  EUR: 0.95,
  JPY: 149.50,
  KRW: 1320.00,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  TWD: 31.50,
  THB: 35.20,
  INR: 83.50,
  MYR: 4.72,
  PHP: 56.20,
}

/** 获取模拟的当前日期 (YYYY-MM-DD 格式) */
function getMockDate(): string {
  const now = new Date()
  const datePart = now.toISOString().split('T')[0]
  // TypeScript strict mode: split can return undefined elements
  return datePart ?? now.toISOString().slice(0, 10)
}

/**
 * 根据基准货币计算汇率
 * 通过 USD 作为中间货币进行转换
 */
function calculateRates(baseCurrency: string, targetCurrencies: string[]): Record<string, number> {
  const rates: Record<string, number> = {}

  // 如果基准货币是 USD，直接返回对应汇率
  if (baseCurrency === 'USD') {
    for (const target of targetCurrencies) {
      if (target === 'USD') {
        rates[target] = 1
      } else if (MOCK_USD_RATES[target] !== undefined) {
        rates[target] = MOCK_USD_RATES[target]
      }
    }
    return rates
  }

  // 获取基准货币对 USD 的汇率 (1 baseCurrency = ? USD)
  const baseToUsd = MOCK_USD_RATES[baseCurrency]
  if (baseToUsd === undefined) {
    // 不支持的基准货币，返回空
    return rates
  }

  // 计算 1 USD = ? baseCurrency (反转汇率)
  const usdToBase = 1 / baseToUsd

  for (const target of targetCurrencies) {
    if (target === baseCurrency) {
      rates[target] = 1
    } else if (target === 'USD') {
      rates[target] = usdToBase
    } else if (MOCK_USD_RATES[target] !== undefined) {
      // 通过 USD 中转: baseCurrency -> USD -> targetCurrency
      rates[target] = MOCK_USD_RATES[target] * usdToBase
    }
  }

  return rates
}

export class CurrencyExchangeService implements ICurrencyExchangeService {
  async getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRateResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      base: baseCurrency,
      date: getMockDate(),
      rates: calculateRates(baseCurrency, targetCurrencies),
    }
  }
}
