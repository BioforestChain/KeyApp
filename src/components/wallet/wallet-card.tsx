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
  /** 卡片主题色 (oklch hue) */
  themeHue?: number | undefined
}

/** 截断地址显示 */
function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * 3D 钱包卡片组件
 * 支持重力感应、触摸交互、炫光防伪效果
 */
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

    // 卡片交互（重力+触摸）
    const { pointerX, pointerY, isActive, bindElement, style } = useCardInteraction({
      gyroStrength: 0.12,
      touchStrength: 0.8,
    })

    // 绑定交互
    useEffect(() => {
      bindElement(cardRef.current)
    }, [bindElement])

    const handleCopy = useCallback(() => {
      onCopyAddress?.()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, [onCopyAddress])

    // 3D旋转角度
    const rotateX = pointerY * -15
    const rotateY = pointerX * 15

    return (
      <div
        ref={ref}
        className={cn('wallet-card-container perspective-[1000px]', className)}
      >
        <div
          ref={cardRef}
          className={cn(
            'wallet-card relative aspect-[1.6/1] w-full rounded-2xl',
            'transform-gpu transition-transform duration-200',
            'touch-none select-none',
            isActive && 'transition-none'
          )}
          style={{
            ...style,
            '--theme-hue': themeHue,
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
          } as React.CSSProperties}
          data-active={isActive}
        >
          {/* 卡片底层 - 渐变背景 */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, 
                oklch(0.45 0.2 var(--theme-hue)) 0%, 
                oklch(0.35 0.25 calc(var(--theme-hue) + 30)) 50%,
                oklch(0.25 0.2 calc(var(--theme-hue) + 60)) 100%)`,
            }}
          />

          {/* 防伪图案层 - 链Logo平铺 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.15]"
            style={{
              maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E")`,
              maskSize: '40px 40px',
              maskRepeat: 'repeat',
              WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E")`,
              WebkitMaskSize: '40px 40px',
              WebkitMaskRepeat: 'repeat',
              background: 'white',
            }}
          />

          {/* 炫光层 - 彩虹折射效果 */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 rounded-2xl',
              'opacity-0 transition-opacity duration-200',
              isActive && 'opacity-100'
            )}
            style={{ mixBlendMode: 'multiply' }}
          >
            {/* 左下角炫光 */}
            <div
              className="absolute aspect-square w-[500%] origin-[0_100%] saturate-[2]"
              style={{
                bottom: 0,
                left: 0,
                background: `radial-gradient(circle at 0 100%, 
                  transparent 10%, 
                  hsl(5 100% 80%), 
                  hsl(150 100% 60%), 
                  hsl(220 90% 70%), 
                  transparent 60%)`,
                scale: `${Math.min(1, 0.15 + pointerX * 0.25)}`,
                translate: `${Math.max(-10, Math.min(10, pointerX * 10))}% ${Math.max(0, pointerY * -10)}%`,
              }}
            />
            {/* 右上角炫光 */}
            <div
              className="absolute aspect-square w-[500%] origin-[100%_0] saturate-[2]"
              style={{
                top: 0,
                right: 0,
                background: `radial-gradient(circle at 100% 0, 
                  transparent 10%, 
                  hsl(5 100% 80%), 
                  hsl(150 100% 60%), 
                  hsl(220 90% 70%), 
                  transparent 60%)`,
                scale: `${Math.min(1, 0.15 + pointerX * -0.65)}`,
                translate: `${Math.max(-10, Math.min(10, -pointerX * 10))}% ${Math.min(0, pointerY * -10)}%`,
              }}
            />
          </div>

          {/* 聚光灯层 */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 rounded-2xl',
              'opacity-0 transition-opacity duration-200',
              isActive && 'opacity-100'
            )}
            style={{ mixBlendMode: 'overlay' }}
          >
            <div
              className="absolute aspect-square w-[500%]"
              style={{
                left: '50%',
                top: '50%',
                background: `radial-gradient(
                  hsl(0 0% 100% / 0.35) 0 2%, 
                  hsl(0 0% 10% / 0.15) 20%
                )`,
                translate: `calc(-50% + ${pointerX * 20}%) calc(-50% + ${pointerY * 20}%)`,
              }}
            />
          </div>

          {/* 卡片内容 */}
          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            {/* 顶部：链选择器 + 设置 */}
            <div className="flex items-center justify-between">
              <button
                onClick={onOpenChainSelector}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <ChainIcon chainId={chain} size="sm" />
                <span>{chainName}</span>
                <ChevronDown className="size-3" />
              </button>

              <button
                onClick={onOpenSettings}
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Settings className="size-4" />
              </button>
            </div>

            {/* 中部：钱包名称 */}
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-xl font-bold text-white drop-shadow-lg">
                {wallet.name}
              </h2>
            </div>

            {/* 底部：地址 */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/70">
                {address ? truncateAddress(address) : '---'}
              </span>
              <button
                onClick={handleCopy}
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                {copied ? (
                  <Check className="size-4 text-green-300" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* 边框发光效果 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `
                inset 0 0 0 1px rgba(255,255,255,0.2),
                0 25px 50px -12px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,255,255,0.1)
              `,
            }}
          />
        </div>
      </div>
    )
  }
)
