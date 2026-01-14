/**
 * AssetSelector - 资产选择器组件
 *
 * 用于在转账、销毁等场景中选择资产
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TokenIcon } from '@/components/wallet/token-icon';
import { AmountDisplay } from '@/components/common';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { TokenInfo } from '@/components/token/token-item';

export interface AssetSelectorProps {
  /** 当前选中的资产 */
  selectedAsset: TokenInfo | null;
  /** 可选资产列表 */
  assets: TokenInfo[];
  /** 选择资产回调 */
  onSelect: (asset: TokenInfo) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 排除的资产符号列表 (如主资产不可销毁) */
  excludeAssets?: string[];
  /** 是否显示余额 */
  showBalance?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 额外的 class */
  className?: string;
  /** 测试 ID */
  testId?: string;
}

/**
 * 资产选择器
 *
 * 使用 Select 组件展示可选资产列表
 */
export function AssetSelector({
  selectedAsset,
  assets,
  onSelect,
  disabled = false,
  excludeAssets = [],
  showBalance = true,
  placeholder,
  className,
  testId,
}: AssetSelectorProps) {
  const { t } = useTranslation('transaction');

  // 过滤可选资产
  const availableAssets = useMemo(() => {
    if (excludeAssets.length === 0) return assets;
    const excludeSet = new Set(excludeAssets.map((s) => s.toUpperCase()));
    return assets.filter((asset) => !excludeSet.has(asset.symbol.toUpperCase()));
  }, [assets, excludeAssets]);

  // 生成唯一 key
  const getAssetKey = (asset: TokenInfo) => `${asset.chain}-${asset.symbol}`;

  const handleValueChange = (value: string | null) => {
    if (!value) return;
    const asset = availableAssets.find((a) => getAssetKey(a) === value);
    if (asset) {
      onSelect(asset);
    }
  };

  const displayPlaceholder = placeholder ?? t('assetSelector.selectAsset', '选择资产');
  const selectedValue = selectedAsset ? getAssetKey(selectedAsset) : undefined;

  // 渲染 trigger 内容
  const renderTriggerContent = () => {
    if (!selectedAsset) {
      return <span className="text-muted-foreground">{displayPlaceholder}</span>;
    }

    return (
      <div className="flex items-center gap-2.5">
        <TokenIcon
          symbol={selectedAsset.symbol}
          chainId={selectedAsset.chain}
          imageUrl={selectedAsset.icon}
          size="sm"
        />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{selectedAsset.symbol}</span>
          {showBalance && (
            <span className="text-muted-foreground text-xs">
              {t('assetSelector.balance', '余额')}:{' '}
              <AmountDisplay
                value={selectedAsset.balance}
                size="xs"
                className="inline"
                decimals={selectedAsset.decimals ?? 8}
                fixedDecimals={true}
              />
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Select value={selectedValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger data-testid={testId} className={cn('bg-muted/50 h-15! w-full px-3 py-2.5', className)}>
        {renderTriggerContent()}
      </SelectTrigger>

      <SelectContent>
        {availableAssets.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center py-4 text-sm">
            <p>{t('assetSelector.noAssets', '暂无可选资产')}</p>
          </div>
        ) : (
          availableAssets.map((asset) => (
            <SelectItem key={getAssetKey(asset)} value={getAssetKey(asset)} className="py-2">
              <div className="flex w-full items-center gap-3">
                <TokenIcon symbol={asset.symbol} chainId={asset.chain} imageUrl={asset.icon} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="font-medium">{asset.symbol}</span>
                  <span className="text-muted-foreground truncate text-xs">{asset.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <AmountDisplay value={asset.balance} size="sm" decimals={asset.decimals ?? 8} fixedDecimals={true} />
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
