import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createChainProvider } from '@/services/chain-adapter'
import { chainConfigService } from '@/services/chain-config'
import { useChainConfigState } from '@/stores/chain-config'
import { WalletAddressPortfolioView, type WalletAddressPortfolioViewProps } from './wallet-address-portfolio-view'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'
import type { Transaction, Action } from '@/services/chain-adapter/providers/types'
import { Amount } from '@/types/amount'

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
    queryFn: async (): Promise<TokenInfo[]> => {
      // Re-create provider inside queryFn to ensure we have latest
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      
      if (!currentProvider?.getTokenBalances) {
        if (currentProvider?.getNativeBalance) {
          const balance = await currentProvider.getNativeBalance(address)
          return [{
            symbol: balance.symbol,
            name: balance.symbol,
            balance: balance.amount.toFormatted(),
            decimals: balance.amount.decimals,
            chain: chainId,
          }]
        }
        return []
      }
      const tokens = await currentProvider.getTokenBalances(address)
      return tokens.map(t => ({
        symbol: t.symbol,
        name: t.name,
        balance: t.amount.toFormatted(),
        decimals: t.amount.decimals,
        chain: chainId,
      }))
    },
    enabled: tokensEnabled,
    staleTime: 30_000,
  })

  const transactionsQuery = useQuery({
    queryKey: ['address-transactions', chainId, address, !!provider],
    queryFn: async (): Promise<TransactionInfo[]> => {
      const currentProvider = chainConfigState.snapshot ? createChainProvider(chainId) : null
      if (!currentProvider?.getTransactionHistory) return []
      const txs = await currentProvider.getTransactionHistory(address, 20)
      return txs.map(tx => convertToTransactionInfo(tx, address, chainId, decimals))
    },
    enabled: transactionsEnabled,
    staleTime: 30_000,
  })

  // Show loading if provider not ready OR query is loading
  const tokensLoading = !tokensEnabled || tokensQuery.isLoading
  const transactionsLoading = !transactionsEnabled || transactionsQuery.isLoading

  return (
    <WalletAddressPortfolioView
      chainId={chainId}
      chainName={chainName}
      tokens={tokensQuery.data ?? []}
      transactions={transactionsQuery.data ?? []}
      tokensLoading={tokensLoading}
      transactionsLoading={transactionsLoading}
      tokensRefreshing={tokensQuery.isFetching && !tokensQuery.isLoading}
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
  address: string, 
  chainId: ChainType,
  fallbackDecimals: number
): TransactionInfo {
  // 使用 direction 判断对方地址
  const counterpartyAddress = tx.direction === 'out' ? tx.to : tx.from
  
  // 获取主要资产信息 (第一个资产)
  const primaryAsset = tx.assets[0]
  const value = primaryAsset?.value ?? '0'
  const symbol = primaryAsset?.symbol ?? ''
  const decimals = primaryAsset?.decimals ?? fallbackDecimals
  
  // 将 action + direction 映射到 UI TransactionType
  const uiType = mapToUIType(tx.action, tx.direction)
  
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

/** 将 action + direction 映射到 UI TransactionType */
function mapToUIType(action: Action, direction: 'in' | 'out' | 'self'): TransactionType {
  // 基于 action 的直接映射
  const actionMap: Partial<Record<Action, TransactionType>> = {
    gift: 'gift',
    grab: 'grab',
    trust: 'trust',
    signFor: 'signFor',
    signature: 'signature',
    emigrate: 'emigrate',
    immigrate: 'immigrate',
    swap: 'exchange',
    stake: 'stake',
    unstake: 'unstake',
    issueAsset: 'issueAsset',
    increaseAsset: 'increaseAsset',
    destroyAsset: 'destroy',
    issueEntity: 'issueEntity',
    destroyEntity: 'destroyEntity',
    locationName: 'locationName',
    dapp: 'dapp',
    certificate: 'certificate',
    mark: 'mark',
    approve: 'signature',
    mint: 'issueAsset',
    burn: 'destroy',
    claim: 'receive',
    contract: 'interaction',
  }
  
  if (actionMap[action]) {
    return actionMap[action]!
  }
  
  // 对于 transfer/unknown，使用 direction 判断
  if (direction === 'out') return 'send'
  if (direction === 'in') return 'receive'
  return 'other' // self transfer
}
