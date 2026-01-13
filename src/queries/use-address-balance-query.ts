import { useKeyFetch } from '@biochain/key-fetch'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { Balance } from '@/services/chain-adapter/providers'

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

/** API 响应类型 */
interface BalanceResponse {
  success: boolean
  result?: {
    assets?: Array<{ symbol: string; balance: string }>
  }
}

/**
 * 构建余额查询 URL
 */
function buildBalanceUrl(chainId: string, address: string): string | null {
  if (!chainId || !address) return null
  const baseUrl = chainConfigService.getApiUrl(chainId)
  if (!baseUrl) return null
  return `${baseUrl}/address/asset?address=${address}`
}

/**
 * Query hook for fetching balance of any address on any chain
 * 
 * 使用 keyFetch 响应式订阅，当区块更新时自动刷新
 */
export function useAddressBalanceQuery(chainId: string, address: string, enabled = true) {
  const url = buildBalanceUrl(chainId, address)

  const { data, isLoading, isFetching, error, refetch } = useKeyFetch<BalanceResponse>(
    url,
    { enabled: enabled && !!chainId && !!address }
  )

  // 转换为 Balance 格式
  let balance: Balance | null = null
  if (data?.success && data.result?.assets?.[0]) {
    const asset = data.result.assets[0]
    const decimals = chainConfigService.getDecimals(chainId)
    balance = {
      symbol: asset.symbol,
      amount: Amount.fromRaw(asset.balance, decimals, asset.symbol),
    }
  }

  return {
    data: {
      balance,
      error: error?.message ?? null,
      supported: !error && !!data?.success,
    } as AddressBalanceResult,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
