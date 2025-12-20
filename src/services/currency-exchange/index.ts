/**
 * 货币兑换服务
 *
 * 通过 Vite alias 在编译时选择实现
 */

export type { ICurrencyExchangeService, ExchangeRateResponse, FrankfurterApiResponse } from './types'
export { currencyExchangeServiceMeta } from './types'
export { currencyExchangeService } from '#currency-exchange-impl'
