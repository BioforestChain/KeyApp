import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
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

    // 3D 旋转 - 默认有微弱的呼吸动画偏移
    const baseRotateX = isActive ? pointerY * -12 : 0
    const baseRotateY = isActive ? pointerX * 12 : 0

    // 光泽位置 - 静态时居中偏移，交互时跟随指针
    const shineX = isActive ? 50 + pointerX * 30 : 50
    const shineY = isActive ? 50 + pointerY * 30 : 40

    return (
      <div
        ref={ref}
        className={cn('wallet-card-container', className)}
        style={{ perspective: '1000px' }}
      >
        <div
          ref={cardRef}
          className={cn(
            'wallet-card relative aspect-[1.7/1] w-full overflow-hidden rounded-2xl',
            'transform-gpu touch-none select-none',
            'animate-card-breathe',
            isActive && 'animation-paused'
          )}
          style={{
            transform: `rotateX(${baseRotateX}deg) rotateY(${baseRotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: isActive ? 'none' : 'transform 0.4s ease-out',
          }}
        >
          {/* 1. 主背景渐变 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${themeHue} 70% 45%) 0%, 
                hsl(${themeHue + 20} 80% 35%) 50%,
                hsl(${themeHue + 40} 70% 25%) 100%)`,
            }}
          />

          {/* 2. 防伪水印图案 - 链Logo + 斜纹 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 斜纹底纹 */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 8px,
                  rgba(255,255,255,0.08) 8px,
                  rgba(255,255,255,0.08) 9px
                )`,
              }}
            />
            {/* 细密网格 */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
            {/* 大Logo水印 */}
            <div
              className="absolute -right-8 -bottom-8 size-40 opacity-[0.08]"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 7h-1V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zM8 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1H8V6zm12 12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8z'/%3E%3Cpath d='M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'/%3E%3C/svg%3E") center/contain no-repeat`,
              }}
            />
          </div>

          {/* 4. 默认光泽层 - 始终显示 */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(
                ellipse 80% 50% at ${shineX}% ${shineY}%,
                rgba(255,255,255,0.25) 0%,
                rgba(255,255,255,0.1) 30%,
                transparent 70%
              )`,
              opacity: isActive ? 1 : 0.6,
            }}
          />

          {/* 5. 彩虹全息层 - 始终微弱显示，交互时增强 */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `
                linear-gradient(
                  ${125 + pointerX * 20}deg,
                  transparent 20%,
                  rgba(255,100,100,0.15) 35%,
                  rgba(100,255,100,0.12) 50%,
                  rgba(100,100,255,0.15) 65%,
                  transparent 80%
                )
              `,
              opacity: isActive ? 0.8 : 0.3,
              mixBlendMode: 'overlay',
            }}
          />

          {/* 6. 边缘高光 */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(
                135deg,
                rgba(255,255,255,0.3) 0%,
                transparent 50%,
                rgba(0,0,0,0.2) 100%
              )`,
              opacity: 0.5,
            }}
          />

          {/* 7. 动态聚光灯 - 交互时更明显 */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              background: `radial-gradient(
                circle at ${shineX}% ${shineY}%,
                rgba(255,255,255,0.4) 0%,
                transparent 50%
              )`,
              opacity: isActive ? 0.6 : 0.2,
              mixBlendMode: 'overlay',
            }}
          />

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

          {/* 边框和阴影 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.3),
                inset 0 -1px 1px rgba(0,0,0,0.2),
                0 20px 40px -15px rgba(0,0,0,0.4),
                0 10px 20px -10px rgba(0,0,0,0.3)
              `,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          />
        </div>

        <style>{`
          @keyframes card-breathe {
            0%, 100% {
              transform: rotateX(0deg) rotateY(0deg);
            }
            25% {
              transform: rotateX(1deg) rotateY(-1deg);
            }
            75% {
              transform: rotateX(-1deg) rotateY(1deg);
            }
          }

          .animate-card-breathe {
            animation: card-breathe 6s ease-in-out infinite;
          }

          .animation-paused {
            animation-play-state: paused !important;
          }
        `}</style>
      </div>
    )
  }
)
