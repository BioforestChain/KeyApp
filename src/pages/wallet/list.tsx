import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Plus, Check, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { walletStore, walletActions, walletSelectors, type Wallet } from '@/stores'
import { cn } from '@/lib/utils'

export function WalletListPage() {
  const navigate = useNavigate()
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId)

  // 切换当前钱包
  const handleSelectWallet = useCallback((walletId: string) => {
    walletActions.setCurrentWallet(walletId)
  }, [])

  // 进入钱包详情
  const handleWalletDetail = useCallback((walletId: string) => {
    navigate({ to: '/wallet/$walletId', params: { walletId } })
  }, [navigate])

  // 创建新钱包
  const handleCreateWallet = useCallback(() => {
    navigate({ to: '/onboarding/create' })
  }, [navigate])

  // 返回
  const handleBack = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader
        title="钱包管理"
        showBack
        onBack={handleBack}
        trailing={
          <button
            onClick={handleCreateWallet}
            className={cn(
              'p-2 rounded-full transition-colors',
              'hover:bg-muted active:bg-muted/80'
            )}
            aria-label="创建钱包"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      <div className="flex-1 p-4">
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted-foreground">还没有钱包</p>
            <button
              onClick={handleCreateWallet}
              className={cn(
                'rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white',
                'hover:bg-primary/90 active:bg-primary/80'
              )}
            >
              创建钱包
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <WalletListItem
                key={wallet.id}
                wallet={wallet}
                isActive={wallet.id === currentWalletId}
                onSelect={() => handleSelectWallet(wallet.id)}
                onDetail={() => handleWalletDetail(wallet.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface WalletListItemProps {
  wallet: Wallet
  isActive: boolean
  onSelect: () => void
  onDetail: () => void
}

function WalletListItem({ wallet, isActive, onSelect, onDetail }: WalletListItemProps) {
  // 计算总余额
  const totalBalance = wallet.chainAddresses.reduce(
    (sum, ca) => sum + ca.tokens.reduce((s, t) => s + t.fiatValue, 0),
    0
  )

  return (
    <div
      className={cn(
        'rounded-xl bg-card p-4 shadow-sm transition-colors',
        isActive && 'ring-2 ring-primary'
      )}
    >
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <button
          onClick={onSelect}
          className={cn(
            'flex size-12 items-center justify-center rounded-full text-lg font-semibold',
            isActive ? 'bg-primary text-white' : 'bg-muted'
          )}
        >
          {wallet.name.slice(0, 1)}
        </button>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{wallet.name}</h3>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Check className="size-3" />
                当前
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {wallet.chainAddresses.length} 个链地址
          </p>
        </div>

        {/* 余额和详情 */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={onDetail}
            className={cn(
              'p-2 rounded-full transition-colors',
              'hover:bg-muted active:bg-muted/80'
            )}
            aria-label="查看详情"
          >
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 地址预览 */}
      <p className="mt-2 text-xs text-muted-foreground font-mono truncate">
        {wallet.address}
      </p>
    </div>
  )
}
