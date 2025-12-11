import { cn } from '@/lib/utils'
import { TokenIcon } from '@/components/token/token-icon'
import {
  formatAssetAmount,
  formatFiatValue,
  formatPriceChange,
  type AssetInfo,
} from '@/types/asset'
import { ChevronRight } from 'lucide-react'

export interface AssetItemProps {
  /** Asset information */
  asset: AssetInfo
  /** Click handler */
  onClick?: (() => void) | undefined
  /** Show navigation chevron */
  showChevron?: boolean | undefined
  /** Currency code for fiat display (default: USD) */
  currency?: string | undefined
  /** Additional class name */
  className?: string | undefined
}

/**
 * Single asset row in the asset list
 * Displays token icon, name, symbol, balance, fiat value, and 24h change
 */
export function AssetItem({
  asset,
  onClick,
  showChevron = true,
  currency = 'USD',
  className,
}: AssetItemProps) {
  const formattedAmount = formatAssetAmount(asset.amount, asset.decimals)
  const displayName = asset.name || asset.assetType

  // Calculate fiat value if price is available
  const fiatValue =
    asset.priceUsd !== undefined
      ? formatFiatValue(asset.amount, asset.decimals, asset.priceUsd, currency)
      : null

  // Format 24h change
  const priceChange = formatPriceChange(asset.priceChange24h)
  const isPositiveChange =
    asset.priceChange24h !== undefined && asset.priceChange24h >= 0

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 transition-colors',
        onClick && 'hover:bg-muted/50 active:bg-muted',
        !onClick && 'cursor-default',
        className
      )}
    >
      {/* Token icon */}
      <TokenIcon
        symbol={asset.assetType}
        imageUrl={asset.logoUrl}
        size="lg"
      />

      {/* Token info */}
      <div className="flex flex-1 flex-col items-start">
        <span className="font-medium">{displayName}</span>
        <span className="text-sm text-muted-foreground">{asset.assetType}</span>
      </div>

      {/* Balance and price */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{formattedAmount}</span>
          {showChevron && onClick && (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </div>
        {(fiatValue || priceChange) && (
          <div className="flex items-center gap-1.5 text-sm">
            {fiatValue && (
              <span className="text-muted-foreground tabular-nums">
                {fiatValue}
              </span>
            )}
            {priceChange && (
              <span
                className={cn(
                  'tabular-nums',
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                )}
              >
                {priceChange}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
