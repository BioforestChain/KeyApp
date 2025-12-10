import { cn } from '@/lib/utils'
import { TokenIcon } from '@/components/token/token-icon'
import { formatAssetAmount, type AssetInfo } from '@/types/asset'
import { ChevronRight } from 'lucide-react'

interface AssetItemProps {
  /** Asset information */
  asset: AssetInfo
  /** Click handler */
  onClick?: () => void
  /** Show navigation chevron */
  showChevron?: boolean
  /** Additional class name */
  className?: string
}

/**
 * Single asset row in the asset list
 * Displays token icon, name, symbol, and balance
 */
export function AssetItem({
  asset,
  onClick,
  showChevron = true,
  className,
}: AssetItemProps) {
  const formattedAmount = formatAssetAmount(asset.amount, asset.decimals)
  const displayName = asset.name || asset.assetType

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 transition-colors',
        onClick && 'hover:bg-muted/50 active:bg-muted',
        !onClick && 'cursor-default',
        className,
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

      {/* Balance */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tabular-nums">{formattedAmount}</span>
        {showChevron && onClick && (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
      </div>
    </button>
  )
}
