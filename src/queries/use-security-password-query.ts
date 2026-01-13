/**
 * 安全密码公钥 Query
 * 
 * 使用 TanStack Query 管理安全密码公钥的查询和缓存
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAddressInfo } from '@/services/bioforest-sdk'
import { chainConfigStore, chainConfigSelectors } from '@/stores/chain-config'
import type { ChainType } from '@/stores/wallet'

/**
 * Query Keys
 */
export const securityPasswordQueryKeys = {
  all: ['securityPassword'] as const,
  address: (chain: ChainType, address: string) => ['securityPassword', chain, address] as const,
}

export interface SecurityPasswordQueryResult {
  address: string
  secondPublicKey: string | null
}

/**
 * 安全密码公钥 Query Hook
 * 
 * 特性：
 * - 进入钱包时自动查询
 * - 缓存公钥，避免重复请求
 * - 支持手动刷新（设置安全密码后）
 */
export function useSecurityPasswordQuery(
  chain: ChainType | undefined,
  address: string | undefined,
) {
  return useQuery({
    queryKey: securityPasswordQueryKeys.address(chain ?? '', address ?? ''),
    queryFn: async (): Promise<SecurityPasswordQueryResult> => {
      if (!chain || !address) {
        return { address: '', secondPublicKey: null }
      }

      // 获取链配置
      const chainConfigState = chainConfigStore.state
      const chainConfig = chainConfigSelectors.getChainById(chainConfigState, chain)
      
      if (!chainConfig) {
        
        return { address, secondPublicKey: null }
      }

      const biowallet = chainConfig.apis.find((p) => p.type === 'biowallet-v1')
      const apiUrl = biowallet?.endpoint
      const apiPath = (biowallet?.config?.path as string | undefined) ?? chainConfig.id
      
      if (!apiUrl) {
        
        return { address, secondPublicKey: null }
      }

      try {
        const info = await getAddressInfo(apiUrl, apiPath, address)
        return {
          address,
          secondPublicKey: info.secondPublicKey ?? null,
        }
      } catch (error) {
        
        return { address, secondPublicKey: null }
      }
    },
    enabled: !!chain && !!address,
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据新鲜
    gcTime: 30 * 60 * 1000, // 30 分钟缓存
    refetchOnWindowFocus: false, // 不需要频繁刷新
  })
}

/**
 * 获取安全密码公钥（直接从缓存读取）
 */
export function useSecurityPublicKey(
  chain: ChainType | undefined,
  address: string | undefined,
): string | null | undefined {
  const { data } = useSecurityPasswordQuery(chain, address)
  return data?.secondPublicKey
}

/**
 * 是否设置了安全密码
 */
export function useHasSecurityPassword(
  chain: ChainType | undefined,
  address: string | undefined,
): boolean {
  const publicKey = useSecurityPublicKey(chain, address)
  return !!publicKey
}

/**
 * 手动刷新安全密码公钥
 * 
 * 用于设置安全密码后刷新缓存
 */
export function useRefreshSecurityPassword() {
  const queryClient = useQueryClient()

  return {
    refresh: async (chain: ChainType, address: string) => {
      await queryClient.invalidateQueries({
        queryKey: securityPasswordQueryKeys.address(chain, address),
      })
    },
    refreshAll: async () => {
      await queryClient.invalidateQueries({
        queryKey: securityPasswordQueryKeys.all,
      })
    },
  }
}
