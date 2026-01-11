/**
 * API Configuration
 *
 * Default base URL is https://walletapi.bfmeta.info (same as other BioForest services).
 * Can be overridden via VITE_COT_API_BASE_URL environment variable.
 */

/** Default API Base URL (used by all BioForest chain services) */
const DEFAULT_API_BASE_URL = 'https://walletapi.bfmeta.info'

/** API Base URL - uses default or environment override */
export const API_BASE_URL =
  import.meta.env.VITE_COT_API_BASE_URL || DEFAULT_API_BASE_URL

/** Get API Base URL (for backwards compatibility) */
export function getApiBaseUrlSafe(): string {
  return API_BASE_URL
}

/** API Endpoints */
export const API_ENDPOINTS = {
  /** 获取支持的充值配置 */
  RECHARGE_SUPPORT: '/cotbfm/recharge/support',
  /** 发起充值（锻造） */
  RECHARGE_V2: '/cotbfm/recharge/V2',
  /** 获取合约池信息 */
  CONTRACT_POOL_INFO: '/cotbfm/recharge/contractPoolInfo',
  /** 获取充值记录列表 */
  RECORDS: '/cotbfm/recharge/records',
  /** 获取充值记录详情 */
  RECORD_DETAIL: '/cotbfm/recharge/recordDetail',
  /** 外链上链重试 */
  RETRY_EXTERNAL: '/cotbfm/recharge/retryExternalOnChain',
  /** 内链上链重试 */
  RETRY_INTERNAL: '/cotbfm/recharge/retryInternalOnChain',
} as const
