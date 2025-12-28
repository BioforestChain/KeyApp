import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps, refreshSources } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { IconRefresh, IconApps, IconShieldCheck, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

function MiniappCard({ app, onClick, onOpen }: { 
  app: MiniappManifest
  onClick: () => void
  onOpen: () => void 
}) {
  return (
    <div 
      className="bg-card rounded-2xl border overflow-hidden"
    >
      {/* Clickable area for details */}
      <button
        onClick={onClick}
        className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="size-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden shrink-0">
            {app.icon ? (
              <img
                src={app.icon}
                alt={app.name}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <IconApps className="size-7 text-primary" stroke={1.5} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold truncate">{app.name}</h3>
              {app.verified && (
                <IconShieldCheck className="size-4 text-green-500 shrink-0" />
              )}
              {app.beta && (
                <span className="px-1 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded shrink-0">
                  Beta
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {app.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {app.category && (
                <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                  {getCategoryLabel(app.category)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                v{app.version}
              </span>
            </div>
          </div>

          <IconChevronRight className="size-5 text-muted-foreground shrink-0 mt-1" />
        </div>
      </button>

      {/* Open button */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          打开
        </button>
      </div>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    defi: 'DeFi',
    nft: 'NFT',
    tools: '工具',
    games: '游戏',
    social: '社交',
    exchange: '交易所',
    other: '其他',
  }
  return labels[category] ?? category
}

export function EcosystemTab() {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const [apps, setApps] = useState<MiniappManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('ecosystem', '生态')}</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t('refresh', '刷新')}
          >
            <IconRefresh
              className={cn('size-5', refreshing && 'animate-spin')}
              stroke={1.5}
            />
          </button>
        </div>
      </div>

      {/* App List */}
      <div className="flex-1 p-4">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
            </div>
            <p className="text-muted-foreground">{t('noApps', '暂无小程序')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <MiniappCard
                key={app.id}
                app={app}
                onClick={() => handleAppDetail(app)}
                onOpen={() => handleAppOpen(app)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
