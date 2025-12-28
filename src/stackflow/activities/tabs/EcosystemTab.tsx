import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { 
  MiniappIcon, 
  MiniappIconWithLabel, 
  MiniappIconGrid,
  SourceIcon,
  type MiniappBadge 
} from '@/components/ecosystem'
import { 
  IconSearch, IconApps, IconChevronRight, IconDownload, IconSparkles,
  IconPlayerPlay, IconInfoCircle, IconTrash, IconShare, IconHeart
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================
// "我的应用" 存储
// ============================================
const MY_APPS_KEY = 'ecosystem_my_apps'

interface MyAppRecord {
  appId: string
  installedAt: number
  lastUsedAt: number
}

function loadMyApps(): MyAppRecord[] {
  try {
    const stored = localStorage.getItem(MY_APPS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveMyApps(apps: MyAppRecord[]): void {
  localStorage.setItem(MY_APPS_KEY, JSON.stringify(apps))
}

function addToMyApps(appId: string): void {
  const apps = loadMyApps()
  if (!apps.some(a => a.appId === appId)) {
    apps.unshift({ appId, installedAt: Date.now(), lastUsedAt: Date.now() })
    saveMyApps(apps)
  }
}

function updateLastUsed(appId: string): void {
  const apps = loadMyApps()
  const app = apps.find(a => a.appId === appId)
  if (app) {
    app.lastUsedAt = Date.now()
    saveMyApps(apps)
  }
}

function removeFromMyApps(appId: string): void {
  const apps = loadMyApps().filter(a => a.appId !== appId)
  saveMyApps(apps)
}

// ============================================
// 工具函数
// ============================================
function getTodayDate() {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
}

function getAppBadge(app: MiniappManifest): MiniappBadge {
  if (app.verified) return 'verified'
  if (app.beta) return 'beta'
  return 'none'
}

// ============================================
// iOS 风格 Context Menu
// ============================================
interface ContextMenuProps {
  app: MiniappManifest
  position: { x: number; y: number }
  onClose: () => void
  onOpen: () => void
  onDetail: () => void
  onRemove: () => void
  onShare: () => void
}

function ContextMenu({ app, position, onClose, onOpen, onDetail, onRemove, onShare }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [onClose])

  const adjustedPosition = useMemo(() => {
    const menuWidth = 220
    const menuHeight = 320
    const padding = 16
    
    let x = position.x - menuWidth / 2
    let y = position.y + 20
    
    if (x < padding) x = padding
    if (x + menuWidth > window.innerWidth - padding) x = window.innerWidth - menuWidth - padding
    if (y + menuHeight > window.innerHeight - padding) y = position.y - menuHeight - 20
    
    return { x, y }
  }, [position])

  const menuItems = [
    { icon: IconPlayerPlay, label: '打开', action: onOpen, color: 'text-primary' },
    { icon: IconInfoCircle, label: '详情', action: onDetail, color: 'text-foreground' },
    { icon: IconShare, label: '分享', action: onShare, color: 'text-foreground' },
    { icon: IconHeart, label: '收藏', action: () => {}, color: 'text-foreground' },
    { icon: IconTrash, label: '移除', action: onRemove, color: 'text-destructive', destructive: true },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={menuRef}
        className={cn(
          "absolute w-56 bg-popover/95 backdrop-blur-xl rounded-2xl shadow-2xl",
          "border border-border/50 overflow-hidden",
          "animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        )}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      >
        {/* App 预览 - 使用统一图标组件 */}
        <div className="p-4 flex items-center gap-3 border-b border-border/50">
          <MiniappIcon 
            src={app.icon} 
            name={app.name} 
            size="md"
            badge={getAppBadge(app)}
            shadow="sm"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{app.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{app.description}</p>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="py-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action()
                onClose()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium",
                "hover:bg-accent/50 active:bg-accent transition-colors",
                item.destructive && "border-t border-border/50 mt-1",
                item.color
              )}
            >
              <item.icon className="size-5" stroke={1.5} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// iOS 桌面风格图标（带长按手势）
// ============================================
interface IOSAppIconProps {
  app: MiniappManifest
  onTap: () => void
  onContextMenu: (position: { x: number; y: number }) => void
  isWiggling?: boolean
}

function IOSAppIcon({ app, onTap, onContextMenu, isWiggling }: IOSAppIconProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    setIsPressed(true)
    
    longPressTimer.current = setTimeout(() => {
      onContextMenu({ x: touch.clientX, y: touch.clientY - 60 })
      setIsPressed(false)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)
    
    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
      onTap()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu({ x: e.clientX, y: e.clientY - 60 })
  }

  return (
    <button
      data-testid={`ios-app-icon-${app.id}`}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-2xl",
        "touch-manipulation select-none",
        "transition-transform duration-150",
        isPressed && "scale-90",
        isWiggling && "animate-wiggle"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      onClick={(e) => {
        if (e.detail === 1 && !('ontouchstart' in window)) {
          onTap()
        }
      }}
    >
      {/* 图标容器 - 带来源标识 */}
      <div className="relative">
        <MiniappIcon
          src={app.icon}
          name={app.name}
          size="lg"
          shadow="md"
        />
        {/* 来源图标 - 右上角 */}
        <div className="absolute -top-1 -right-1">
          <SourceIcon 
            src={app.sourceIcon} 
            name={app.sourceName}
            size="sm"
          />
        </div>
      </div>
      
      {/* 应用名称 */}
      <span className="text-[11px] font-medium text-center leading-tight max-w-[70px] line-clamp-2">
        {app.name}
      </span>
    </button>
  )
}

// ============================================
// 大型精选卡片
// ============================================
function FeaturedStoryCard({ 
  app, 
  onTap,
}: { 
  app: MiniappManifest
  onTap: () => void
}) {
  // 使用应用自己的主题色
  const gradient = app.themeColor || 'from-violet-600 via-purple-600 to-indigo-700'
  
  return (
    <button
      onClick={onTap}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl text-left",
        "shadow-xl shadow-black/10 dark:shadow-black/30",
        "active:scale-[0.98] transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:shadow-black/20"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(0,0,0,0.2),transparent_50%)]" />
      
      <div className="relative p-6 min-h-[300px] flex flex-col @container">
        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-auto">
          <IconSparkles className="size-4" />
          精选应用
        </div>
        
        <div className="mt-auto">
          <div className="flex items-end gap-4 @sm:gap-5">
            {/* 使用统一图标组件 - 玻璃态 */}
            <MiniappIcon
              src={app.icon}
              name={app.name}
              size="xl"
              glass
              className="@sm:!size-24 @sm:!rounded-[24px]"
            />
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-2xl @sm:text-3xl font-bold text-white leading-tight mb-1.5">
                {app.name}
              </h2>
              <p className="text-sm @sm:text-base text-white/75 line-clamp-2 leading-relaxed">
                {app.longDescription?.split('\n')[0] || app.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================
// 横向滚动卡片
// ============================================
function HorizontalAppCard({ 
  app, 
  onTap,
  fallbackColorIndex = 0
}: { 
  app: MiniappManifest
  onTap: () => void
  fallbackColorIndex?: number
}) {
  // 使用应用自己的主题色
  const gradient = getAppGradient(app, fallbackColorIndex)
  
  return (
    <button
      onClick={onTap}
      className={cn(
        "relative w-44 shrink-0 overflow-hidden rounded-2xl text-left",
        "shadow-lg active:scale-[0.96] transition-all duration-200",
        "snap-start scroll-ml-5"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(255,255,255,0.25),transparent_40%)]" />
      
      <div className="relative p-4 h-[160px] flex flex-col">
        {/* 使用统一图标组件 - 玻璃态 */}
        <MiniappIcon
          src={app.icon}
          name={app.name}
          size="lg"
          customSize={56}
          glass
          className="mb-auto"
        />
        <div>
          <h3 className="text-base font-bold text-white truncate">{app.name}</h3>
          <p className="text-xs text-white/70 truncate mt-0.5">{app.description}</p>
        </div>
      </div>
    </button>
  )
}

// ============================================
// 应用列表项
// ============================================
function AppListItem({ 
  app, 
  onTap,
  onOpen,
  rank,
  showRank = false
}: { 
  app: MiniappManifest
  onTap: () => void
  onOpen: () => void
  rank?: number
  showRank?: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      {showRank && rank !== undefined && (
        <span className="w-6 text-center text-lg font-bold text-muted-foreground/50">
          {rank}
        </span>
      )}
      
      <button onClick={onTap} className="shrink-0">
        {/* 使用统一图标组件 */}
        <MiniappIcon
          src={app.icon}
          name={app.name}
          size="lg"
          customSize={64}
          badge={getAppBadge(app)}
          shadow="sm"
        />
      </button>

      <button onClick={onTap} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold truncate">{app.name}</h3>
          {app.beta && (
            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-semibold rounded">
              Beta
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{app.description}</p>
      </button>

      <Button
        size="sm"
        variant="secondary"
        className="shrink-0 rounded-full px-5 h-8 text-xs font-bold"
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
      >
        获取
      </Button>
    </div>
  )
}

// ============================================
// Tab 页内容
// ============================================
type TabType = 'discover' | 'mine'

// 默认渐变色（当应用没有配置 themeColor 时使用）
const DEFAULT_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
]

/** 获取应用的渐变色 */
function getAppGradient(app: MiniappManifest, fallbackIndex: number = 0): string {
  // 优先使用应用配置的 themeColor
  if (app.themeColor) {
    return app.themeColor
  }
  // 否则使用默认渐变色
  return DEFAULT_GRADIENTS[fallbackIndex % DEFAULT_GRADIENTS.length]
}

export function EcosystemTab() {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const [apps, setApps] = useState<MiniappManifest[]>([])
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('discover')
  
  const [contextMenu, setContextMenu] = useState<{
    app: MiniappManifest
    position: { x: number; y: number }
  } | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    initRegistry().then(() => {
      setApps(getApps())
      setMyAppRecords(loadMyApps())
      setLoading(false)
    })
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (contextMenu) return
    startX.current = e.touches[0].clientX
    currentX.current = 0
    isDragging.current = true
  }, [contextMenu])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || contextMenu) return
    currentX.current = e.touches[0].clientX - startX.current
  }, [contextMenu])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || contextMenu) return
    isDragging.current = false
    
    const threshold = 80
    if (currentX.current > threshold && activeTab === 'discover') {
      setActiveTab('mine')
    } else if (currentX.current < -threshold && activeTab === 'mine') {
      setActiveTab('discover')
    }
  }, [activeTab, contextMenu])

  const handleAppDetail = useCallback((app: MiniappManifest) => {
    push('MiniappDetailActivity', { appId: app.id })
  }, [push])

  const handleAppOpen = useCallback((app: MiniappManifest) => {
    addToMyApps(app.id)
    updateLastUsed(app.id)
    setMyAppRecords(loadMyApps())
    push('MiniappActivity', { appId: app.id })
  }, [push])

  const handleRemoveApp = useCallback((appId: string) => {
    removeFromMyApps(appId)
    setMyAppRecords(loadMyApps())
  }, [])

  const handleShareApp = useCallback((app: MiniappManifest) => {
    if (navigator.share) {
      navigator.share({
        title: app.name,
        text: app.description,
        url: window.location.origin + app.url,
      })
    }
  }, [])

  const myApps = useMemo(() => {
    return myAppRecords
      .map(record => ({
        ...record,
        app: apps.find(a => a.id === record.appId)
      }))
      .filter((item): item is MyAppRecord & { app: MiniappManifest } => !!item.app)
  }, [myAppRecords, apps])

  const featuredApp = apps[0]
  const recommendedApps = apps.slice(0, 5)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div 
      className="flex min-h-screen flex-col bg-background overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-background sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground font-medium">{getTodayDate()}</p>
          <button
            onClick={() => {/* TODO: 搜索 */}}
            className="size-10 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="搜索"
          >
            <IconSearch className="size-5" stroke={1.5} />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="relative flex gap-6">
          {(['discover', 'mine'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-2xl font-bold transition-colors duration-300",
                activeTab === tab ? "text-foreground" : "text-muted-foreground/40"
              )}
            >
              {tab === 'discover' ? '发现' : '我的'}
            </button>
          ))}
          
          <div 
            className="absolute -bottom-2 h-1 bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              width: '48px',
              transform: `translateX(${activeTab === 'discover' ? '0' : 'calc(48px + 24px)'})`
            }}
          />
        </div>
      </header>

      {/* Tab 内容容器 */}
      <div ref={containerRef} className="flex-1 relative">
        {/* 发现页 */}
        <div 
          className={cn(
            "absolute inset-0 overflow-y-auto pb-8",
            "transition-all duration-400 ease-out",
            activeTab === 'discover' 
              ? "translate-x-0 opacity-100" 
              : "-translate-x-full opacity-0 pointer-events-none"
          )}
        >
          {apps.length === 0 ? (
            <EmptyState message="暂无应用" />
          ) : (
            <div className="space-y-8 pt-4">
              {featuredApp && (
                <section className="px-5">
                  <FeaturedStoryCard 
                    app={featuredApp} 
                    onTap={() => handleAppOpen(featuredApp)}
                  />
                </section>
              )}

              {recommendedApps.length > 1 && (
                <section>
                  <div className="px-5 mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-bold">推荐</h2>
                    <button className="flex items-center text-primary text-sm font-medium">
                      查看全部
                      <IconChevronRight className="size-4" />
                    </button>
                  </div>
                  <div className={cn(
                    "flex gap-3 overflow-x-auto px-5 pb-3",
                    "snap-x snap-mandatory scroll-smooth",
                    "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  )}>
                    {recommendedApps.slice(1).map((app, i) => (
                      <HorizontalAppCard
                        key={app.id}
                        app={app}
                        onTap={() => handleAppOpen(app)}
                        fallbackColorIndex={i}
                      />
                    ))}
                    {recommendedApps.length < 4 && apps.map((app, i) => (
                      <HorizontalAppCard
                        key={`extra-${app.id}`}
                        app={app}
                        onTap={() => handleAppOpen(app)}
                        fallbackColorIndex={i + 2}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="px-5">
                <h2 className="text-xl font-bold mb-3">热门应用</h2>
                <div className="bg-card rounded-2xl border divide-y">
                  {apps.map((app, i) => (
                    <div key={app.id} className="px-4">
                      <AppListItem
                        app={app}
                        rank={i + 1}
                        showRank
                        onTap={() => handleAppDetail(app)}
                        onOpen={() => handleAppOpen(app)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {apps.length > 1 && (
                <section className="px-5">
                  <FeaturedStoryCard 
                    app={apps[1]} 
                    onTap={() => handleAppOpen(apps[1])}
                  />
                </section>
              )}
            </div>
          )}
        </div>

        {/* 我的页 - iOS 桌面风格 */}
        <div 
          className={cn(
            "absolute inset-0 overflow-y-auto pb-8",
            "transition-all duration-400 ease-out",
            activeTab === 'mine' 
              ? "translate-x-0 opacity-100" 
              : "translate-x-full opacity-0 pointer-events-none"
          )}
        >
          {myApps.length === 0 ? (
            <EmptyState 
              message="还没有使用过的应用" 
              subMessage="去「发现」页面探索吧"
              icon={<IconDownload className="size-10 text-muted-foreground" stroke={1.5} />}
            />
          ) : (
            <div className="pt-6 px-4">
              {/* iOS 桌面网格 - 使用 MiniappIconGrid */}
              <MiniappIconGrid columns={4} iconSize="lg" gap="sm">
                {myApps.map(({ app }) => (
                  <IOSAppIcon
                    key={app.id}
                    app={app}
                    onTap={() => handleAppOpen(app)}
                    onContextMenu={(position) => setContextMenu({ app, position })}
                  />
                ))}
              </MiniappIconGrid>

              <p className="text-center text-xs text-muted-foreground mt-8">
                长按图标查看更多选项
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          app={contextMenu.app}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onOpen={() => handleAppOpen(contextMenu.app)}
          onDetail={() => handleAppDetail(contextMenu.app)}
          onRemove={() => handleRemoveApp(contextMenu.app.id)}
          onShare={() => handleShareApp(contextMenu.app)}
        />
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function EmptyState({ 
  message, 
  subMessage,
  icon 
}: { 
  message: string
  subMessage?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-5">
      <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <IconApps className="size-10 text-muted-foreground" stroke={1.5} />}
      </div>
      <h2 className="text-lg font-semibold mb-1">{message}</h2>
      {subMessage && <p className="text-muted-foreground text-sm">{subMessage}</p>}
    </div>
  )
}
