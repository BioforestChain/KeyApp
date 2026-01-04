import { useQuery } from '@tanstack/react-query'
import { getAdapterRegistry } from '@/services/chain-adapter'
import type { Transaction } from '@/services/chain-adapter/types'

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

      const registry = getAdapterRegistry()
      const adapter = registry.getAdapter(chainId)

      if (!adapter) {
        console.warn(`[useAddressTransactionsQuery] No adapter for chain: ${chainId}`)
        return []
      }

      return adapter.transaction.getTransactionHistory(address, limit)
    },
    enabled: enabled && !!chainId && !!address.trim(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
