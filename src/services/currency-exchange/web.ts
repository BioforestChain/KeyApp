/**
 * 货币兑换服务 - Web 平台实现
 * 使用 Frankfurter API
 */

import { currencyExchangeServiceMeta, type FrankfurterApiResponse } from './types'

const FRANKFURTER_API_BASE = 'https://api.frankfurter.app'
const REQUEST_TIMEOUT = 10000

export const currencyExchangeService = currencyExchangeServiceMeta.impl({
  async getExchangeRates({ baseCurrency, targetCurrencies }) {
    const filteredTargets = targetCurrencies.filter(c => c !== baseCurrency)

    if (filteredTargets.length === 0) {
      const now = new Date()
      const datePart = now.toISOString().split('T')[0]
      return {
        base: baseCurrency,
        date: datePart ?? now.toISOString().slice(0, 10),
        rates: {},
      }
    }

    const params = new URLSearchParams({
      from: baseCurrency,
      to: filteredTargets.join(','),
    })
    const url = `${FRANKFURTER_API_BASE}/latest?${params.toString()}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Frankfurter API error: ${response.status}`)
      }

      const data: FrankfurterApiResponse = await response.json()

      return {
        base: data.base,
        date: data.date,
        rates: data.rates,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Exchange rate request timeout')
      }
      throw error
    }
  },
})
