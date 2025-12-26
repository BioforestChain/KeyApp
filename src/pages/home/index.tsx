import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation, useFlow } from '@/stackflow'
import { TokenList } from '@/components/token/token-list'
import { TransactionList } from '@/components/transaction/transaction-list'
import { GradientButton } from '@/components/common/gradient-button'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { WalletCardCarousel } from '@/components/wallet/wallet-card-carousel'
import { WalletListSheet } from '@/components/wallet/wallet-list-sheet'
import { SwipeableContentTabs } from '@/components/home/content-tabs'
import { useWalletTheme } from '@/hooks/useWalletTheme'
import { useClipboard, useToast, useHaptics } from '@/services'
import { useTransactionHistoryQuery } from '@/queries'
import {
  IconPlus as Plus,
  IconSend as Send,
  IconQrcode as QrCode,
  IconLineScan as ScanLine,
} from '@tabler/icons-react'
import {
  useCurrentWallet,
  useSelectedChain,
  useCurrentChainTokens,
  useHasWallet,
  useWalletInitialized,
  walletActions,
  walletStore,
  type ChainType,
} from '@/stores'
import { useStore } from '@tanstack/react-store'
import type { TransactionInfo } from '@/components/transaction/transaction-item'

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
}

export function HomePage() {
  const { navigate } = useNavigation()
  const { push } = useFlow()
  const clipboard = useClipboard()
  const toast = useToast()
  const haptics = useHaptics()
  const { t } = useTranslation(['home', 'common', 'transaction'])

  const isInitialized = useWalletInitialized()
  const hasWallet = useHasWallet()
  const currentWallet = useCurrentWallet()
  const selectedChain = useSelectedChain()
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain
  const tokens = useCurrentChainTokens()
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId)

  // 初始化钱包主题
  useWalletTheme()

  // 交易历史
  const { transactions, isLoading: txLoading } = useTransactionHistoryQuery(currentWallet?.id)

  // 钱包列表 Sheet 状态
  const [walletListOpen, setWalletListOpen] = useState(false)
  // 当前内容 Tab
  const [activeTab, setActiveTab] = useState('assets')

  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize()
    }
  }, [isInitialized])

  // 复制地址
  const handleCopyAddress = useCallback(
    async (address: string) => {
      await clipboard.write({ text: address })
      await haptics.impact('light')
      toast.show(t('wallet.addressCopied'))
    },
    [clipboard, haptics, toast, t]
  )

  // 打开链选择器
  const handleOpenChainSelector = useCallback(() => {
    push('ChainSelectorJob', {})
  }, [push])

  // 打开钱包设置
  const handleOpenWalletSettings = useCallback(
    (walletId: string) => {
      navigate({ to: `/wallet/${walletId}` })
    },
    [navigate]
  )

  // 切换钱包
  const handleWalletChange = useCallback((walletId: string) => {
    walletActions.setCurrentWallet(walletId)
  }, [])

  // 添加钱包
  const handleAddWallet = useCallback(() => {
    push('WalletAddJob', {})
    setWalletListOpen(false)
  }, [push])

  // 交易点击
  const handleTransactionClick = useCallback(
    (tx: TransactionInfo) => {
      if (tx.id) {
        navigate({ to: `/transaction/${tx.id}` })
      }
    },
    [navigate]
  )

  if (!isInitialized) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!hasWallet || !currentWallet) {
    return <NoWalletView />
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      {/* 钱包卡片轮播 */}
      <div className="bg-gradient-to-b from-background to-muted/30 pt-4 pb-2">
        <WalletCardCarousel
          wallets={wallets}
          currentWalletId={currentWalletId}
          selectedChain={selectedChain}
          chainNames={CHAIN_NAMES}
          onWalletChange={handleWalletChange}
          onCopyAddress={handleCopyAddress}
          onOpenChainSelector={handleOpenChainSelector}
          onOpenSettings={handleOpenWalletSettings}
          onOpenWalletList={() => setWalletListOpen(true)}
        />

        {/* 快捷操作按钮 */}
        <div className="mt-4 flex justify-center gap-6 px-6">
          <button
            onClick={() => navigate({ to: '/send' })}
            className="flex flex-col items-center gap-1"
          >
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <Send className="text-primary size-5" />
            </div>
            <span className="text-xs">{t('wallet.send')}</span>
          </button>
          <button
            onClick={() => navigate({ to: '/receive' })}
            className="flex flex-col items-center gap-1"
          >
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <QrCode className="text-primary size-5" />
            </div>
            <span className="text-xs">{t('wallet.receive')}</span>
          </button>
          <button
            onClick={() => navigate({ to: '/scanner' })}
            className="flex flex-col items-center gap-1"
          >
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <ScanLine className="text-primary size-5" />
            </div>
            <span className="text-xs">{t('common:a11y.scan')}</span>
          </button>
        </div>
      </div>

      {/* 内容区 Tab 切换 */}
      <div className="bg-background -mt-2 flex-1 rounded-t-3xl pt-2">
        <SwipeableContentTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="h-full"
        >
          {(tab) =>
            tab === 'assets' ? (
              <div className="p-4">
                <TokenList
                  tokens={tokens.map((token) => ({
                    symbol: token.symbol,
                    name: token.name,
                    chain: selectedChain,
                    balance: token.balance,
                    fiatValue: token.fiatValue ? String(token.fiatValue) : undefined,
                    change24h: token.change24h,
                    icon: token.icon,
                  }))}
                  onTokenClick={(token) => {
                    console.log('Token clicked:', token.symbol)
                  }}
                  emptyTitle={t('wallet.noAssets')}
                  emptyDescription={t('wallet.noAssetsOnChain', { chain: selectedChainName })}
                />
              </div>
            ) : (
              <div className="p-4">
                <TransactionList
                  transactions={transactions}
                  loading={txLoading}
                  onTransactionClick={handleTransactionClick}
                  emptyTitle={t('transaction:history.emptyTitle')}
                  emptyDescription={t('transaction:history.emptyDesc')}
                />
              </div>
            )
          }
        </SwipeableContentTabs>
      </div>

      {/* 钱包列表 Sheet */}
      {walletListOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setWalletListOpen(false)}
          />
          <div className="bg-background absolute right-0 bottom-0 left-0 max-h-[70vh] animate-slide-in-bottom rounded-t-3xl">
            <WalletListSheet
              wallets={wallets}
              currentWalletId={currentWalletId}
              onSelectWallet={(id) => {
                handleWalletChange(id)
                setWalletListOpen(false)
              }}
              onAddWallet={handleAddWallet}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NoWalletView() {
  const { navigate } = useNavigation()
  const { t } = useTranslation(['home', 'common'])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary/10 rounded-full p-6">
        <Plus className="text-primary size-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t('welcome.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('welcome.subtitle')}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <GradientButton
          variant="mint"
          className="w-full"
          onClick={() => navigate({ to: '/wallet/create' })}
        >
          {t('welcome.createWallet')}
        </GradientButton>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate({ to: '/onboarding/recover' })}
        >
          {t('welcome.importWallet')}
        </Button>
      </div>
    </div>
  )
}
