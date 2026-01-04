import { useQuery } from '@tanstack/react-query'
import { getAdapterRegistry, setupAdapters, registerChainConfigs } from '@/services/chain-adapter'
import { chainConfigStore, chainConfigSelectors } from '@/stores'
import type { Balance } from '@/services/chain-adapter/types'

let adaptersInitialized = false
function ensureAdapters() {
  if (!adaptersInitialized) {
    setupAdapters()
    adaptersInitialized = true
  }
}

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
        ensureAdapters()

        const state = chainConfigStore.state
        const chainConfig = chainConfigSelectors.getChainById(state, chainId)
        if (!chainConfig) {
          return { balance: null, error: `Unknown chain: ${chainId}` }
        }

        // 确保链已注册到 registry
        registerChainConfigs([chainConfig])

        const registry = getAdapterRegistry()
        const adapter = registry.getAdapter(chainId)
        if (!adapter) {
          return { balance: null, error: `No adapter for chain: ${chainId}` }
        }

        const balance = await adapter.asset.getNativeBalance(address)
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
