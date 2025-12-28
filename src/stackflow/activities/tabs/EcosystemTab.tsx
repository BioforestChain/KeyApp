import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps, refreshSources } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { IconSearch, IconApps, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// 获取今天日期
function getTodayDate() {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = now.getMonth() + 1
  const day = now.getDate()
  return `${month}月${day}日 ${weekdays[now.getDay()]}`
}

// 大型精选卡片 (App Store Today 风格)
function FeaturedStoryCard({ 
  app, 
  onTap,
  variant = 'primary'
}: { 
  app: MiniappManifest
  onTap: () => void
  variant?: 'primary' | 'secondary'
}) {
  const gradients = {
    primary: 'from-violet-600 via-purple-600 to-indigo-700',
    secondary: 'from-orange-500 via-amber-500 to-yellow-500',
  }
  
  return (
    <button
      onClick={onTap}
      className="group relative w-full overflow-hidden rounded-2xl text-left shadow-lg active:scale-[0.98] transition-transform"
    >
      {/* 背景渐变 */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        gradients[variant]
      )} />
      
      {/* 装饰圆形 */}
      <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-black/10 blur-xl" />
      
      {/* 内容 */}
      <div className="relative p-5 min-h-[280px] flex flex-col">
        {/* 顶部标签 */}
        <div className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wider mb-auto">
          <span className="size-1.5 rounded-full bg-white/80" />
          精选应用
        </div>
        
        {/* 底部信息 */}
        <div className="mt-auto">
          {/* App 图标和信息 */}
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-[22px] bg-white/20 backdrop-blur-sm shadow-lg overflow-hidden shrink-0 ring-1 ring-white/20">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <IconApps className="size-10 text-white/80" stroke={1.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-2xl font-bold text-white leading-tight mb-1">
                {app.name}
              </h2>
              <p className="text-sm text-white/70 line-clamp-2">
                {app.longDescription || app.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// 小型精选卡片
function FeaturedMiniCard({ 
  app, 
  onTap,
  color = 'blue'
}: { 
  app: MiniappManifest
  onTap: () => void
  color?: 'blue' | 'green' | 'orange' | 'pink'
}) {
  const colors = {
    blue: 'from-blue-500 to-cyan-400',
    green: 'from-emerald-500 to-teal-400',
    orange: 'from-orange-500 to-red-400',
    pink: 'from-pink-500 to-rose-400',
  }
  
  return (
    <button
      onClick={onTap}
      className="relative w-40 shrink-0 overflow-hidden rounded-xl text-left shadow-md active:scale-[0.97] transition-transform"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", colors[color])} />
      <div className="relative p-3 h-[140px] flex flex-col">
        <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm overflow-hidden mb-auto ring-1 ring-white/20">
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center">
              <IconApps className="size-6 text-white/80" stroke={1.5} />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white truncate">{app.name}</h3>
          <p className="text-xs text-white/70 truncate">{app.description}</p>
        </div>
      </div>
    </button>
  )
}

// 应用列表项 (排行榜风格)
function AppRankItem({ 
  app, 
  rank,
  onTap,
  onOpen
}: { 
  app: MiniappManifest
  rank: number
  onTap: () => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* 排名 */}
      <span className="w-6 text-center text-lg font-bold text-muted-foreground/60">
        {rank}
      </span>
      
      {/* 图标 */}
      <button onClick={onTap} className="shrink-0">
        <div className="size-16 rounded-2xl bg-muted overflow-hidden shadow-sm ring-1 ring-border/50">
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
            </div>
          )}
        </div>
      </button>

      {/* 信息 */}
      <button onClick={onTap} className="flex-1 min-w-0 text-left py-1">
        <h3 className="font-semibold truncate">{app.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{app.description}</p>
      </button>

      {/* 获取按钮 */}
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0 rounded-full px-5 h-8 text-xs font-bold bg-secondary/80"
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

// 区块标题
function SectionHeader({ 
  title, 
  action,
  onAction
}: { 
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {action && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center text-primary text-sm font-medium"
        >
          {action}
          <IconChevronRight className="size-4" />
        </button>
      )}
    </div>
  )
}

export function EcosystemTab() {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const [apps, setApps] = useState<MiniappManifest[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initRegistry().then(() => {
      setApps(getApps())
      setLoading(false)
    })
  }, [])

  const handleAppDetail = useCallback((app: MiniappManifest) => {
    push('MiniappDetailActivity', { appId: app.id })
  }, [push])

  const handleAppOpen = useCallback((app: MiniappManifest) => {
    push('MiniappActivity', { appId: app.id })
  }, [push])

  // 精选应用
  const featuredApp = apps[0]
  const secondaryApps = apps.slice(1, 4)
  const rankedApps = apps

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - App Store 风格 */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{getTodayDate()}</p>
            <h1 className="text-3xl font-bold tracking-tight">发现</h1>
          </div>
          <button
            onClick={() => {/* TODO: 搜索/个人资料 */}}
            className="size-10 rounded-full bg-muted/60 flex items-center justify-center"
            aria-label="搜索"
          >
            <IconSearch className="size-5" stroke={1.5} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-8">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-5">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <IconApps className="size-10 text-muted-foreground" stroke={1.5} />
            </div>
            <h2 className="text-lg font-semibold mb-1">暂无应用</h2>
            <p className="text-muted-foreground text-sm">稍后再来看看吧</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 主精选卡片 */}
            {featuredApp && (
              <section className="px-5">
                <FeaturedStoryCard 
                  app={featuredApp} 
                  onTap={() => handleAppOpen(featuredApp)}
                  variant="primary"
                />
              </section>
            )}

            {/* 横向滚动的小卡片 */}
            {secondaryApps.length > 0 && (
              <section>
                <div className="px-5 mb-3">
                  <h2 className="text-xl font-bold">推荐</h2>
                </div>
                <div 
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide snap-x snap-mandatory"
                >
                  {secondaryApps.map((app, i) => (
                    <div key={app.id} className="snap-start">
                      <FeaturedMiniCard 
                        app={app} 
                        onTap={() => handleAppOpen(app)}
                        color={(['blue', 'orange', 'green', 'pink'] as const)[i % 4]}
                      />
                    </div>
                  ))}
                  {/* 填充卡片使滚动更自然 */}
                  {apps.slice(0, 2).map((app, i) => (
                    <div key={`extra-${app.id}`} className="snap-start">
                      <FeaturedMiniCard 
                        app={app} 
                        onTap={() => handleAppOpen(app)}
                        color={(['pink', 'green'] as const)[i % 2]}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 热门排行 */}
            <section className="px-5">
              <SectionHeader 
                title="热门应用" 
                action="查看全部"
                onAction={() => {/* TODO */}}
              />
              <div className="bg-card rounded-2xl border divide-y">
                {rankedApps.map((app, i) => (
                  <div key={app.id} className="px-3">
                    <AppRankItem
                      app={app}
                      rank={i + 1}
                      onTap={() => handleAppDetail(app)}
                      onOpen={() => handleAppOpen(app)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 如果有更多应用，显示第二个精选 */}
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
    </div>
  )
}
