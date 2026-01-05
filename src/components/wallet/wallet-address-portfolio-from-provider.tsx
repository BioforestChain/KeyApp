import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createChainProvider } from '@/services/chain-adapter'
import { chainConfigService } from '@/services/chain-config'
import { useChainConfigState } from '@/stores/chain-config'
import { WalletAddressPortfolioView, type WalletAddressPortfolioViewProps } from './wallet-address-portfolio-view'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'
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
      return txs.map(tx => {
        const isSend = tx.from.toLowerCase() === address.toLowerCase()
        return {
          id: tx.hash,
          type: (isSend ? 'send' : 'receive') as TransactionType,
          status: tx.status,
          amount: Amount.fromRaw(tx.value, decimals, tx.symbol),
          symbol: tx.symbol,
          address: isSend ? tx.to : tx.from,
          timestamp: new Date(tx.timestamp),
          hash: tx.hash,
          chain: chainId,
        }
      })
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
