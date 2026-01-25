import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenList } from '@/components/token/token-list'
import { TransactionList } from '@/components/transaction/transaction-list'
import { SwipeableTabs } from '@/components/layout/swipeable-tabs'
import { ServiceStatusAlert } from '@/components/common/service-status-alert'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { LoadingSpinner } from '@biochain/key-ui'
import type { TokenInfo, TokenItemContext, TokenMenuItem } from '@/components/token/token-item'
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
  transactionsRefreshing?: boolean
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
  /** Render prop for token item actions (deprecated: use tokenMenuItems) */
  renderTokenActions?: (token: TokenInfo, context: TokenItemContext) => React.ReactNode
  /** Context menu handler for token items (matches TokenItem signature) */
  onTokenContextMenu?: (e: React.MouseEvent, token: TokenInfo) => void
  /** Menu items for token dropdown menu (recommended approach) */
  tokenMenuItems?: (token: TokenInfo, context: TokenItemContext) => TokenMenuItem[]
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
  transactionsRefreshing = false,
  tokensSupported = true,
  tokensFallbackReason,
  transactionsSupported = true,
  transactionsFallbackReason,
  onTokenClick,
  onTransactionClick,
  renderTransactionFooter,
  mainAssetSymbol,
  renderTokenActions,
  onTokenContextMenu,
  tokenMenuItems,
  className,
  testId = 'wallet-address-portfolio',
}: WalletAddressPortfolioViewProps) {
  const { t } = useTranslation(['home', 'transaction', 'common'])
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
                <ServiceStatusAlert
                  type="notSupported"
                  feature={t('home:wallet.tokenBalance')}
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
                onContextMenu={onTokenContextMenu}
                menuItems={tokenMenuItems}
                testId={`${testId}-token-list`}
              />
            </div>
          ) : (
            <div className="p-4" data-testid={`${testId}-history-panel`}>
              {!transactionsSupported && !transactionsLoading && (
                <ServiceStatusAlert
                  type="notSupported"
                  feature={t('home:wallet.transactionHistory')}
                  reason={transactionsFallbackReason}
                  className="mb-4"
                />
              )}
              {transactionsRefreshing && transactions.length > 0 && (
                <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
                  <LoadingSpinner className="size-3" />
                  {t('common:loading')}
                </div>
              )}
              <ErrorBoundary
                fallback={(error, reset) => (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-destructive mb-2">{t('transaction:history.loadFailed')}</p>
                    <p className="text-xs text-muted-foreground mb-3">{error.message}</p>
                    <button
                      onClick={reset}
                      className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
                    >
                      {t('common:retry')}
                    </button>
                  </div>
                )}
              >
                <TransactionList
                  transactions={transactions}
                  loading={transactionsLoading}
                  onTransactionClick={onTransactionClick}
                  emptyTitle={t('transaction:history.emptyTitle')}
                  emptyDescription={t('transaction:history.emptyDesc')}
                  testId={`${testId}-transaction-list`}
                />
              </ErrorBoundary>
              {renderTransactionFooter?.()}
            </div>
          )
        }
      </SwipeableTabs>
    </div>
  )
}
