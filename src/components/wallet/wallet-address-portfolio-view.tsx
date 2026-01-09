import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenList } from '@/components/token/token-list'
import { TransactionList } from '@/components/transaction/transaction-list'
import { SwipeableTabs } from '@/components/layout/swipeable-tabs'
import { ProviderFallbackWarning } from '@/components/common/provider-fallback-warning'
import type { TokenInfo, TokenItemContext } from '@/components/token/token-item'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'

export interface WalletAddressPortfolioViewProps {
  chainId: ChainType
  chainName?: string
  tokens: TokenInfo[]
  transactions: TransactionInfo[]
  tokensLoading?: boolean
  transactionsLoading?: boolean
  tokensRefreshing?: boolean
  /** 是否成功查询到 token 数据（false 表示 fallback） */
  tokensSupported?: boolean
  tokensFallbackReason?: string
  /** 是否成功查询到交易数据（false 表示 fallback） */
  transactionsSupported?: boolean
  transactionsFallbackReason?: string
  onTokenClick?: (token: TokenInfo) => void
  onTransactionClick?: (tx: TransactionInfo) => void
  /** 渲染交易列表底部额外内容（如"查看全部"按钮） */
  renderTransactionFooter?: () => React.ReactNode
  /** Main asset symbol for the chain (used for renderActions context) */
  mainAssetSymbol?: string
  /** Render prop for token item actions (e.g., dropdown menu) */
  renderTokenActions?: (token: TokenInfo, context: TokenItemContext) => React.ReactNode
  className?: string
  testId?: string
}

export function WalletAddressPortfolioView({
  chainId,
  chainName,
  tokens,
  transactions,
  tokensLoading = false,
  transactionsLoading = false,
  tokensRefreshing = false,
  tokensSupported = true,
  tokensFallbackReason,
  transactionsSupported = true,
  transactionsFallbackReason,
  onTokenClick,
  onTransactionClick,
  renderTransactionFooter,
  mainAssetSymbol,
  renderTokenActions,
  className,
  testId = 'wallet-address-portfolio',
}: WalletAddressPortfolioViewProps) {
  const { t } = useTranslation(['home', 'transaction'])
  const [activeTab, setActiveTab] = useState('assets')
  const displayChainName = chainName ?? chainId

  return (
    <div data-testid={testId} className={className}>
      <SwipeableTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="h-full"
        testIdPrefix={`${testId}-tabs`}
      >
        {(tab) =>
          tab === 'assets' ? (
            <div className="p-4" data-testid={`${testId}-assets-panel`}>
              {!tokensSupported && !tokensLoading && (
                <ProviderFallbackWarning
                  feature="Token balance"
                  reason={tokensFallbackReason}
                  className="mb-4"
                />
              )}
              <TokenList
                tokens={tokens}
                loading={tokensLoading}
                refreshing={tokensRefreshing}
                onTokenClick={onTokenClick}
                emptyTitle={t('home:wallet.noAssets')}
                emptyDescription={t('home:wallet.noAssetsOnChain', { chain: displayChainName })}
                mainAssetSymbol={mainAssetSymbol}
                renderActions={renderTokenActions}
                testId={`${testId}-token-list`}
              />
            </div>
          ) : (
            <div className="p-4" data-testid={`${testId}-history-panel`}>
              {!transactionsSupported && !transactionsLoading && (
                <ProviderFallbackWarning
                  feature="Transaction history"
                  reason={transactionsFallbackReason}
                  className="mb-4"
                />
              )}
              <TransactionList
                transactions={transactions}
                loading={transactionsLoading}
                onTransactionClick={onTransactionClick}
                emptyTitle={t('transaction:history.emptyTitle')}
                emptyDescription={t('transaction:history.emptyDesc')}
                testId={`${testId}-transaction-list`}
              />
              {renderTransactionFooter?.()}
            </div>
          )
        }
      </SwipeableTabs>
    </div>
  )
}
