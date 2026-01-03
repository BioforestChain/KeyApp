/**
 * API Configuration
 * 
 * IMPORTANT: Base URL must be configured via VITE_COT_API_BASE_URL environment variable.
 * The COT Recharge API host has not been confirmed - do not use a hardcoded default.
 */

/** Configuration error for missing API base URL */
export class ApiConfigError extends Error {
  constructor() {
    super(
      '[Forge API] VITE_COT_API_BASE_URL is not configured. ' +
      'Please set this environment variable to the COT Recharge API base URL.'
    )
    this.name = 'ApiConfigError'
  }
}

/** API Base URL - must be configured via environment variable */
function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_COT_API_BASE_URL
  if (!url) {
    // Log error for visibility in dev tools
    console.error(new ApiConfigError().message)
    // Throw to fail fast - prevents silent failures with relative paths
    throw new ApiConfigError()
  }
  return url
}

// Lazy initialization to allow error handling at app level
let _apiBaseUrl: string | null = null

export function getApiBaseUrlSafe(): string {
  if (_apiBaseUrl === null) {
    _apiBaseUrl = getApiBaseUrl()
  }
  return _apiBaseUrl
}

// For backwards compatibility - will throw if not configured
export const API_BASE_URL = import.meta.env.VITE_COT_API_BASE_URL || ''

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
