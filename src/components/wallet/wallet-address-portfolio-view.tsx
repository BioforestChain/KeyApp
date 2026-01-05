import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenList } from '@/components/token/token-list'
import { TransactionList } from '@/components/transaction/transaction-list'
import { SwipeableTabs } from '@/components/layout/swipeable-tabs'
import type { TokenInfo } from '@/components/token/token-item'
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
  onTokenClick?: (token: TokenInfo) => void
  onTransactionClick?: (tx: TransactionInfo) => void
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
  onTokenClick,
  onTransactionClick,
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
              <TokenList
                tokens={tokens}
                loading={tokensLoading}
                refreshing={tokensRefreshing}
                onTokenClick={onTokenClick}
                emptyTitle={t('home:wallet.noAssets')}
                emptyDescription={t('home:wallet.noAssetsOnChain', { chain: displayChainName })}
                testId={`${testId}-token-list`}
              />
            </div>
          ) : (
            <div className="p-4" data-testid={`${testId}-history-panel`}>
              <TransactionList
                transactions={transactions}
                loading={transactionsLoading}
                onTransactionClick={onTransactionClick}
                emptyTitle={t('transaction:history.emptyTitle')}
                emptyDescription={t('transaction:history.emptyDesc')}
                testId={`${testId}-transaction-list`}
              />
            </div>
          )
        }
      </SwipeableTabs>
    </div>
  )
}
