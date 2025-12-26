import { useCallback, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { WalletCard } from './wallet-card'
import { useWalletTheme } from '@/hooks/useWalletTheme'
import { cn } from '@/lib/utils'
import type { Wallet, ChainType } from '@/stores'
import { IconWallet } from '@tabler/icons-react'

import 'swiper/css'
import 'swiper/css/effect-cards'

interface WalletCardCarouselProps {
  wallets: Wallet[]
  currentWalletId: string | null
  selectedChain: ChainType
  chainNames: Record<string, string>
  /** 链图标 URL 映射，用于防伪水印 */
  chainIconUrls?: Record<string, string>
  /** 防伪水印 logo 尺寸，默认 32px */
  watermarkLogoSize?: number
  onWalletChange?: (walletId: string) => void
  onCopyAddress?: (address: string) => void
  onOpenChainSelector?: () => void
  onOpenSettings?: (walletId: string) => void
  onOpenWalletList?: () => void
  className?: string
}

/**
 * 钱包卡片轮播组件
 * 使用 Swiper 实现卡片切换效果
 */
export function WalletCardCarousel({
  wallets,
  currentWalletId,
  selectedChain,
  chainNames,
  chainIconUrls,
  watermarkLogoSize = 32,
  onWalletChange,
  onCopyAddress,
  onOpenChainSelector,
  onOpenSettings,
  onOpenWalletList,
  className,
}: WalletCardCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const { getWalletTheme } = useWalletTheme()

  // 找到当前钱包的索引
  const currentIndex = wallets.findIndex((w) => w.id === currentWalletId)

  // 初始化时滑动到当前钱包
  useEffect(() => {
    if (swiperRef.current && currentIndex >= 0) {
      swiperRef.current.slideTo(currentIndex, 0)
    }
  }, [currentIndex])

  // 滑动切换钱包
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const wallet = wallets[swiper.activeIndex]
      if (wallet && wallet.id !== currentWalletId) {
        onWalletChange?.(wallet.id)
      }
    },
    [wallets, currentWalletId, onWalletChange]
  )

  // 获取钱包在当前链上的地址
  const getWalletAddress = (wallet: Wallet) => {
    const chainAddr = wallet.chainAddresses.find((ca) => ca.chain === selectedChain)
    return chainAddr?.address ?? wallet.address
  }

  if (wallets.length === 0) {
    return null
  }

  return (
    <div className={cn('wallet-carousel relative', className)}>
      {/* 左上角：多钱包管理入口 */}
      {wallets.length > 1 && (
        <button
          onClick={onOpenWalletList}
          className="absolute left-4 top-0 z-10 flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:bg-muted"
        >
          <IconWallet className="size-3.5" />
          <span>{wallets.length} 个钱包</span>
        </button>
      )}

      <Swiper
        modules={[EffectCards]}
        effect="cards"
        grabCursor
        cardsEffect={{
          perSlideOffset: 8,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: false,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={handleSlideChange}
        initialSlide={currentIndex >= 0 ? currentIndex : 0}
        className="wallet-swiper"
      >
        {wallets.map((wallet) => (
          <SwiperSlide key={wallet.id}>
            <WalletCard
              wallet={wallet}
              chain={selectedChain}
              chainName={chainNames[selectedChain] ?? selectedChain}
              address={getWalletAddress(wallet)}
              chainIconUrl={chainIconUrls?.[selectedChain]}
              watermarkLogoSize={watermarkLogoSize}
              themeHue={getWalletTheme(wallet.id)}
              onCopyAddress={() => {
                const addr = getWalletAddress(wallet)
                if (addr) onCopyAddress?.(addr)
              }}
              onOpenChainSelector={onOpenChainSelector ?? undefined}
              onOpenSettings={onOpenSettings ? () => onOpenSettings(wallet.id) : undefined}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .wallet-carousel {
          width: 100%;
          padding-top: 2rem;
          padding-bottom: 0.5rem;
        }

        .wallet-swiper {
          width: min(92vw, 360px);
          height: 212px;
          margin: 0 auto;
          overflow: visible;
        }

        .wallet-swiper .swiper-slide {
          width: 100% !important;
          height: 100% !important;
          border-radius: 1rem;
        }
      `}</style>
    </div>
  )
}
