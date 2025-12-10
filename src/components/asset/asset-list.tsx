import { cn } from '@/lib/utils'
import { AssetItem } from './asset-item'
import type { AssetInfo } from '@/types/asset'
import { Coins } from 'lucide-react'

interface AssetListProps {
  /** List of assets to display */
  assets: AssetInfo[]
  /** Click handler for asset item */
  onAssetClick?: (asset: AssetInfo) => void
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

/**
 * Scrollable list of asset items
 */
export function AssetList({
  assets,
  onAssetClick,
  isLoading = false,
  className,
}: AssetListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
          >
            <div className="size-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className={cn('flex flex-col items-center py-12', className)}>
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Coins className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">暂无资产</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {assets.map((asset) => (
        <AssetItem
          key={`${asset.assetType}-${asset.contractAddress || 'native'}`}
          asset={asset}
          onClick={onAssetClick ? () => onAssetClick(asset) : undefined}
        />
      ))}
    </div>
  )
}
