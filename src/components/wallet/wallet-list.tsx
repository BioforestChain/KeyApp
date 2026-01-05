import { IconCircleCheckFilled, IconPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { WalletMiniCard } from './wallet-mini-card'
import { AddressDisplay } from './address-display'

export interface WalletListItem {
  id: string
  name: string
  address: string
  themeHue: number
  /** 链图标 URL，用于彩虹水印 */
  chainIconUrl?: string
}

export interface WalletListProps {
  wallets: WalletListItem[]
  currentWalletId?: string | null
  onSelect?: (walletId: string) => void
  onAddWallet?: () => void
  showAddButton?: boolean
  className?: string
}

export function WalletList({
  wallets,
  currentWalletId,
  onSelect,
  onAddWallet,
  showAddButton = true,
  className,
}: WalletListProps) {
  const { t } = useTranslation(['wallet', 'common'])

  if (wallets.length === 0 && !showAddButton) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        <p>{t('wallet:empty')}</p>
        <p className="mt-1 text-sm">{t('wallet:emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)} role="listbox" aria-label={t('common:a11y.selectWallet')}>
      {wallets.map((wallet) => {
        const isActive = wallet.id === currentWalletId

        return (
          <button
            key={wallet.id}
            onClick={() => onSelect?.(wallet.id)}
            role="option"
            aria-selected={isActive}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-4 transition-all',
              'active:scale-[0.98]',
              isActive
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'bg-muted/50 hover:bg-muted'
            )}
          >
            <WalletMiniCard themeHue={wallet.themeHue} size="md" watermarkIconUrl={wallet.chainIconUrl} />

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{wallet.name}</span>
                {isActive && (
                  <IconCircleCheckFilled className="size-4 shrink-0 text-primary" />
                )}
              </div>
              <AddressDisplay
                address={wallet.address}
                startChars={6}
                endChars={4}
                copyable={false}
                className="text-xs text-muted-foreground"
              />
            </div>
          </button>
        )
      })}

      {showAddButton && (
        <button
          onClick={onAddWallet}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl p-4',
            'bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors'
          )}
        >
          <IconPlus className="size-5" />
          <span className="font-medium">{t('wallet:add')}</span>
        </button>
      )}
    </div>
  )
}
