import { useCallback } from 'react'
import { useKeyFetch } from '@biochain/key-fetch'
import { walletActions, walletStore, type Token, type ChainType } from '@/stores'
import { chainConfigService } from '@/services/chain-config'

/**
 * Balance Query Keys
 *
 * 用于构建一致的 query key，支持精确和模糊匹配
 */
export const balanceQueryKeys = {
  all: ['balance'] as const,
  wallet: (walletId: string) => ['balance', walletId] as const,
  chain: (walletId: string, chain: ChainType) => ['balance', walletId, chain] as const,
}

/**
 * 获取当前 balance query 的 key
 */
export function useBalanceQueryKey(walletId: string | undefined, chain: ChainType | undefined) {
  if (!walletId || !chain) return null
  return balanceQueryKeys.chain(walletId, chain)
}

/** Balance Query 结果（含 supported 状态） */
export interface BalanceQueryResult {
  tokens: Token[]
  supported: boolean
  fallbackReason?: string
}

/**
 * 构建余额查询的 URL
 * 基于 chain 和 address 生成唯一的订阅 URL
 */
function buildBalanceUrl(chain: ChainType | undefined, address: string | undefined): string | null {
  if (!chain || !address) return null
  const baseUrl = chainConfigService.getApiUrl(chain)
  if (!baseUrl) return null
  return `${baseUrl}/address/asset?address=${address}`
}

/**
 * Balance Query Hook
 *
 * 特性：
 * - 基于 keyFetch 的响应式订阅
 * - 当 lastblock 更新时自动刷新（通过 deps 插件）
 * - 按需订阅：只查询当前链
 * - 无轮询：依赖区块高度变化触发更新
 */
export function useBalanceQuery(walletId: string | undefined, chain: ChainType | undefined) {
  // 获取当前链的地址
  const wallet = walletStore.state.wallets.find(w => w.id === walletId)
  const chainAddress = wallet?.chainAddresses.find(ca => ca.chain === chain)
  const address = chainAddress?.address

  // 构建订阅 URL
  const url = buildBalanceUrl(chain, address)

  // 使用 keyFetch 订阅余额数据
  const { data, isLoading, isFetching, error, refetch } = useKeyFetch<{
    success: boolean
    result?: { assets?: Array<{ symbol: string; balance: string }> }
  }>(url, {
    enabled: !!walletId && !!chain && !!address,
  })

  // 将 API 响应转换为 Token 格式
  const tokens: Token[] = data?.success && data.result?.assets
    ? data.result.assets.map(asset => ({
        id: `${chain}:${asset.symbol}`,
        symbol: asset.symbol,
        name: asset.symbol,
        balance: asset.balance,
        fiatValue: 0,
        change24h: 0,
        decimals: chainConfigService.getDecimals(chain!),
        chain: chain!,
      }))
    : chainAddress?.tokens ?? []

  return {
    data: {
      tokens,
      supported: !error,
      fallbackReason: error?.message,
    } as BalanceQueryResult,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

/**
 * 手动刷新余额
 *
 * 用于下拉刷新等场景
 */
export function useRefreshBalance() {
  const refresh = useCallback(async (walletId: string, chain: ChainType) => {
    // 直接调用 walletActions 刷新
    await walletActions.refreshBalance(walletId, chain)
  }, [])

  const refreshAll = useCallback(async (walletId: string) => {
    await walletActions.refreshAllBalances()
  }, [])

  return { refresh, refreshAll }
}
