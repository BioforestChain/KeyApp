import { cn } from '@/lib/utils';
import { AssetItem } from './asset-item';
import type { AssetInfo } from '@/types/asset';
import { IconCoins as Coins } from '@tabler/icons-react';

export interface AssetListProps {
  /** List of assets to display */
  assets: AssetInfo[];
  /** Click handler for asset item */
  onAssetClick?: ((asset: AssetInfo) => void) | undefined;
  /** Loading state */
  isLoading?: boolean | undefined;
  /** Currency code for fiat display (default: USD) */
  currency?: string | undefined;
  /** Exchange rate from USD to target currency (1 USD = rate target currency) */
  exchangeRate?: number | undefined;
  /** Additional class name */
  className?: string | undefined;
}

/**
 * Scrollable list of asset items
 */
export function AssetList({
  assets,
  onAssetClick,
  isLoading = false,
  currency = 'USD',
  exchangeRate,
  className,
}: AssetListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/30 flex items-center gap-3 rounded-xl p-3">
            <div className="bg-muted size-10 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-5 w-20 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className={cn('flex flex-col items-center py-12', className)}>
        <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
          <Coins className="text-muted-foreground size-8" />
        </div>
        <p className="text-muted-foreground">暂无资产</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {assets.map((asset) => (
        <AssetItem
          key={`${asset.assetType}-${asset.contractAddress || 'native'}`}
          asset={asset}
          currency={currency}
          exchangeRate={exchangeRate}
          onClick={onAssetClick ? () => onAssetClick(asset) : undefined}
        />
      ))}
    </div>
  );
}
