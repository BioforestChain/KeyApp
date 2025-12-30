/**
 * API Configuration
 * 
 * IMPORTANT: Base URL must be configured via VITE_COT_API_BASE_URL environment variable.
 * The COT Recharge API host has not been confirmed - do not use a hardcoded default.
 */

/** API Base URL - must be configured via environment variable */
function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_COT_API_BASE_URL
  if (!url) {
    // Fail-fast in development to catch missing configuration early
    if (import.meta.env.DEV) {
      console.error(
        '[Forge API] VITE_COT_API_BASE_URL is not configured. ' +
        'Please set this environment variable to the COT Recharge API base URL.'
      )
    }
    // Return empty string - API calls will fail with clear error
    return ''
  }
  return url
}

export const API_BASE_URL = getApiBaseUrl()

/** API Endpoints */
export const API_ENDPOINTS = {
  /** 获取支持的充值配置 */
  RECHARGE_SUPPORT: '/cot/recharge/support',
  /** 发起充值（锻造） */
  RECHARGE_V2: '/cot/recharge/V2',
  /** 获取合约池信息 */
  CONTRACT_POOL_INFO: '/cot/recharge/contractPoolInfo',
  /** 获取充值记录列表 */
  RECORDS: '/cot/recharge/records',
  /** 获取充值记录详情 */
  RECORD_DETAIL: '/cot/recharge/recordDetail',
  /** 外链上链重试 */
  RETRY_EXTERNAL: '/cot/recharge/retryExternalOnChain',
  /** 内链上链重试 */
  RETRY_INTERNAL: '/cot/recharge/retryInternalOnChain',
} as const
