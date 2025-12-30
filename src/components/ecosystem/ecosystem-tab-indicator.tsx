/**
 * EcosystemTabIndicator - 生态 Tab 页面指示器
 *
 * 显示当前页面的图标指示器，支持双向绑定：
 * - 滑动页面时更新图标
 * - 点击图标时切换页面
 */

import { useCallback, useMemo } from 'react'
import { IconApps, IconBrandMiniprogram, IconStack2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { EcosystemSubPage } from '@/stores/ecosystem'
import styles from './ecosystem-tab-indicator.module.css'

export interface EcosystemTabIndicatorProps {
  /** 当前页面 */
  activePage: EcosystemSubPage
  /** 切换页面回调 */
  onPageChange?: (page: EcosystemSubPage) => void
  /** 是否有运行中的应用（影响 stack 页是否可用） */
  hasRunningApps?: boolean
  /** 自定义类名 */
  className?: string
}

/** 页面顺序 */
const PAGE_ORDER: EcosystemSubPage[] = ['discover', 'mine', 'stack']

/** 页面图标配置 */
const PAGE_ICONS = {
  discover: IconApps,
  mine: IconBrandMiniprogram,
  stack: IconStack2,
} as const

/** 页面标签 */
const PAGE_LABELS = {
  discover: '发现',
  mine: '我的',
  stack: '堆栈',
} as const

export function EcosystemTabIndicator({
  activePage,
  onPageChange,
  hasRunningApps = false,
  className,
}: EcosystemTabIndicatorProps) {
  // 计算可用页面
  const availablePages = useMemo(() => {
    if (hasRunningApps) {
      return PAGE_ORDER
    }
    // 没有运行中的应用时，stack 页不可用
    return PAGE_ORDER.filter((p) => p !== 'stack')
  }, [hasRunningApps])

  // 当前页面索引
  const activeIndex = availablePages.indexOf(activePage)

  // 获取下一页
  const getNextPage = useCallback(() => {
    const nextIndex = (activeIndex + 1) % availablePages.length
    return availablePages[nextIndex]
  }, [activeIndex, availablePages])

  // 处理点击
  const handleClick = useCallback(() => {
    const nextPage = getNextPage()
    if (nextPage) {
      onPageChange?.(nextPage)
    }
  }, [getNextPage, onPageChange])

  // 当前图标
  const Icon = PAGE_ICONS[activePage]
  const label = PAGE_LABELS[activePage]

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(styles.indicator, className)}
      aria-label={`当前：${label}，点击切换`}
      data-testid="ecosystem-tab-indicator"
    >
      {/* 图标容器 - 带 crossfade 动画 */}
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} stroke={1.5} />
      </div>

      {/* 页面点指示器 */}
      <div className={styles.dots}>
        {availablePages.map((page, index) => (
          <span
            key={page}
            className={cn(
              styles.dot,
              index === activeIndex && styles.dotActive
            )}
          />
        ))}
      </div>
    </button>
  )
}

export default EcosystemTabIndicator
