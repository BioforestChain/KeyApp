import { useQuery, useQueryClient } from '@tanstack/react-query'
import { stakingService } from '@/services/staking'
import type { StakingOverviewItem, StakingTransaction } from '@/types/staking'

/**
 * Staking Query Keys
 */
export const stakingQueryKeys = {
  all: ['staking'] as const,
  overview: () => ['staking', 'overview'] as const,
  transactions: () => ['staking', 'transactions'] as const,
  transaction: (id: string) => ['staking', 'transaction', id] as const,
}

/**
 * Staking Overview Query Hook
 *
 * 获取质押池列表
 * - 30s staleTime：Tab 切换不重复请求
 * - 支持共享缓存和请求去重
 */
export function useStakingOverviewQuery() {
  return useQuery({
    queryKey: stakingQueryKeys.overview(),
    queryFn: (): Promise<StakingOverviewItem[]> => stakingService.getOverview(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Staking Transactions Query Hook
 *
 * 获取质押交易记录
 * - 30s staleTime：Tab 切换不重复请求
 * - 支持共享缓存和请求去重
 */
export function useStakingTransactionsQuery() {
  return useQuery({
    queryKey: stakingQueryKeys.transactions(),
    queryFn: (): Promise<StakingTransaction[]> => stakingService.getTransactions(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Single Staking Transaction Query Hook
 */
export function useStakingTransactionQuery(id: string | undefined) {
  return useQuery({
    queryKey: stakingQueryKeys.transaction(id ?? ''),
    queryFn: () => stakingService.getTransaction({ id: id! }),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

/**
 * Refresh Staking Data
 */
export function useRefreshStaking() {
  const queryClient = useQueryClient()

  return {
    refreshOverview: async () => {
      await queryClient.invalidateQueries({ queryKey: stakingQueryKeys.overview() })
    },
    refreshTransactions: async () => {
      await queryClient.invalidateQueries({ queryKey: stakingQueryKeys.transactions() })
    },
    refreshAll: async () => {
      await queryClient.invalidateQueries({ queryKey: stakingQueryKeys.all })
    },
  }
}
