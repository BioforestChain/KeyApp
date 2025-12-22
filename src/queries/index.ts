/**
 * TanStack Query hooks
 *
 * 推送式数据服务：
 * - 页面只订阅数据，不主动触发刷新
 * - Query 层负责缓存、轮询、去重
 * - Tab 切换不会触发重复请求
 */

export {
  useBalanceQuery,
  useBalanceQueryKey,
  useRefreshBalance,
  balanceQueryKeys,
} from './use-balance-query'
