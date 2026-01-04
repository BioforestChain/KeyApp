import { useQuery } from '@tanstack/react-query'
import { getAdapterRegistry, setupAdapters, registerChainConfigs } from '@/services/chain-adapter'
import { chainConfigStore, chainConfigSelectors } from '@/stores'
import type { Transaction } from '@/services/chain-adapter/types'

let adaptersInitialized = false
function ensureAdapters() {
  if (!adaptersInitialized) {
    setupAdapters()
    adaptersInitialized = true
  }
}

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

      ensureAdapters()

      const state = chainConfigStore.state
      const chainConfig = chainConfigSelectors.getChainById(state, chainId)
      if (!chainConfig) {
        console.warn(`[useAddressTransactionsQuery] Unknown chain: ${chainId}`)
        return []
      }

      // 确保链已注册到 registry
      registerChainConfigs([chainConfig])

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
