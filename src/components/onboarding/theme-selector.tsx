import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { WALLET_THEME_COLORS, deriveThemeHue } from '@/hooks/useWalletTheme'
import { WalletCard } from '@/components/wallet/wallet-card'
import type { Wallet } from '@/stores'
import { IconCheck } from '@tabler/icons-react'

interface ThemeSelectorProps {
  /** 助记词或密钥（用于派生默认主题色） */
  secret: string
  /** 当前选中的 hue 值 */
  value: number
  /** 主题色变化回调 */
  onChange: (hue: number) => void
  /** 预览钱包信息 */
  previewWallet?: Partial<Wallet>
  className?: string
}

/**
 * 钱包主题色选择器
 * 显示卡片预览和颜色选择
 */
export function ThemeSelector({
  secret,
  value,
  onChange,
  previewWallet,
  className,
}: ThemeSelectorProps) {
  const [derivedHue] = useState(() => deriveThemeHue(secret))

  // 初始化时使用派生的主题色
  useEffect(() => {
    if (value === 0 && derivedHue !== 0) {
      onChange(derivedHue)
    }
  }, [derivedHue, value, onChange])

  // 构建预览钱包数据
  const mockWallet: Wallet = {
    id: 'preview',
    name: previewWallet?.name || '我的钱包',
    address: previewWallet?.address || '0x1234...5678',
    chain: previewWallet?.chain || 'ethereum',
    chainAddresses: previewWallet?.chainAddresses || [],
    createdAt: Date.now(),
    themeHue: value,
    tokens: [],
  }

  // 所有可选颜色（包括派生的颜色）
  const allColors = [
    { name: '自动', hue: derivedHue, color: `oklch(0.6 0.25 ${derivedHue})`, isAuto: true },
    ...WALLET_THEME_COLORS,
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* 卡片预览 */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <WalletCard
            wallet={mockWallet}
            themeHue={value}
            chain="ethereum"
            chainName="Ethereum"
          />
        </div>
      </div>

      {/* 颜色选择 */}
      <div className="flex flex-wrap justify-center gap-3">
        {allColors.map((color) => {
          const isSelected = value === color.hue
          return (
            <button
              key={color.hue}
              type="button"
              onClick={() => onChange(color.hue)}
              className={cn(
                'relative size-10 rounded-full transition-all',
                'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected && 'ring-2 ring-primary ring-offset-2',
              )}
              style={{ backgroundColor: color.color }}
              title={color.name}
            >
              {isSelected && (
                <IconCheck className="absolute inset-0 m-auto size-5 text-white drop-shadow-md" />
              )}
              {'isAuto' in color && color.isAuto && !isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-md">
                  A
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
