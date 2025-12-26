import { forwardRef, useCallback, useEffect, useRef, useState, useContext, createContext } from 'react'
import { cn } from '@/lib/utils'
import { useCardInteraction } from '@/hooks/useCardInteraction'
import { ChainIcon } from './chain-icon'
import type { Wallet, ChainType } from '@/stores'
import {
  IconCopy as Copy,
  IconCheck as Check,
  IconSettings as Settings,
  IconChevronDown as ChevronDown,
} from '@tabler/icons-react'

export interface WalletCardProps {
  wallet: Wallet
  chain: ChainType
  chainName: string
  address?: string | undefined
  /** 链图标 URL，用于防伪水印 */
  chainIconUrl?: string | undefined
  /** 防伪水印 logo 平铺尺寸，默认 32px */
  watermarkLogoSize?: number | undefined
  onCopyAddress?: (() => void) | undefined
  onOpenChainSelector?: (() => void) | undefined
  onOpenSettings?: (() => void) | undefined
  className?: string | undefined
  themeHue?: number | undefined
}

function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export const WalletCard = forwardRef<HTMLDivElement, WalletCardProps>(
  function WalletCard(
    {
      wallet,
      chain,
      chainName,
      address,
      chainIconUrl,
      watermarkLogoSize = 32,
      onCopyAddress,
      onOpenChainSelector,
      onOpenSettings,
      className,
      themeHue = 323,
    },
    ref
  ) {
    const [copied, setCopied] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const { pointerX, pointerY, isActive, bindElement } = useCardInteraction({
      gyroStrength: 0.15,
      touchStrength: 0.8,
    })

    useEffect(() => {
      bindElement(cardRef.current)
    }, [bindElement])

    const handleCopy = useCallback(() => {
      onCopyAddress?.()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, [onCopyAddress])

    // 3D 旋转
    const rotateX = isActive ? pointerY * -12 : 0
    const rotateY = isActive ? pointerX * 12 : 0

    // 聚光灯位置
    const spotlightX = 50 + pointerX * 20
    const spotlightY = 50 + pointerY * 20

    // 折射层缩放和位移 - 跟随指针
    const refractionScale1 = Math.min(1, 0.15 + pointerX * 0.25)
    const refractionScale2 = Math.min(1, 0.15 + pointerX * -0.65)
    const refractionTranslateX1 = Math.max(-10, Math.min(10, pointerX * 10))
    const refractionTranslateY1 = Math.max(0, pointerY * -10)
    const refractionTranslateX2 = Math.max(-10, Math.min(10, -pointerX * 10))
    const refractionTranslateY2 = Math.min(0, pointerY * -10)

    return (
      <div
        ref={ref}
        className={cn('wallet-card-container h-full w-full', className)}
        style={{ perspective: '1000px' }}
      >
        <div
          ref={cardRef}
          className="wallet-card relative h-full w-full transform-gpu touch-none select-none overflow-hidden rounded-2xl"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: isActive ? 'none' : 'transform 0.4s ease-out',
          }}
        >
          {/* 1. 主背景渐变 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${themeHue} 70% 40%) 0%, 
                hsl(${themeHue + 20} 80% 30%) 50%,
                hsl(${themeHue + 40} 70% 20%) 100%)`,
            }}
          />

          {/* 2. 防伪水印层 - 链Logo平铺 + 彩虹折射 */}
          {chainIconUrl && (
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl"
              style={{
                // 用链 logo 作为 mask，平铺显示
                WebkitMaskImage: `url(${chainIconUrl})`,
                WebkitMaskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
                WebkitMaskRepeat: 'repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${chainIconUrl})`,
                maskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
                maskRepeat: 'repeat',
                maskPosition: 'center',
                mixBlendMode: 'hard-light',
                opacity: isActive ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              {/* 彩虹折射层 1 - 左下角 */}
              <div
                className="absolute aspect-square w-[500%]"
                style={{
                  bottom: 0,
                  left: 0,
                  transformOrigin: '0 100%',
                  background: `radial-gradient(
                    circle at 0 100%,
                    transparent 10%,
                    hsl(5 100% 80%),
                    hsl(150 100% 60%),
                    hsl(220 90% 70%),
                    transparent 60%
                  )`,
                  filter: 'saturate(2)',
                  scale: refractionScale1,
                  translate: `${refractionTranslateX1}% ${refractionTranslateY1}%`,
                  opacity: isActive ? 1 : 0.3,
                  transition: isActive ? 'none' : 'all 0.3s',
                }}
              />
              {/* 彩虹折射层 2 - 右上角 */}
              <div
                className="absolute aspect-square w-[500%]"
                style={{
                  top: 0,
                  right: 0,
                  transformOrigin: '100% 0',
                  background: `radial-gradient(
                    circle at 100% 0,
                    transparent 10%,
                    hsl(5 100% 80%),
                    hsl(150 100% 60%),
                    hsl(220 90% 70%),
                    transparent 60%
                  )`,
                  filter: 'saturate(2)',
                  scale: refractionScale2,
                  translate: `${refractionTranslateX2}% ${refractionTranslateY2}%`,
                  opacity: isActive ? 1 : 0.3,
                  transition: isActive ? 'none' : 'all 0.3s',
                }}
              />
            </div>
          )}

          {/* 3. 边框装饰纹理 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg, 
                rgba(255,255,255,0.15) 0%, 
                transparent 50%, 
                rgba(0,0,0,0.15) 100%)`,
            }}
          />

          {/* 4. 聚光灯层 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              mixBlendMode: 'overlay',
              opacity: isActive ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          >
            <div
              className="absolute aspect-square w-[500%]"
              style={{
                left: '50%',
                top: '50%',
                background: `radial-gradient(
                  hsl(0 0% 100% / 0.4) 0 2%,
                  hsl(0 0% 10% / 0.2) 20%
                )`,
                translate: `calc(-50% + ${spotlightX - 50}%) calc(-50% + ${spotlightY - 50}%)`,
              }}
            />
          </div>

          {/* 卡片内容 */}
          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            {/* 顶部：链选择器 + 设置 */}
            <div className="flex items-center justify-between">
              <button
                onClick={onOpenChainSelector}
                className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/30"
              >
                <ChainIcon chainId={chain} size="sm" />
                <span className="font-medium">{chainName}</span>
                <ChevronDown className="size-3 opacity-70" />
              </button>

              <button
                onClick={onOpenSettings}
                className="rounded-full bg-black/10 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/20 hover:text-white"
              >
                <Settings className="size-4" />
              </button>
            </div>

            {/* 中部：钱包名称 */}
            <div className="flex flex-1 items-center justify-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {wallet.name}
              </h2>
            </div>

            {/* 底部：地址 */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white/80 drop-shadow">
                {address ? truncateAddress(address) : '---'}
              </span>
              <button
                onClick={handleCopy}
                className="rounded-full bg-black/10 p-1.5 text-white/80 backdrop-blur-sm transition-all hover:bg-black/20 hover:text-white"
              >
                {copied ? (
                  <Check className="size-4 text-green-300" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* 外层阴影 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.3),
                inset 0 -1px 1px rgba(0,0,0,0.2),
                0 20px 40px -15px rgba(0,0,0,0.4)
              `,
            }}
          />
        </div>
      </div>
    )
  }
)
