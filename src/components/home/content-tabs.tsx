import { useState, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconCoins as Coins, IconHistory as History } from '@tabler/icons-react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface ContentTabsProps {
  tabs?: Tab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children: (activeTab: string) => ReactNode
  className?: string
}

const DEFAULT_TABS: Tab[] = [
  { id: 'assets', label: '资产', icon: <Coins className="size-4" /> },
  { id: 'history', label: '交易', icon: <History className="size-4" /> },
]

/**
 * 内容区Tab切换组件
 */
export function ContentTabs({
  tabs = DEFAULT_TABS,
  defaultTab = 'assets',
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className,
}: ContentTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)
  
  // 支持受控和非受控模式
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
      {/* Tab 栏 */}
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

      {/* 内容区 */}
      <div className="flex-1 overflow-auto">
        {children(activeTab)}
      </div>
    </div>
  )
}

/**
 * 滑动版本的ContentTabs（支持左右滑动切换）
 */
export function SwipeableContentTabs({
  tabs = DEFAULT_TABS,
  defaultTab = 'assets',
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className,
}: ContentTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabClick = useCallback(
    (tabId: string) => {
      setInternalActiveTab(tabId)
      onTabChange?.(tabId)
    },
    [onTabChange]
  )

  const activeIndex = tabs.findIndex((t) => t.id === activeTab)

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      {/* Tab 栏 */}
      <div className="bg-background border-b px-4 py-2">
        <div className="bg-muted relative flex rounded-lg p-1">
          {/* 滑动指示器 */}
          <div
            className="bg-background absolute top-1 bottom-1 rounded-md shadow-sm transition-transform duration-200"
            style={{
              width: `calc(${100 / tabs.length}% - 4px)`,
              transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))`,
            }}
          />
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 滑动内容区 */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-200"
          style={{
            width: `${tabs.length * 100}%`,
            transform: `translateX(-${activeIndex * (100 / tabs.length)}%)`,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="h-full overflow-auto"
              style={{ width: `${100 / tabs.length}%` }}
            >
              {children(tab.id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
