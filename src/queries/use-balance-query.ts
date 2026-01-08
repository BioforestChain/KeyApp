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

/** Balance Query 结果（含 supported 状态） */
export interface BalanceQueryResult {
  tokens: Token[]
  supported: boolean
  fallbackReason?: string
}

/**
 * Balance Query Hook
 *
 * 特性：
 * - 30 秒 staleTime：Tab 切换不会重复请求
 * - 60 秒轮询：自动刷新余额
 * - 共享缓存：多个组件使用同一 key 时共享数据
 * - 智能去重：同时发起的相同请求会被合并
 * - 返回 supported 状态：指示是否成功从 Provider 获取数据
 */
export function useBalanceQuery(walletId: string | undefined, chain: ChainType | undefined) {
  return useQuery({
    queryKey: balanceQueryKeys.chain(walletId ?? '', chain ?? ''),
    queryFn: async (): Promise<BalanceQueryResult> => {
      if (!walletId || !chain) return { tokens: [], supported: false, fallbackReason: 'Missing walletId or chain' }

      // 调用 refreshBalance 获取余额（内部会优先 getTokenBalances）
      const refreshResult = await walletActions.refreshBalance(walletId, chain)

      // 从 store 中获取更新后的数据
      const state = (await import('@/stores')).walletStore.state
      const wallet = state.wallets.find((w) => w.id === walletId)
      const chainAddress = wallet?.chainAddresses.find((ca) => ca.chain === chain)

      return {
        tokens: chainAddress?.tokens ?? [],
        supported: refreshResult?.supported ?? true,
        fallbackReason: refreshResult?.fallbackReason,
      }
    },
    enabled: !!walletId && !!chain,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
