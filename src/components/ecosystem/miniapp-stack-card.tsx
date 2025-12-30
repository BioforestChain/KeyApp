/**
 * MiniappStackCard - 层叠视图中的应用卡片
 *
 * 显示单个后台应用的预览卡片
 * 支持上滑关闭手势
 */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MiniappIcon } from './miniapp-icon'
import type { MiniappInstance } from '@/services/miniapp-runtime'
import styles from './miniapp-stack-card.module.css'

/** 上滑关闭的阈值（像素） */
const SWIPE_UP_THRESHOLD = 100

/** 上滑关闭的速度阈值（像素/毫秒） */
const SWIPE_VELOCITY_THRESHOLD = 0.5

export interface MiniappStackCardProps {
  /** 应用实例 */
  app: MiniappInstance
  /** 是否为当前选中的卡片 */
  isActive?: boolean
  /** 点击卡片回调 */
  onTap?: () => void
  /** 上滑关闭回调 */
  onSwipeUp?: () => void
  /** 自定义类名 */
  className?: string
}

export function MiniappStackCard({
  app,
  isActive = false,
  onTap,
  onSwipeUp,
  className,
}: MiniappStackCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  // 触摸状态
  const touchState = useRef({
    startY: 0,
    startTime: 0,
    currentY: 0,
  })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return

    touchState.current = {
      startY: touch.clientY,
      startTime: Date.now(),
      currentY: touch.clientY,
    }
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    if (!touch) return

    touchState.current.currentY = touch.clientY
    const deltaY = touchState.current.startY - touch.clientY

    // 只允许向上拖动
    if (deltaY > 0) {
      setDragOffset(deltaY)
    }
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    const deltaY = touchState.current.startY - touchState.current.currentY
    const deltaTime = Date.now() - touchState.current.startTime
    const velocity = deltaY / deltaTime

    // 判断是否触发关闭
    const shouldClose = deltaY > SWIPE_UP_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD

    if (shouldClose && deltaY > 0) {
      setIsClosing(true)
      // 播放关闭动画后回调
      setTimeout(() => {
        onSwipeUp?.()
      }, 200)
    } else {
      // 回弹
      setDragOffset(0)
    }

    setIsDragging(false)
  }, [isDragging, onSwipeUp])

  const handleClick = useCallback(() => {
    if (!isDragging && dragOffset === 0) {
      onTap?.()
    }
  }, [isDragging, dragOffset, onTap])

  // 卡片样式
  const cardStyle: React.CSSProperties = {
    transform: isClosing
      ? 'translateY(-100vh) scale(0.8)'
      : dragOffset > 0
        ? `translateY(-${dragOffset}px) scale(${1 - dragOffset * 0.001})`
        : undefined,
    opacity: isClosing ? 0 : dragOffset > 0 ? 1 - dragOffset * 0.003 : 1,
    transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        styles.card,
        isActive && styles.active,
        isDragging && styles.dragging,
        isClosing && styles.closing,
        className
      )}
      style={cardStyle}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="miniapp-stack-card"
      data-app-id={app.appId}
    >
      {/* 卡片头部 - 应用信息 */}
      <div className={styles.header}>
        <MiniappIcon
          src={app.manifest.icon}
          name={app.manifest.name}
          size="sm"
          shadow="sm"
        />
        <div className={styles.headerInfo}>
          <span className={styles.appName}>{app.manifest.name}</span>
          <span className={styles.appDesc}>{app.manifest.description}</span>
        </div>
      </div>

      {/* 卡片内容 - iframe 预览 */}
      <div className={styles.content}>
        {app.iframeRef ? (
          <div className={styles.iframeWrapper}>
            {/* iframe 会由 runtime service 管理，这里只是容器 */}
            <div className={styles.iframePlaceholder}>
              <MiniappIcon
                src={app.manifest.icon}
                name={app.manifest.name}
                size="xl"
              />
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <MiniappIcon
              src={app.manifest.icon}
              name={app.manifest.name}
              size="xl"
            />
          </div>
        )}
      </div>

      {/* 上滑提示 */}
      {isActive && (
        <div className={styles.swipeHint}>
          <div className={styles.swipeIndicator} />
        </div>
      )}
    </div>
  )
}

export default MiniappStackCard
