import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useCardInteraction } from '@/hooks/useCardInteraction'
import { useMonochromeMask } from '@/hooks/useMonochromeMask'
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
  /** 防伪水印 logo 平铺尺寸（含间距），默认 40px */
  watermarkLogoSize?: number | undefined
  /** 防伪水印 logo 实际尺寸，默认 24px（与 watermarkLogoSize 差值为间距） */
  watermarkLogoActualSize?: number | undefined
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
      watermarkLogoSize = 40,
      watermarkLogoActualSize = 24,
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

    // 将链图标转为单色遮罩（黑白 -> 透明）
    const monoMaskUrl = useMonochromeMask(chainIconUrl, {
      size: watermarkLogoActualSize * 2, // 2x for retina
      invert: false, // 白色区域不透明
      contrast: 1.8,
    })

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

    // 全息渐变位移 - 跟随指针反向移动产生视差
    const holoTranslateX = pointerX * -40 // px
    const holoTranslateY = pointerY * -40
    // 动态透明度 - 倾斜越大越亮，默认几乎不可见
    const holoOpacity = 0.1 + Math.max(Math.abs(pointerX), Math.abs(pointerY)) * 0.9

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
            isolation: 'isolate', // 确保混合模式独立于其他卡片
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

          {/* 2. 防伪层1：三角底纹 + 全息渐变 */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              // 三角形 mask
              WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 20 L0 20 Z' fill='black'/%3E%3C/svg%3E")`,
              WebkitMaskSize: '10px 10px',
              WebkitMaskRepeat: 'repeat',
              maskImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L20 20 L0 20 Z' fill='black'/%3E%3C/svg%3E")`,
              maskSize: '10px 10px',
              maskRepeat: 'repeat',
              // 核心：color-dodge 让深色背景下透明，有亮光时显色
              mixBlendMode: 'color-dodge',
              opacity: 0.6,
              filter: 'brightness(1.2) contrast(1.5)',
            }}
          >
            {/* 全息线性渐变 - 200% 大小，通过 translate 移动 */}
            <div
              className="absolute"
              style={{
                inset: '-50%',
                width: '200%',
                height: '200%',
                background: `linear-gradient(
                  115deg,
                  transparent 20%,
                  rgba(255, 0, 0, 0.7) 30%,
                  rgba(255, 255, 0, 0.7) 40%,
                  rgba(0, 255, 255, 0.7) 50%,
                  rgba(0, 0, 255, 0.7) 60%,
                  rgba(255, 0, 255, 0.7) 70%,
                  transparent 80%
                )`,
                transform: `translate(${holoTranslateX}px, ${holoTranslateY}px)`,
                // 默认几乎不可见，倾斜越大越亮
                opacity: holoOpacity,
                transition: 'opacity 0.2s',
              }}
            />
          </div>

          {/* 3. 防伪层2：Logo水印 + 全息渐变 */}
          {monoMaskUrl && (
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl"
              style={{
                WebkitMaskImage: `url(${monoMaskUrl})`,
                WebkitMaskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
                WebkitMaskRepeat: 'repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${monoMaskUrl})`,
                maskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
                maskRepeat: 'repeat',
                maskPosition: 'center',
                // overlay 混合模式，和三角层错开
                mixBlendMode: 'overlay',
                opacity: 0.6,
              }}
            >
              {/* 全息渐变 - 色相偏移 90deg */}
              <div
                className="absolute"
                style={{
                  inset: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `linear-gradient(
                    115deg,
                    transparent 20%,
                    rgba(0, 255, 0, 0.7) 30%,
                    rgba(0, 255, 255, 0.7) 40%,
                    rgba(255, 0, 255, 0.7) 50%,
                    rgba(255, 255, 0, 0.7) 60%,
                    rgba(0, 255, 255, 0.7) 70%,
                    transparent 80%
                  )`,
                  transform: `translate(${holoTranslateX}px, ${holoTranslateY}px)`,
                  opacity: holoOpacity,
                  transition: 'opacity 0.2s',
                }}
              />
            </div>
          )}

          {/* 4. 表面高光 (Glare) - 玻璃质感 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(
                circle at calc(50% + ${pointerX * 200}%) calc(50% + ${pointerY * 200}%),
                rgba(255,255,255,0.8) 0%,
                rgba(255,255,255,0) 30%
              )`,
              mixBlendMode: 'soft-light',
            }}
          />

          {/* 5. 边框装饰 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
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
