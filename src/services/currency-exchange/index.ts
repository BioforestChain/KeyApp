/**
 * 货币兑换服务
 *
 * 注意: 此服务不需要平台特定实现
 * - Web/DWEB 都使用 web.ts 实现 (Frankfurter API)
 * - 测试环境使用 mock.ts 实现
 */

export type { ICurrencyExchangeService, ExchangeRateResponse, FrankfurterApiResponse } from './types'

import { CurrencyExchangeService } from '#currency-exchange-impl'
export { CurrencyExchangeService }

export const currencyExchangeService = new CurrencyExchangeService()
