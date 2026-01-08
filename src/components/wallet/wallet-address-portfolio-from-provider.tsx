import { useAddressPortfolio } from '@/queries'
import { WalletAddressPortfolioView, type WalletAddressPortfolioViewProps } from './wallet-address-portfolio-view'
import type { ChainType } from '@/stores'

export interface WalletAddressPortfolioFromProviderProps {
  chainId: ChainType
  address: string
  chainName?: string
  onTokenClick?: WalletAddressPortfolioViewProps['onTokenClick']
  onTransactionClick?: WalletAddressPortfolioViewProps['onTransactionClick']
  className?: string
  testId?: string
}

/**
 * 从 Provider 获取地址资产组合
 * 
 * 使用 useAddressPortfolio Hook 获取数据，复用 WalletAddressPortfolioView 展示。
 * 适用于 Stories 测试和任意地址查询场景。
 */
export function WalletAddressPortfolioFromProvider({
  chainId,
  address,
  chainName,
  onTokenClick,
  onTransactionClick,
  className,
  testId,
}: WalletAddressPortfolioFromProviderProps) {
  const portfolio = useAddressPortfolio(chainId, address)

  return (
    <WalletAddressPortfolioView
      chainId={chainId}
      chainName={chainName}
      tokens={portfolio.tokens}
      transactions={portfolio.transactions}
      tokensLoading={portfolio.tokensLoading}
      transactionsLoading={portfolio.transactionsLoading}
      tokensRefreshing={portfolio.tokensRefreshing}
      tokensSupported={portfolio.tokensSupported}
      tokensFallbackReason={portfolio.tokensFallbackReason}
      transactionsSupported={portfolio.transactionsSupported}
      transactionsFallbackReason={portfolio.transactionsFallbackReason}
      onTokenClick={onTokenClick}
      onTransactionClick={onTransactionClick}
      className={className}
      testId={testId}
    />
  )
}
