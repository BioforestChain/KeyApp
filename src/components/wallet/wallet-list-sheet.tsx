import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { useWalletTheme, WALLET_THEME_PRESETS, type WalletThemePreset } from '@/hooks/useWalletTheme'
import type { Wallet } from '@/stores'
import {
  IconCheck as Check,
  IconGripVertical as GripVertical,
  IconPlus as Plus,
  IconPalette as Palette,
} from '@tabler/icons-react'

interface WalletListSheetProps {
  wallets: Wallet[]
  currentWalletId: string | null
  onSelectWallet: (walletId: string) => void
  onAddWallet: () => void
  onReorderWallets?: (walletIds: string[]) => void
  className?: string
}

/**
 * 钱包列表 Sheet 组件
 * 用于展示、选择、排序钱包，以及更改主题色
 */
export function WalletListSheet({
  wallets,
  currentWalletId,
  onSelectWallet,
  onAddWallet,
  onReorderWallets,
  className,
}: WalletListSheetProps) {
  const { getWalletTheme, setThemePreset } = useWalletTheme()
  const [editingThemeWalletId, setEditingThemeWalletId] = useState<string | null>(null)

  // 计算钱包总余额
  const getTotalBalance = (wallet: Wallet) => {
    return wallet.chainAddresses.reduce(
      (sum, ca) => sum + ca.tokens.reduce((s, t) => s + t.fiatValue, 0),
      0
    )
  }

  const handleThemeChange = useCallback(
    (walletId: string, preset: WalletThemePreset) => {
      setThemePreset(walletId, preset)
      setEditingThemeWalletId(null)
    },
    [setThemePreset]
  )

  return (
    <div className={cn('flex flex-col', className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-lg font-semibold">我的钱包</h3>
        <button
          onClick={onAddWallet}
          className="text-primary flex items-center gap-1 text-sm font-medium"
        >
          <Plus className="size-4" />
          <span>添加</span>
        </button>
      </div>

      {/* 钱包列表 */}
      <div className="flex-1 overflow-auto">
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted-foreground">暂无钱包</p>
            <button
              onClick={onAddWallet}
              className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium"
            >
              创建钱包
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {wallets.map((wallet) => {
              const isActive = wallet.id === currentWalletId
              const themeHue = getWalletTheme(wallet.id)
              const isEditingTheme = editingThemeWalletId === wallet.id

              return (
                <div key={wallet.id} className="relative">
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors',
                      isActive && 'bg-primary/5'
                    )}
                  >
                    {/* 拖拽手柄 */}
                    <button
                      className="text-muted-foreground/50 cursor-grab touch-none active:cursor-grabbing"
                      aria-label="拖拽排序"
                    >
                      <GripVertical className="size-5" />
                    </button>

                    {/* 钱包头像 - 带主题色 */}
                    <button
                      onClick={() => onSelectWallet(wallet.id)}
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white',
                        isActive && 'ring-primary ring-2 ring-offset-2'
                      )}
                      style={{
                        background: `linear-gradient(135deg, 
                          oklch(0.5 0.2 ${themeHue}) 0%, 
                          oklch(0.4 0.25 ${themeHue + 30}) 100%)`,
                      }}
                    >
                      {wallet.name.slice(0, 1)}
                    </button>

                    {/* 钱包信息 */}
                    <button
                      onClick={() => onSelectWallet(wallet.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-semibold">{wallet.name}</h4>
                        {isActive && (
                          <span className="text-primary flex items-center gap-0.5 text-xs">
                            <Check className="size-3" />
                            当前
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        ${getTotalBalance(wallet).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </button>

                    {/* 主题色按钮 */}
                    <button
                      onClick={() =>
                        setEditingThemeWalletId(isEditingTheme ? null : wallet.id)
                      }
                      className={cn(
                        'rounded-full p-2 transition-colors',
                        'hover:bg-muted active:bg-muted/80',
                        isEditingTheme && 'bg-muted'
                      )}
                      aria-label="更改主题色"
                    >
                      <Palette className="text-muted-foreground size-4" />
                    </button>
                  </div>

                  {/* 主题色选择器 */}
                  {isEditingTheme && (
                    <div className="bg-muted/50 flex flex-wrap gap-2 px-4 py-3">
                      {(Object.keys(WALLET_THEME_PRESETS) as WalletThemePreset[]).map(
                        (preset) => {
                          const hue = WALLET_THEME_PRESETS[preset]
                          const isSelected = themeHue === hue

                          return (
                            <button
                              key={preset}
                              onClick={() => handleThemeChange(wallet.id, preset)}
                              className={cn(
                                'size-8 rounded-full transition-transform',
                                isSelected && 'ring-2 ring-offset-2 scale-110'
                              )}
                              style={{
                                background: `linear-gradient(135deg, 
                                  oklch(0.55 0.2 ${hue}) 0%, 
                                  oklch(0.45 0.25 ${hue + 30}) 100%)`,
                                ringColor: `oklch(0.5 0.2 ${hue})`,
                              }}
                              aria-label={preset}
                            />
                          )
                        }
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
