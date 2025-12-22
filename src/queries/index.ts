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

export {
  useTransactionHistoryQuery,
  useRefreshTransactionHistory,
  transactionHistoryKeys,
  type TransactionFilter,
  type TransactionRecord,
} from './use-transaction-history-query'

export {
  usePriceQuery,
  getPrice,
  priceQueryKeys,
  type PriceData,
} from './use-price-query'

export {
  useExchangeRateQuery,
  getExchangeRate,
  exchangeRateQueryKeys,
} from './use-exchange-rate-query'

export {
  useStakingOverviewQuery,
  useStakingTransactionsQuery,
  useStakingTransactionQuery,
  useRefreshStaking,
  stakingQueryKeys,
} from './use-staking-query'

export {
  useChainConfigsQuery,
  useChainConfigSubscriptionQuery,
  useRefreshChainConfig,
  chainConfigQueryKeys,
} from './use-chain-config-query'
