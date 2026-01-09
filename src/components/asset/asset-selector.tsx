/**
 * AssetSelector - 资产选择器组件
 * 
 * 用于在转账、销毁等场景中选择资产
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { TokenIcon } from '@/components/wallet/token-icon'
import { AmountDisplay } from '@/components/common'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import type { TokenInfo } from '@/components/token/token-item'

export interface AssetSelectorProps {
  /** 当前选中的资产 */
  selectedAsset: TokenInfo | null
  /** 可选资产列表 */
  assets: TokenInfo[]
  /** 选择资产回调 */
  onSelect: (asset: TokenInfo) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 排除的资产符号列表 (如主资产不可销毁) */
  excludeAssets?: string[]
  /** 是否显示余额 */
  showBalance?: boolean
  /** 占位文本 */
  placeholder?: string
  /** 额外的 class */
  className?: string
  /** 测试 ID */
  testId?: string
}

/**
 * 资产选择器
 * 
 * 点击展开 Sheet 显示可选资产列表
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
  const { t } = useTranslation('transaction')
  const [open, setOpen] = useState(false)

  // 过滤可选资产
  const availableAssets = useMemo(() => {
    if (excludeAssets.length === 0) return assets
    const excludeSet = new Set(excludeAssets.map((s) => s.toUpperCase()))
    return assets.filter((asset) => !excludeSet.has(asset.symbol.toUpperCase()))
  }, [assets, excludeAssets])

  const handleSelect = (asset: TokenInfo) => {
    onSelect(asset)
    setOpen(false)
  }

  const displayPlaceholder = placeholder ?? t('assetSelector.selectAsset', '选择资产')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        disabled={disabled}
        data-testid={testId}
        className={cn(
          'flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 transition-colors',
          !disabled && 'hover:bg-muted cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        {selectedAsset ? (
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
                <span className="text-xs text-muted-foreground">
                  {t('assetSelector.balance', '余额')}: <AmountDisplay value={selectedAsset.balance} size="xs" className="inline" decimals={selectedAsset.decimals ?? 8} />
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{displayPlaceholder}</span>
        )}
        <IconChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </SheetTrigger>

      <SheetContent side="bottom" showCloseButton={false} className="max-h-[60vh]">
        <SheetHeader>
          <SheetTitle>{t('assetSelector.selectAsset', '选择资产')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {availableAssets.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <p>{t('assetSelector.noAssets', '暂无可选资产')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableAssets.map((asset) => {
                const isSelected = selectedAsset?.symbol === asset.symbol && selectedAsset?.chain === asset.chain
                return (
                  <button
                    key={`${asset.chain}-${asset.symbol}`}
                    type="button"
                    onClick={() => handleSelect(asset)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl p-3 transition-colors',
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50',
                    )}
                  >
                    <TokenIcon
                      symbol={asset.symbol}
                      chainId={asset.chain}
                      imageUrl={asset.icon}
                      size="md"
                    />
                    <div className="flex flex-1 flex-col items-start">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <AmountDisplay value={asset.balance} size="sm" decimals={asset.decimals ?? 8} />
                      </div>
                      {isSelected && <IconCheck className="size-5 text-primary" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </SheetContent>
    </Sheet>
  )
}
