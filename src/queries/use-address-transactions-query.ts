import { useKeyFetch } from '@biochain/key-fetch'
import { chainConfigService } from '@/services/chain-config'
import type { Transaction } from '@/services/chain-adapter/providers'

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

/** API 响应类型 */
interface TransactionQueryResponse {
  success: boolean
  result?: {
    trs?: Array<{
      height: number
      signature: string
      tIndex: number
      transaction: {
        signature: string
        senderId: string
        recipientId?: string
        fee: string
        timestamp: number
        type: string
        asset?: {
          transferAsset?: {
            amount: string
            assetType: string
          }
        }
      }
    }>
  }
}

/**
 * 构建交易查询 URL
 */
function buildTransactionsUrl(chainId: string, address: string): string | null {
  if (!chainId || !address) return null
  const baseUrl = chainConfigService.getBiowalletApi(chainId)
  if (!baseUrl) return null
  return `${baseUrl}/transactions/query?address=${address}`
}

/**
 * Query hook for fetching transactions of any address on any chain
 * 
 * 使用 keyFetch 响应式订阅，当区块更新时自动刷新
 */
export function useAddressTransactionsQuery({
  chainId,
  address,
  limit = 20,
  enabled = true,
}: UseAddressTransactionsQueryOptions) {
  const url = buildTransactionsUrl(chainId, address)

  const { data, isLoading, isFetching, error, refetch } = useKeyFetch<TransactionQueryResponse>(
    url,
    {
      enabled: enabled && !!chainId && !!address.trim(),
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          page: 1,
          pageSize: limit,
          sort: -1,
        }),
      },
    }
  )

  // 转换为 Transaction 格式
  const transactions: Transaction[] = data?.success && data.result?.trs
    ? data.result.trs.map(item => {
        const tx = item.transaction
        const decimals = chainConfigService.getDecimals(chainId)
        const symbol = chainConfigService.getSymbol(chainId)
        const amountRaw = tx.asset?.transferAsset?.amount ?? '0'

        return {
          hash: tx.signature,
          from: tx.senderId,
          to: tx.recipientId,
          status: 'confirmed' as const,
          timestamp: tx.timestamp,
          blockNumber: String(item.height),
          action: 'transfer' as const,
          direction: 'out' as const,
          assets: [{
            assetType: 'native' as const,
            value: amountRaw,
            symbol,
            decimals,
          }],
          fee: {
            value: tx.fee,
            symbol,
            decimals,
          },
        }
      })
    : []

  return {
    data: {
      transactions,
      supported: !error && !!data?.success,
      fallbackReason: error?.message,
    } as AddressTransactionsResult,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
