/**
 * MiniappStackView - 层叠视图容器
 *
 * 显示所有运行中的应用卡片
 * 使用 Swiper 实现左右滑动切换
 * 支持上滑关闭应用
 */

import { useCallback, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-cards'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  activateApp,
  closeApp,
  closeStackView,
} from '@/services/miniapp-runtime'
import type { MiniappInstance } from '@/services/miniapp-runtime'
import { MiniappStackCard } from './miniapp-stack-card'
import styles from './miniapp-stack-view.module.css'

export interface MiniappStackViewProps {
  /** 是否可见 */
  visible?: boolean
  /** 关闭回调（退出层叠视图） */
  onClose?: () => void
  /** 自定义类名 */
  className?: string
}

export function MiniappStackView({
  visible = false,
  onClose,
  className,
}: MiniappStackViewProps) {
  const { t } = useTranslation('ecosystem')
  const swiperRef = useRef<SwiperType | null>(null)

  // 获取所有运行中的应用
  const apps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getApps) as MiniappInstance[]
  const activeAppId = useStore(miniappRuntimeStore, (s) => s.activeAppId)

  // 当应用列表变化时，如果没有应用了就关闭视图
  useEffect(() => {
    if (visible && apps.length === 0) {
      onClose?.()
      closeStackView()
    }
  }, [visible, apps.length, onClose])

  // 处理卡片点击 - 激活应用并退出层叠视图
  const handleCardTap = useCallback((appId: string) => {
    activateApp(appId)
    closeStackView()
    onClose?.()
  }, [onClose])

  // 处理上滑关闭
  const handleSwipeUp = useCallback((appId: string) => {
    closeApp(appId)

    // 如果关闭后还有其他应用，停留在层叠视图
    // 如果没有应用了，useEffect 会自动关闭视图
  }, [])

  // 处理滑动切换
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const currentApp = apps[swiper.activeIndex]
    if (currentApp) {
      // 只更新选中状态，不激活应用
      // activateApp 会在点击卡片时调用
    }
  }, [apps])

  if (!visible || apps.length === 0) {
    return null
  }

  // 找到当前激活应用的索引
  const initialIndex = apps.findIndex((app) => app.appId === activeAppId)

  return (
    <div
      className={cn(styles.container, className)}
      data-testid="miniapp-stack-view"
    >
      {/* 背景遮罩 */}
      <div
        className={styles.backdrop}
        onClick={() => {
          closeStackView()
          onClose?.()
        }}
      />

      {/* 标题 */}
      <div className={styles.title}>
        <span>{t('stack.runningApps')}</span>
        <span className={styles.count}>{apps.length}</span>
      </div>

      {/* 卡片滑动区域 */}
      <div className={styles.swiperWrapper}>
        <Swiper
          modules={[EffectCards]}
          effect="cards"
          grabCursor={true}
          initialSlide={initialIndex >= 0 ? initialIndex : 0}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          onSlideChange={handleSlideChange}
          cardsEffect={{
            slideShadows: false,
            perSlideOffset: 8,
            perSlideRotate: 2,
          }}
          className={styles.swiper}
        >
          {apps.map((app, index) => (
            <SwiperSlide key={app.appId} className={styles.slide}>
              <MiniappStackCard
                app={app}
                isActive={index === (swiperRef.current?.activeIndex ?? initialIndex)}
                onTap={() => handleCardTap(app.appId)}
                onSwipeUp={() => handleSwipeUp(app.appId)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 操作提示 */}
      <div className={styles.hints}>
        <span>{t('stack.hints')}</span>
      </div>
    </div>
  )
}

export default MiniappStackView
