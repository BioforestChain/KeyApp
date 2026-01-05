import { useQuery } from '@tanstack/react-query'
import { getChainProvider } from '@/services/chain-adapter'
import { chainConfigService } from '@/services/chain-config'
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
  const provider = getChainProvider(chainId)
  const decimals = chainConfigService.getDecimals(chainId)

  const tokensQuery = useQuery({
    queryKey: ['address-token-balances', chainId, address],
    queryFn: async (): Promise<TokenInfo[]> => {
      if (!provider?.getTokenBalances) {
        if (provider?.getNativeBalance) {
          const balance = await provider.getNativeBalance(address)
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
      const tokens = await provider.getTokenBalances(address)
      return tokens.map(t => ({
        symbol: t.symbol,
        name: t.name,
        balance: t.amount.toFormatted(),
        decimals: t.amount.decimals,
        chain: chainId,
      }))
    },
    enabled: !!provider && (provider.supportsTokenBalances || provider.supportsNativeBalance),
    staleTime: 30_000,
  })

  const transactionsQuery = useQuery({
    queryKey: ['address-transactions', chainId, address],
    queryFn: async (): Promise<TransactionInfo[]> => {
      if (!provider?.getTransactionHistory) return []
      const txs = await provider.getTransactionHistory(address, 20)
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
    enabled: !!provider?.supportsTransactionHistory,
    staleTime: 30_000,
  })

  return (
    <WalletAddressPortfolioView
      chainId={chainId}
      chainName={chainName}
      tokens={tokensQuery.data ?? []}
      transactions={transactionsQuery.data ?? []}
      tokensLoading={tokensQuery.isLoading}
      transactionsLoading={transactionsQuery.isLoading}
      tokensRefreshing={tokensQuery.isFetching && !tokensQuery.isLoading}
      onTokenClick={onTokenClick}
      onTransactionClick={onTransactionClick}
      className={className}
      testId={testId}
    />
  )
}
