import { useQuery } from '@tanstack/react-query'
import { getChainProvider, type Balance } from '@/services/chain-adapter/providers'

export const addressBalanceKeys = {
  all: ['addressBalance'] as const,
  query: (chainId: string, address: string) => ['addressBalance', chainId, address] as const,
}

export interface AddressBalanceResult {
  balance: Balance | null
  error: string | null
}

/**
 * Query hook for fetching balance of any address on any chain
 */
export function useAddressBalanceQuery(chainId: string, address: string, enabled = true) {
  return useQuery({
    queryKey: addressBalanceKeys.query(chainId, address),
    queryFn: async (): Promise<AddressBalanceResult> => {
      if (!chainId || !address) {
        return { balance: null, error: 'Missing chain or address' }
      }

      try {
        const chainProvider = getChainProvider(chainId)
        
        if (!chainProvider.supportsNativeBalance) {
          return { balance: null, error: `Chain ${chainId} does not support balance query` }
        }

        const getBalance = chainProvider.getNativeBalance
        if (!getBalance) {
          return { balance: null, error: `No balance provider for chain: ${chainId}` }
        }

        const balance = await getBalance(address)
        return { balance, error: null }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return { balance: null, error: message }
      }
    },
    enabled: enabled && !!chainId && !!address,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
