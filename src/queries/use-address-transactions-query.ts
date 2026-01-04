import { useQuery } from '@tanstack/react-query'
import { getChainProvider, type Transaction } from '@/services/chain-adapter/providers'

export const addressTransactionsQueryKeys = {
  all: ['addressTransactions'] as const,
  address: (chainId: string, address: string) => ['addressTransactions', chainId, address] as const,
}

interface UseAddressTransactionsQueryOptions {
  chainId: string
  address: string
  limit?: number
  enabled?: boolean
}

export function useAddressTransactionsQuery({
  chainId,
  address,
  limit = 20,
  enabled = true,
}: UseAddressTransactionsQueryOptions) {
  return useQuery({
    queryKey: addressTransactionsQueryKeys.address(chainId, address),
    queryFn: async (): Promise<Transaction[]> => {
      if (!chainId || !address) return []

      const chainProvider = getChainProvider(chainId)
      
      if (!chainProvider.supportsTransactionHistory) {
        console.warn(`[useAddressTransactionsQuery] Chain ${chainId} does not support transaction history`)
        return []
      }

      const getHistory = chainProvider.getTransactionHistory
      if (!getHistory) return []

      return getHistory(address, limit)
    },
    enabled: enabled && !!chainId && !!address.trim(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
