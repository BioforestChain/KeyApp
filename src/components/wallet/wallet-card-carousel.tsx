import { useCallback, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { WalletCard } from './wallet-card'
import { useWalletTheme } from '@/hooks/useWalletTheme'
import { cn } from '@/lib/utils'
import type { Wallet, ChainType } from '@/stores'

import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/pagination'

interface WalletCardCarouselProps {
  wallets: Wallet[]
  currentWalletId: string | null
  selectedChain: ChainType
  chainNames: Record<string, string>
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
    <div className={cn('wallet-carousel', className)}>
      <Swiper
        modules={[EffectCards, Pagination]}
        effect="cards"
        grabCursor
        cardsEffect={{
          perSlideOffset: 8,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={handleSlideChange}
        initialSlide={currentIndex >= 0 ? currentIndex : 0}
        className="wallet-swiper"
      >
        {wallets.map((wallet) => (
          <SwiperSlide key={wallet.id} className="wallet-slide">
            <WalletCard
              wallet={wallet}
              chain={selectedChain}
              chainName={chainNames[selectedChain] ?? selectedChain}
              address={getWalletAddress(wallet)}
              themeHue={getWalletTheme(wallet.id)}
              onCopyAddress={() => {
                const addr = getWalletAddress(wallet)
                if (addr) onCopyAddress?.(addr)
              }}
              onOpenChainSelector={onOpenChainSelector}
              onOpenSettings={() => onOpenSettings?.(wallet.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 钱包列表展开按钮 */}
      {wallets.length > 1 && (
        <button
          onClick={onOpenWalletList}
          className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
        >
          <span>{wallets.length} 个钱包</span>
          <span className="text-[10px]">点击管理</span>
        </button>
      )}

      <style>{`
        .wallet-carousel {
          width: 100%;
          padding: 1rem 0;
        }

        .wallet-swiper {
          width: 280px;
          height: 180px;
          margin: 0 auto;
          overflow: visible;
        }

        .wallet-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
        }

        .wallet-swiper .swiper-pagination {
          bottom: -24px;
        }

        .wallet-swiper .swiper-pagination-bullet {
          background: var(--muted-foreground);
          opacity: 0.3;
        }

        .wallet-swiper .swiper-pagination-bullet-active {
          background: var(--primary);
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
