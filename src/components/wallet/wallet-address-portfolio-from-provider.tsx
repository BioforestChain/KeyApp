import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createChainProvider } from '@/services/chain-adapter'
import { chainConfigService } from '@/services/chain-config'
import { useChainConfigState } from '@/stores/chain-config'
import { WalletAddressPortfolioView, type WalletAddressPortfolioViewProps } from './wallet-address-portfolio-view'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'
import type { Transaction } from '@/services/chain-adapter/providers/types'
import { isSupported } from '@/services/chain-adapter/providers/types'
import { Amount } from '@/types/amount'
import { mapActionToTransactionType } from '@/components/transaction/transaction-meta'

/** 查询结果（带 supported 状态） */
interface QueryResultWithSupport<T> {
  data: T
  supported: boolean
  fallbackReason?: string
}

export interface WalletAddressPortfolioFromProviderProps {
  chainId: ChainType
  address: string
  chainName?: string
  onTokenClick?: WalletAddressPortfolioViewProps['onTokenClick']
  onTransactionClick?: WalletAddressPortfolioViewProps['onTransactionClick']
  className?: string
  testId?: string
}

export function WalletAddressPortfolioFromProvider({
  chainId,
  address,
  chainName,
  onTokenClick,
  onTransactionClick,
  className,
  testId,
}: WalletAddressPortfolioFromProviderProps) {
  const chainConfigState = useChainConfigState()
  
  // Create provider only after chainConfig is ready
  const provider = useMemo(() => {
    if (!chainConfigState.snapshot) return null
    return createChainProvider(chainId)
  }, [chainId, chainConfigState.snapshot])
  
  const decimals = chainConfigService.getDecimals(chainId)
  
  // Check if provider is ready for queries
  const tokensEnabled = !!provider && (provider.supportsTokenBalances || provider.supportsNativeBalance)
  const transactionsEnabled = !!provider?.supportsTransactionHistory

  const tokensQuery = useQuery({
    queryKey: ['address-token-balances', chainId, address, !!provider],
    queryFn: async (): Promise<QueryResultWithSupport<TokenInfo[]>> => {
      // Re-create provider inside queryFn to ensure we have latest
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      if (!currentProvider) {
        return { data: [], supported: false, fallbackReason: 'Provider not ready' }
      }
      
      // 先尝试获取 token 列表
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
      
      // fallback 到原生代币余额
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
      
      // 两者都失败，返回 fallback 数据
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
    queryKey: ['address-transactions', chainId, address, !!provider],
    queryFn: async (): Promise<QueryResultWithSupport<TransactionInfo[]>> => {
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      if (!currentProvider) {
        return { data: [], supported: false, fallbackReason: 'Provider not ready' }
      }
      
      const result = await currentProvider.getTransactionHistory(address, 20)
      
      if (isSupported(result)) {
        return {
          data: result.data.map(tx => convertToTransactionInfo(tx, chainId, decimals)),
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

  // Loading 状态：只有当 query 正在执行时才显示 loading
  // 当 provider 不支持时，不显示 loading，而是直接显示"不支持"提示
  const tokensLoading = tokensEnabled && tokensQuery.isLoading
  const transactionsLoading = transactionsEnabled && transactionsQuery.isLoading

  // Supported 状态：当 provider 明确不支持时，supported 应为 false
  const tokensSupported = tokensEnabled
    ? (tokensQuery.data?.supported ?? true)
    : false
  const transactionsSupported = transactionsEnabled
    ? (transactionsQuery.data?.supported ?? true)
    : false

  return (
    <WalletAddressPortfolioView
      chainId={chainId}
      chainName={chainName}
      tokens={tokensQuery.data?.data ?? []}
      transactions={transactionsQuery.data?.data ?? []}
      tokensLoading={tokensLoading}
      transactionsLoading={transactionsLoading}
      tokensRefreshing={tokensQuery.isFetching && !tokensQuery.isLoading}
      tokensSupported={tokensSupported}
      tokensFallbackReason={tokensEnabled ? tokensQuery.data?.fallbackReason : 'Provider does not support token balance queries'}
      transactionsSupported={transactionsSupported}
      transactionsFallbackReason={transactionsEnabled ? transactionsQuery.data?.fallbackReason : 'Provider does not support transaction history queries'}
      onTokenClick={onTokenClick}
      onTransactionClick={onTransactionClick}
      className={className}
      testId={testId}
    />
  )
}

/** 将 provider Transaction 转换为 UI TransactionInfo */
function convertToTransactionInfo(
  tx: Transaction, 
  chainId: ChainType,
  fallbackDecimals: number
): TransactionInfo {
  // 使用 direction 判断对方地址
  const counterpartyAddress = tx.direction === 'out' ? tx.to : tx.from
  
  // 获取主要资产信息 (优先 fungible: native/token)
  const primaryAsset = tx.assets.find((a) => a.assetType === 'native' || a.assetType === 'token')
  const value = primaryAsset ? primaryAsset.value : '0'
  const symbol = primaryAsset ? primaryAsset.symbol : ''
  const decimals = primaryAsset ? primaryAsset.decimals : fallbackDecimals
  
  // 将 action + direction 映射到 UI TransactionType (single source of truth)
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

// mapToUIType removed - use mapActionToTransactionType from transaction-meta.ts (single source of truth)
