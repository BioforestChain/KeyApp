import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSubscription, type FetchSubscriptionResult } from '@/services/chain-config/subscription'
import { loadChainConfigs } from '@/services/chain-config/storage'
import type { ChainConfig } from '@/services/chain-config/types'

/**
 * Chain Config Query Keys
 */
export const chainConfigQueryKeys = {
  all: ['chainConfig'] as const,
  configs: () => ['chainConfig', 'configs'] as const,
  subscription: (url: string) => ['chainConfig', 'subscription', url] as const,
}

/**
 * Chain Configs Query Hook
 *
 * 获取本地存储的链配置
 */
export function useChainConfigsQuery() {
  return useQuery({
    queryKey: chainConfigQueryKeys.configs(),
    queryFn: (): Promise<ChainConfig[]> => loadChainConfigs(),
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 30 * 60 * 1000, // 30 分钟缓存
  })
}

/**
 * Chain Config Subscription Query Hook
 *
 * 从远程 URL 获取链配置订阅
 * - 支持 ETag / 304 Not Modified
 * - 可配置定期刷新
 */
export function useChainConfigSubscriptionQuery(
  url: string,
  options?: {
    refetchInterval?: number
    force?: boolean
  }
) {
  const refetchInterval = options?.refetchInterval
  const force = options?.force ?? false

  return useQuery({
    queryKey: chainConfigQueryKeys.subscription(url),
    queryFn: (): Promise<FetchSubscriptionResult> =>
      fetchSubscription(url, { force }),
    enabled: !!url && url !== 'default',
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 30 * 60 * 1000,
    ...(refetchInterval !== undefined && { refetchInterval }),
    refetchOnWindowFocus: true,
  })
}

/**
 * Refresh Chain Config
 */
export function useRefreshChainConfig() {
  const queryClient = useQueryClient()

  return {
    refreshConfigs: async () => {
      await queryClient.invalidateQueries({ queryKey: chainConfigQueryKeys.configs() })
    },
    refreshSubscription: async (url: string) => {
      await queryClient.invalidateQueries({ queryKey: chainConfigQueryKeys.subscription(url) })
    },
    refreshAll: async () => {
      await queryClient.invalidateQueries({ queryKey: chainConfigQueryKeys.all })
    },
  }
}
