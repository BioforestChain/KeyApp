import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createChainProvider } from '@/services/chain-adapter'
import { chainConfigService } from '@/services/chain-config'
import { useChainConfigState } from '@/stores/chain-config'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'
import type { Transaction } from '@/services/chain-adapter/providers/types'
import { isSupported } from '@/services/chain-adapter/providers/types'
import { Amount } from '@/types/amount'
import { mapActionToTransactionType } from '@/components/transaction/transaction-meta'

interface QueryResultWithSupport<T> {
  data: T
  supported: boolean
  fallbackReason?: string
}

export interface AddressPortfolioResult {
  tokens: TokenInfo[]
  transactions: TransactionInfo[]
  tokensLoading: boolean
  transactionsLoading: boolean
  tokensRefreshing: boolean
  tokensSupported: boolean
  tokensFallbackReason?: string
  transactionsSupported: boolean
  transactionsFallbackReason?: string
}

export interface UseAddressPortfolioOptions {
  enabled?: boolean
  transactionLimit?: number
}

export const addressPortfolioKeys = {
  all: ['addressPortfolio'] as const,
  tokens: (chainId: string, address: string) => ['addressPortfolio', 'tokens', chainId, address] as const,
  transactions: (chainId: string, address: string) => ['addressPortfolio', 'transactions', chainId, address] as const,
}

/**
 * 地址资产组合查询 Hook
 * 
 * 纯粹的数据获取，不依赖 Wallet Store，适用于：
 * - 任意地址查询（不一定是自己的钱包）
 * - Stories 测试
 * - 地址查询页面
 */
export function useAddressPortfolio(
  chainId: ChainType,
  address: string,
  options: UseAddressPortfolioOptions = {}
): AddressPortfolioResult {
  const { enabled = true, transactionLimit = 20 } = options
  const chainConfigState = useChainConfigState()
  
  const provider = useMemo(() => {
    if (!chainConfigState.snapshot) return null
    return createChainProvider(chainId)
  }, [chainId, chainConfigState.snapshot])
  
  const tokensEnabled = enabled && !!provider && !!address && (provider.supportsTokenBalances || provider.supportsNativeBalance)
  const transactionsEnabled = enabled && !!provider && !!address && provider.supportsTransactionHistory

  const tokensQuery = useQuery({
    queryKey: addressPortfolioKeys.tokens(chainId, address),
    queryFn: async (): Promise<QueryResultWithSupport<TokenInfo[]>> => {
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      if (!currentProvider) {
        return { data: [], supported: false, fallbackReason: 'Provider not ready' }
      }
      
      // 优先 getTokenBalances
      if (currentProvider.supportsTokenBalances) {
        const tokensResult = await currentProvider.getTokenBalances(address)
        if (isSupported(tokensResult) && tokensResult.data.length > 0) {
          return {
            data: tokensResult.data.map(t => ({
              symbol: t.symbol,
              name: t.name,
              balance: t.amount.toFormatted(),
              decimals: t.amount.decimals,
              chain: chainId,
            })),
            supported: true,
          }
        }
      }
      
      // Fallback: getNativeBalance
      const balanceResult = await currentProvider.getNativeBalance(address)
      if (isSupported(balanceResult)) {
        return {
          data: [{
            symbol: balanceResult.data.symbol,
            name: balanceResult.data.symbol,
            balance: balanceResult.data.amount.toFormatted(),
            decimals: balanceResult.data.amount.decimals,
            chain: chainId,
          }],
          supported: true,
        }
      }
      
      return {
        data: [{
          symbol: balanceResult.data.symbol,
          name: balanceResult.data.symbol,
          balance: balanceResult.data.amount.toFormatted(),
          decimals: balanceResult.data.amount.decimals,
          chain: chainId,
        }],
        supported: false,
        fallbackReason: balanceResult.reason,
      }
    },
    enabled: tokensEnabled,
    staleTime: 30_000,
  })

  const transactionsQuery = useQuery({
    queryKey: addressPortfolioKeys.transactions(chainId, address),
    queryFn: async (): Promise<QueryResultWithSupport<TransactionInfo[]>> => {
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      if (!currentProvider) {
        return { data: [], supported: false, fallbackReason: 'Provider not ready' }
      }
      
      const result = await currentProvider.getTransactionHistory(address, transactionLimit)
      // 在 queryFn 内获取 decimals，避免闭包问题
      const currentDecimals = chainConfigService.getDecimals(chainId)
      
      if (isSupported(result)) {
        return {
          data: result.data.map(tx => convertToTransactionInfo(tx, chainId, currentDecimals)),
          supported: true,
        }
      }
      
      return {
        data: [],
        supported: false,
        fallbackReason: result.reason,
      }
    },
    enabled: transactionsEnabled,
    staleTime: 30_000,
  })

  const tokensLoading = tokensEnabled && tokensQuery.isLoading
  const transactionsLoading = transactionsEnabled && transactionsQuery.isLoading

  const tokensSupported = tokensEnabled
    ? (tokensQuery.data?.supported ?? true)
    : false
  const transactionsSupported = transactionsEnabled
    ? (transactionsQuery.data?.supported ?? true)
    : false

  return {
    tokens: tokensQuery.data?.data ?? [],
    transactions: transactionsQuery.data?.data ?? [],
    tokensLoading,
    transactionsLoading,
    tokensRefreshing: tokensQuery.isFetching && !tokensQuery.isLoading,
    tokensSupported,
    tokensFallbackReason: tokensEnabled ? tokensQuery.data?.fallbackReason : 'Provider does not support token balance queries',
    transactionsSupported,
    transactionsFallbackReason: transactionsEnabled ? transactionsQuery.data?.fallbackReason : 'Provider does not support transaction history queries',
  }
}

function convertToTransactionInfo(
  tx: Transaction, 
  chainId: ChainType,
  fallbackDecimals: number
): TransactionInfo {
  const counterpartyAddress = tx.direction === 'out' ? tx.to : tx.from
  const primaryAsset = tx.assets.find((a) => a.assetType === 'native' || a.assetType === 'token')
  const value = primaryAsset ? primaryAsset.value : '0'
  const symbol = primaryAsset ? primaryAsset.symbol : ''
  const decimals = primaryAsset ? primaryAsset.decimals : fallbackDecimals
  const uiType = mapActionToTransactionType(tx.action, tx.direction)
  
  return {
    id: tx.hash,
    type: uiType,
    status: tx.status,
    amount: Amount.fromRaw(value, decimals, symbol),
    symbol,
    address: counterpartyAddress,
    timestamp: new Date(tx.timestamp),
    hash: tx.hash,
    chain: chainId,
  }
}
