import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps, refreshSources } from '@/services/ecosystem'
import type { MiniappManifest, MiniappCategory } from '@/services/ecosystem'
import { IconSearch, IconApps, IconShieldCheck, IconFlame, IconSparkles } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// 分类配置
const CATEGORIES: { id: MiniappCategory | 'all'; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: '全部' },
  { id: 'defi', label: 'DeFi' },
  { id: 'exchange', label: '交易' },
  { id: 'tools', label: '工具' },
  { id: 'nft', label: 'NFT' },
  { id: 'games', label: '游戏' },
  { id: 'social', label: '社交' },
]

// 精选大卡片
function FeaturedCard({ app, onOpen }: { app: MiniappManifest; onOpen: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative p-5">
        {/* 标签 */}
        <div className="flex items-center gap-2 mb-3">
          <IconSparkles className="size-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wide">精选应用</span>
        </div>

        <div className="flex gap-4">
          {/* 图标 */}
          <div className="size-20 rounded-2xl bg-card shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            {app.icon ? (
              <img src={app.icon} alt={app.name} className="size-full object-cover" />
            ) : (
              <IconApps className="size-10 text-primary" stroke={1.5} />
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{app.name}</h2>
              {app.verified && <IconShieldCheck className="size-5 text-green-500" />}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {app.longDescription || app.description}
            </p>
            <Button 
              size="sm" 
              className="mt-3 px-6"
              onClick={onOpen}
            >
              打开
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 应用列表项（App Store 风格）
function AppListItem({ 
  app, 
  onDetail, 
  onOpen 
}: { 
  app: MiniappManifest
  onDetail: () => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      {/* 图标 */}
      <button onClick={onDetail} className="shrink-0">
        <div className="size-14 rounded-xl bg-muted overflow-hidden shadow-sm">
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center">
              <IconApps className="size-7 text-muted-foreground" stroke={1.5} />
            </div>
          )}
        </div>
      </button>

      {/* 信息 */}
      <button onClick={onDetail} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-medium truncate">{app.name}</span>
          {app.verified && <IconShieldCheck className="size-4 text-green-500 shrink-0" />}
          {app.beta && (
            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded shrink-0">
              Beta
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {app.description}
        </p>
      </button>

      {/* 获取按钮 */}
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0 rounded-full px-5 h-8 text-xs font-semibold"
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

// 分类标签
function CategoryTab({ 
  category, 
  selected, 
  onClick 
}: { 
  category: typeof CATEGORIES[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted hover:bg-muted/80 text-muted-foreground"
      )}
    >
      {category.label}
    </button>
  )
}

// 区块标题
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {action}
    </div>
  )
}

export function EcosystemTab() {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const [apps, setApps] = useState<MiniappManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MiniappCategory | 'all'>('all')

  useEffect(() => {
    initRegistry().then(() => {
      setApps(getApps())
      setLoading(false)
    })
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshSources()
    setApps(getApps())
    setRefreshing(false)
  }, [])

  const handleAppDetail = useCallback((app: MiniappManifest) => {
    push('MiniappDetailActivity', { appId: app.id })
  }, [push])

  const handleAppOpen = useCallback((app: MiniappManifest) => {
    push('MiniappActivity', { appId: app.id })
  }, [push])

  // 过滤应用
  const filteredApps = selectedCategory === 'all' 
    ? apps 
    : apps.filter(app => app.category === selectedCategory)

  // 精选应用（第一个验证过的应用）
  const featuredApp = apps.find(app => app.verified) || apps[0]

  // 热门应用（非精选的前几个）
  const hotApps = apps.filter(app => app !== featuredApp).slice(0, 5)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('ecosystem', '生态')}</h1>
            <button
              onClick={() => {/* TODO: 搜索 */}}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={t('search', '搜索')}
            >
              <IconSearch className="size-5" stroke={1.5} />
            </button>
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                selected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
            </div>
            <p className="text-muted-foreground">{t('noApps', '暂无小程序')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 精选应用 - 仅在"全部"分类显示 */}
            {selectedCategory === 'all' && featuredApp && (
              <section>
                <FeaturedCard 
                  app={featuredApp} 
                  onOpen={() => handleAppOpen(featuredApp)} 
                />
              </section>
            )}

            {/* 热门应用 - 仅在"全部"分类显示 */}
            {selectedCategory === 'all' && hotApps.length > 0 && (
              <section>
                <SectionHeader 
                  title="热门应用" 
                  action={
                    <IconFlame className="size-5 text-orange-500" />
                  }
                />
                <div className="bg-card rounded-2xl border divide-y">
                  {hotApps.map((app) => (
                    <div key={app.id} className="px-4">
                      <AppListItem
                        app={app}
                        onDetail={() => handleAppDetail(app)}
                        onOpen={() => handleAppOpen(app)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 分类应用列表 */}
            {selectedCategory !== 'all' && (
              <section>
                <SectionHeader 
                  title={CATEGORIES.find(c => c.id === selectedCategory)?.label || '应用'} 
                />
                {filteredApps.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    该分类暂无应用
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border divide-y">
                    {filteredApps.map((app) => (
                      <div key={app.id} className="px-4">
                        <AppListItem
                          app={app}
                          onDetail={() => handleAppDetail(app)}
                          onOpen={() => handleAppOpen(app)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 全部应用 */}
            {selectedCategory === 'all' && (
              <section>
                <SectionHeader title="全部应用" />
                <div className="bg-card rounded-2xl border divide-y">
                  {apps.map((app) => (
                    <div key={app.id} className="px-4">
                      <AppListItem
                        app={app}
                        onDetail={() => handleAppDetail(app)}
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
  )
}
