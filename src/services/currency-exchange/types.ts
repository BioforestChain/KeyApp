/**
 * 货币兑换服务类型定义
 */

/** 汇率响应数据 */
export interface ExchangeRateResponse {
  /** 基准货币 */
  base: string
  /** 汇率日期 */
  date: string
  /** 目标货币汇率映射 */
  rates: Record<string, number>
}

/** 汇率数据（带缓存时间戳） */
export interface ExchangeRateData extends ExchangeRateResponse {
  /** 缓存/更新时间戳 (ms) */
  updatedAt: number
}

/** 货币兑换服务接口 */
export interface ICurrencyExchangeService {
  /** 获取汇率 */
  getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRateResponse>
}

/** Frankfurter API 原始响应 */
export interface FrankfurterApiResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}
