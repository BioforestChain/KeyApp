import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { IconSearch, IconApps, IconChevronRight, IconDownload, IconClock, IconSparkles } from '@tabler/icons-react'
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

// ============================================
// 工具函数
// ============================================
function getTodayDate() {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
}

// ============================================
// 大型精选卡片
// ============================================
function FeaturedStoryCard({ 
  app, 
  onTap,
  variant = 'primary'
}: { 
  app: MiniappManifest
  onTap: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
}) {
  const gradients = {
    primary: 'from-violet-600 via-purple-600 to-indigo-700',
    secondary: 'from-orange-500 via-amber-500 to-yellow-500',
    tertiary: 'from-emerald-500 via-teal-500 to-cyan-500',
  }
  
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
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradients[variant])} />
      
      {/* 动态光效 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(0,0,0,0.2),transparent_50%)]" />
      
      <div className="relative p-6 min-h-[300px] flex flex-col @container">
        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-auto">
          <IconSparkles className="size-4" />
          精选应用
        </div>
        
        <div className="mt-auto">
          <div className="flex items-end gap-4 @sm:gap-5">
            <div className={cn(
              "size-20 @sm:size-24 rounded-[24px] bg-white/20 backdrop-blur-md",
              "shadow-2xl overflow-hidden shrink-0 ring-1 ring-white/30"
            )}>
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <IconApps className="size-10 @sm:size-12 text-white/80" stroke={1.5} />
                </div>
              )}
            </div>
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
  color
}: { 
  app: MiniappManifest
  onTap: () => void
  color: string
}) {
  return (
    <button
      onClick={onTap}
      className={cn(
        "relative w-44 shrink-0 overflow-hidden rounded-2xl text-left",
        "shadow-lg active:scale-[0.96] transition-all duration-200",
        "snap-start scroll-ml-5"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", color)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(255,255,255,0.25),transparent_40%)]" />
      
      <div className="relative p-4 h-[160px] flex flex-col">
        <div className={cn(
          "size-14 rounded-2xl bg-white/25 backdrop-blur-sm overflow-hidden",
          "mb-auto ring-1 ring-white/30 shadow-lg"
        )}>
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center">
              <IconApps className="size-7 text-white/80" stroke={1.5} />
            </div>
          )}
        </div>
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
        <div className={cn(
          "size-16 rounded-2xl bg-muted overflow-hidden",
          "shadow-sm ring-1 ring-border/30"
        )}>
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
            </div>
          )}
        </div>
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
// 我的应用卡片
// ============================================
function MyAppCard({ 
  app, 
  lastUsed,
  onOpen 
}: { 
  app: MiniappManifest
  lastUsed: number
  onOpen: () => void
}) {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - lastUsed
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} 分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    return `${days} 天前`
  }, [lastUsed])

  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex flex-col items-center p-4 rounded-2xl",
        "bg-card border shadow-sm",
        "active:scale-[0.97] transition-transform",
        "hover:shadow-md"
      )}
    >
      <div className="size-16 rounded-2xl bg-muted overflow-hidden shadow-sm ring-1 ring-border/30 mb-2">
        {app.icon ? (
          <img src={app.icon} alt={app.name} className="size-full object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center">
            <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
          </div>
        )}
      </div>
      <span className="text-sm font-medium truncate max-w-full">{app.name}</span>
      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
        <IconClock className="size-3" />
        {timeAgo}
      </span>
    </button>
  )
}

// ============================================
// Tab 页内容
// ============================================
type TabType = 'discover' | 'mine'

const CARD_COLORS = [
  'from-violet-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
]

export function EcosystemTab() {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const [apps, setApps] = useState<MiniappManifest[]>([])
  const [myAppRecords, setMyAppRecords] = useState<MyAppRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('discover')
  
  // 滑动相关
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

  // 触摸滑动处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = 0
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    currentX.current = e.touches[0].clientX - startX.current
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    
    const threshold = 80
    if (currentX.current > threshold && activeTab === 'discover') {
      setActiveTab('mine')
    } else if (currentX.current < -threshold && activeTab === 'mine') {
      setActiveTab('discover')
    }
  }, [activeTab])

  const handleAppDetail = useCallback((app: MiniappManifest) => {
    push('MiniappDetailActivity', { appId: app.id })
  }, [push])

  const handleAppOpen = useCallback((app: MiniappManifest) => {
    addToMyApps(app.id)
    updateLastUsed(app.id)
    setMyAppRecords(loadMyApps())
    push('MiniappActivity', { appId: app.id })
  }, [push])

  // 我的应用（带完整信息）
  const myApps = useMemo(() => {
    return myAppRecords
      .map(record => ({
        ...record,
        app: apps.find(a => a.id === record.appId)
      }))
      .filter((item): item is MyAppRecord & { app: MiniappManifest } => !!item.app)
  }, [myAppRecords, apps])

  // 精选应用
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
          
          {/* 滑动指示器 */}
          <div 
            className={cn(
              "absolute -bottom-2 h-1 bg-primary rounded-full transition-all duration-300 ease-out"
            )}
            style={{
              width: activeTab === 'discover' ? '48px' : '48px',
              transform: `translateX(${activeTab === 'discover' ? '0' : 'calc(48px + 24px)'})`
            }}
          />
        </div>
      </header>

      {/* Tab 内容容器 */}
      <div 
        ref={containerRef}
        className="flex-1 relative"
      >
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
              {/* 精选大卡片 */}
              {featuredApp && (
                <section className="px-5">
                  <FeaturedStoryCard 
                    app={featuredApp} 
                    onTap={() => handleAppOpen(featuredApp)}
                  />
                </section>
              )}

              {/* 横向滚动推荐 */}
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
                        color={CARD_COLORS[i % CARD_COLORS.length]}
                      />
                    ))}
                    {/* 更多卡片保证滚动体验 */}
                    {recommendedApps.length < 4 && apps.map((app, i) => (
                      <HorizontalAppCard
                        key={`extra-${app.id}`}
                        app={app}
                        onTap={() => handleAppOpen(app)}
                        color={CARD_COLORS[(i + 2) % CARD_COLORS.length]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 热门排行 */}
              <section className="px-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">热门应用</h2>
                </div>
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

              {/* 第二精选 */}
              {apps.length > 1 && (
                <section className="px-5">
                  <FeaturedStoryCard 
                    app={apps[1]} 
                    onTap={() => handleAppOpen(apps[1])}
                    variant="secondary"
                  />
                </section>
              )}
            </div>
          )}
        </div>

        {/* 我的页 */}
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
            <div className="space-y-6 pt-4 px-5">
              {/* 最近使用 */}
              <section>
                <h2 className="text-lg font-bold mb-3">最近使用</h2>
                <div className="grid grid-cols-3 gap-3">
                  {myApps.slice(0, 6).map(({ app, lastUsedAt }) => (
                    <MyAppCard
                      key={app.id}
                      app={app}
                      lastUsed={lastUsedAt}
                      onOpen={() => handleAppOpen(app)}
                    />
                  ))}
                </div>
              </section>

              {/* 全部应用 */}
              {myApps.length > 6 && (
                <section>
                  <h2 className="text-lg font-bold mb-3">全部应用</h2>
                  <div className="bg-card rounded-2xl border divide-y">
                    {myApps.slice(6).map(({ app }) => (
                      <div key={app.id} className="px-4">
                        <AppListItem
                          app={app}
                          onTap={() => handleAppDetail(app)}
                          onOpen={() => handleAppOpen(app)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
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
