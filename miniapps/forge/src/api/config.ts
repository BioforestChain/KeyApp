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
  // ============================================================================
  // Recharge Endpoints (充值)
  // ============================================================================
  /** 获取支持的充值配置 */
  RECHARGE_SUPPORT: '/cotbfm/recharge/support',
  /** 发起充值（锻造） */
  RECHARGE_V2: '/cotbfm/recharge/V2',
  /** 获取合约池信息 */
  CONTRACT_POOL_INFO: '/cotbfm/recharge/contractPoolInfo',
  /** 获取充值记录列表 */
  RECHARGE_RECORDS: '/cotbfm/recharge/records',
  /** 获取充值记录详情 */
  RECHARGE_RECORD_DETAIL: '/cotbfm/recharge/recordDetail',
  /** 充值外链上链重试 */
  RECHARGE_RETRY_EXTERNAL: '/cotbfm/recharge/retryExternalOnChain',
  /** 充值内链上链重试 */
  RECHARGE_RETRY_INTERNAL: '/cotbfm/recharge/retryInternalOnChain',

  // ============================================================================
  // Redemption Endpoints (赎回)
  // ============================================================================
  /** 发起赎回 */
  REDEMPTION_V2: '/cot/redemption/V2',
  /** 获取赎回记录列表 */
  REDEMPTION_RECORDS: '/cot/redemption/records',
  /** 获取赎回记录详情 */
  REDEMPTION_RECORD_DETAIL: '/cot/redemption/recordDetail',
  /** 赎回内链上链重试 */
  REDEMPTION_RETRY_INTERNAL: '/cot/redemption/retryInternalOnChain',
  /** 赎回外链上链重试 */
  REDEMPTION_RETRY_EXTERNAL: '/cot/redemption/retryExternalOnChain',

  // ============================================================================
  // Legacy aliases (向后兼容)
  // ============================================================================
  /** @deprecated Use RECHARGE_RECORDS */
  RECORDS: '/cotbfm/recharge/records',
  /** @deprecated Use RECHARGE_RECORD_DETAIL */
  RECORD_DETAIL: '/cotbfm/recharge/recordDetail',
  /** @deprecated Use RECHARGE_RETRY_EXTERNAL */
  RETRY_EXTERNAL: '/cotbfm/recharge/retryExternalOnChain',
  /** @deprecated Use RECHARGE_RETRY_INTERNAL */
  RETRY_INTERNAL: '/cotbfm/recharge/retryInternalOnChain',
} as const
