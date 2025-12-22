/**
 * Staking Pool Card - Displays pool statistics and actions
 */

import { useTranslation } from 'react-i18next'
import { TokenIcon } from '@/components/token/token-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Amount } from '@/types/amount'
import type { StakingOverviewItem } from '@/types/staking'

interface StakingPoolCardProps {
  item: StakingOverviewItem
  onMint?: ((item: StakingOverviewItem) => void) | undefined
  className?: string
}

/** Format large numbers with decimals */
function formatAmount(value: Amount): string {
  const num = value.toNumber()
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(Math.min(5, 8))
}

/** Staking pool card component */
export function StakingPoolCard({ item, onMint, className }: StakingPoolCardProps) {
  const { t } = useTranslation('staking')

  const stats = [
    { label: t('totalMinted', { asset: item.assetType }), value: item.totalMinted },
    { label: t('totalCirculation', { asset: item.assetType }), value: item.totalCirculation },
    { label: t('totalBurned', { asset: item.assetType }), value: item.totalBurned },
    { label: t('totalStaked', { asset: item.externalAssetType }), value: item.totalStaked },
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl shadow-md',
        'bg-gradient-to-b from-primary/90 to-primary',
        className
      )}
    >
      {/* Stats grid */}
      <div className="relative grid grid-cols-2 gap-3 p-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <span className="text-lg font-semibold text-amber-300">
              {formatAmount(stat.value)}
            </span>
            <span className="text-xs text-primary-foreground/70">{stat.label}</span>
          </div>
        ))}

        {/* Background chain badge */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
            {item.chain.charAt(0)}
          </div>
        </div>
      </div>

      {/* Footer with token info and mint button */}
      <div className="flex items-center justify-between bg-card px-4 py-3">
        {/* External chain info */}
        <div className="flex items-center gap-2">
          <TokenIcon symbol={item.externalAssetType} size="sm" />
          <div className="text-xs">
            <div className="font-medium text-foreground">{item.externalAssetType}</div>
            <div className="text-muted-foreground">{item.externalChain}</div>
          </div>
        </div>

        {/* Internal chain info + mint */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TokenIcon symbol={item.assetType} size="sm" />
            <div className="text-xs">
              <div className="font-medium text-foreground">{item.assetType}</div>
              <div className="text-muted-foreground">{item.chain}</div>
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            className="rounded-full px-4"
            onClick={() => onMint?.(item)}
          >
            {t('mint')}
          </Button>
        </div>
      </div>
    </div>
  )
}
