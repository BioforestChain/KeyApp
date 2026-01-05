import { useState, useCallback, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconCoins as Coins, IconHistory as History } from '@tabler/icons-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs?: Tab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children: (activeTab: string) => ReactNode
  className?: string
  testIdPrefix?: string
}

const DEFAULT_TABS: Tab[] = [
  { id: 'assets', label: '资产', icon: <Coins className="size-4" /> },
  { id: 'history', label: '交易', icon: <History className="size-4" /> },
]

/**
 * Tab 切换组件
 */
export function Tabs({
  tabs = DEFAULT_TABS,
  defaultTab = 'assets',
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)
  
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabClick = useCallback(
    (tabId: string) => {
      setInternalActiveTab(tabId)
      onTabChange?.(tabId)
    },
    [onTabChange]
  )

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="bg-background sticky top-0 z-10 border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                'border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {children(activeTab)}
      </div>
    </div>
  )
}

/**
 * 滑动版 Tab 切换组件（使用 Swiper 实现手势滑动）
 * 指示器位置通过 CSS 变量实时更新，实现丝滑跟手效果
 */
export function SwipeableTabs({
  tabs = DEFAULT_TABS,
  defaultTab = 'assets',
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className,
  testIdPrefix,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)
  const swiperRef = useRef<SwiperType | null>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const activeTab = controlledActiveTab ?? internalActiveTab
  const activeIndex = tabs.findIndex((t) => t.id === activeTab)

  const handleTabClick = useCallback(
    (tabId: string) => {
      const index = tabs.findIndex((t) => t.id === tabId)
      if (index !== -1) {
        swiperRef.current?.slideTo(index)
      }
    },
    [tabs]
  )

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const tab = tabs[swiper.activeIndex]
      if (tab) {
        setInternalActiveTab(tab.id)
        onTabChange?.(tab.id)
      }
    },
    [tabs, onTabChange]
  )

  // 实时更新指示器位置（通过 CSS 变量）
  const handleProgress = useCallback(
    (swiper: SwiperType, progress: number) => {
      if (!indicatorRef.current) return
      // progress: 0 = 第一个 tab, 1 = 最后一个 tab
      // 转换为 tab 索引（支持小数，用于平滑过渡）
      const tabIndex = progress * (tabs.length - 1)
      indicatorRef.current.style.setProperty('--tab-index', String(tabIndex))
    },
    [tabs.length]
  )

  return (
    <div {...(testIdPrefix && { 'data-testid': testIdPrefix })} className={cn('flex flex-col overflow-hidden', className)}>
      <div className="bg-background px-4 pb-2">
        <div className="relative flex rounded-xl bg-muted/60 p-1">
          {/* 指示器 - 使用 CSS 变量实现实时位置更新 */}
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 rounded-lg bg-primary/10 shadow-sm"
            style={{
              '--tab-index': activeIndex,
              '--tab-count': tabs.length,
              width: `calc(${100 / tabs.length}% - 4px)`,
              transform: `translateX(calc(var(--tab-index) * (100% + 4px)))`,
            } as React.CSSProperties}
          />
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              {...(testIdPrefix && { 'data-testid': `${testIdPrefix}-tab-${tab.id}` })}
              data-active={activeTab === tab.id ? 'true' : 'false'}
              className={cn(
                'relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Swiper
        className="flex-1 w-full"
        initialSlide={activeIndex}
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        onSlideChange={handleSlideChange}
        onProgress={handleProgress}
        resistanceRatio={0.5}
      >
        {tabs.map((tab) => (
          <SwiperSlide
            key={tab.id}
            className="h-full overflow-auto"
            {...(testIdPrefix && { 'data-testid': `${testIdPrefix}-panel-${tab.id}` })}
          >
            {children(tab.id)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

// 兼容旧名称（deprecated）
/** @deprecated Use `Tabs` instead */
export const ContentTabs = Tabs
/** @deprecated Use `SwipeableTabs` instead */
export const SwipeableContentTabs = SwipeableTabs
