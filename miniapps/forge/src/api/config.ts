/**
 * API Configuration
 * TODO: Base URL needs to be confirmed with backend team
 */

/** API Base URL - to be configured via environment or runtime */
export const API_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_COT_API_BASE_URL || 'https://api.eth-metaverse.com'

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
