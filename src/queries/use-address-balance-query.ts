import { useQuery } from '@tanstack/react-query'
import { getChainProvider, type Balance, isSupported } from '@/services/chain-adapter/providers'

export const addressBalanceKeys = {
  all: ['addressBalance'] as const,
  query: (chainId: string, address: string) => ['addressBalance', chainId, address] as const,
}

export interface AddressBalanceResult {
  balance: Balance | null
  error: string | null
  /** 是否成功查询（false 表示 fallback 到默认值） */
  supported: boolean
}

/**
 * Query hook for fetching balance of any address on any chain
 */
export function useAddressBalanceQuery(chainId: string, address: string, enabled = true) {
  return useQuery({
    queryKey: addressBalanceKeys.query(chainId, address),
    queryFn: async (): Promise<AddressBalanceResult> => {
      if (!chainId || !address) {
        return { balance: null, error: 'Missing chain or address', supported: false }
      }

      const chainProvider = getChainProvider(chainId)
      const result = await chainProvider.getNativeBalance(address)
      
      if (isSupported(result)) {
        return { balance: result.data, error: null, supported: true }
      } else {
        return { balance: result.data, error: result.reason, supported: false }
      }
    },
    enabled: enabled && !!chainId && !!address,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
