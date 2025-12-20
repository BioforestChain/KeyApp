/**
 * 货币兑换服务 - 类型定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const ExchangeRateResponseSchema = z.object({
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
})

export const currencyExchangeServiceMeta = defineServiceMeta('currencyExchange', (s) =>
  s
    .description('货币兑换服务 - 获取汇率')
    .api('getExchangeRates', {
      description: '获取汇率',
      input: z.object({
        baseCurrency: z.string(),
        targetCurrencies: z.array(z.string()),
      }),
      output: ExchangeRateResponseSchema,
    })
)

export type ICurrencyExchangeService = typeof currencyExchangeServiceMeta.Type
export type ExchangeRateResponse = z.infer<typeof ExchangeRateResponseSchema>

/** 汇率数据（带缓存时间戳） */
export interface ExchangeRateData extends ExchangeRateResponse {
  updatedAt: number
}

/** Frankfurter API 原始响应 */
export interface FrankfurterApiResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}
