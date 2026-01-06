import { useQuery } from '@tanstack/react-query'
import { getChainProvider, type Transaction, isSupported } from '@/services/chain-adapter/providers'

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

export interface AddressTransactionsResult {
  transactions: Transaction[]
  /** 是否成功查询（false 表示 fallback 到默认值） */
  supported: boolean
  fallbackReason?: string
}

export function useAddressTransactionsQuery({
  chainId,
  address,
  limit = 20,
  enabled = true,
}: UseAddressTransactionsQueryOptions) {
  return useQuery({
    queryKey: addressTransactionsQueryKeys.address(chainId, address),
    queryFn: async (): Promise<AddressTransactionsResult> => {
      if (!chainId || !address) {
        return { transactions: [], supported: false, fallbackReason: 'Missing chain or address' }
      }

      const chainProvider = getChainProvider(chainId)
      const result = await chainProvider.getTransactionHistory(address, limit)
      
      if (isSupported(result)) {
        return { transactions: result.data, supported: true }
      } else {
        return { transactions: result.data, supported: false, fallbackReason: result.reason }
      }
    },
    enabled: enabled && !!chainId && !!address.trim(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
