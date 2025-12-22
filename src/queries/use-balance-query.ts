import { useQuery, useQueryClient } from '@tanstack/react-query'
import { walletActions, type Token, type ChainType } from '@/stores'

/**
 * Balance Query Keys
 *
 * 用于构建一致的 query key，支持精确和模糊匹配
 */
export const balanceQueryKeys = {
  all: ['balance'] as const,
  wallet: (walletId: string) => ['balance', walletId] as const,
  chain: (walletId: string, chain: ChainType) => ['balance', walletId, chain] as const,
}

/**
 * 获取当前 balance query 的 key
 */
export function useBalanceQueryKey(walletId: string | undefined, chain: ChainType | undefined) {
  if (!walletId || !chain) return null
  return balanceQueryKeys.chain(walletId, chain)
}

/**
 * Balance Query Hook
 *
 * 特性：
 * - 30 秒 staleTime：Tab 切换不会重复请求
 * - 60 秒轮询：自动刷新余额
 * - 共享缓存：多个组件使用同一 key 时共享数据
 * - 智能去重：同时发起的相同请求会被合并
 */
export function useBalanceQuery(walletId: string | undefined, chain: ChainType | undefined) {
  return useQuery({
    queryKey: balanceQueryKeys.chain(walletId ?? '', chain ?? ''),
    queryFn: async (): Promise<Token[]> => {
      if (!walletId || !chain) return []

      // 调用现有的 refreshBalance 逻辑获取余额
      await walletActions.refreshBalance(walletId, chain)

      // 从 store 中获取更新后的数据
      const state = (await import('@/stores')).walletStore.state
      const wallet = state.wallets.find((w) => w.id === walletId)
      const chainAddress = wallet?.chainAddresses.find((ca) => ca.chain === chain)

      return chainAddress?.tokens ?? []
    },
    enabled: !!walletId && !!chain,
    staleTime: 30 * 1000, // 30 秒内认为数据新鲜
    gcTime: 5 * 60 * 1000, // 5 分钟缓存
    refetchInterval: 60 * 1000, // 60 秒轮询
    refetchIntervalInBackground: false, // 后台时停止轮询
    refetchOnWindowFocus: true, // 窗口聚焦时刷新
  })
}

/**
 * 手动刷新余额
 *
 * 用于下拉刷新等场景
 */
export function useRefreshBalance() {
  const queryClient = useQueryClient()

  return {
    refresh: async (walletId: string, chain: ChainType) => {
      await queryClient.invalidateQueries({
        queryKey: balanceQueryKeys.chain(walletId, chain),
      })
    },
    refreshAll: async (walletId: string) => {
      await queryClient.invalidateQueries({
        queryKey: balanceQueryKeys.wallet(walletId),
      })
    },
  }
}
