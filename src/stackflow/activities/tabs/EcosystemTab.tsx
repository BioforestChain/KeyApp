import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../../stackflow'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { initRegistry, getApps, refreshSources } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { IconRefresh, IconApps } from '@tabler/icons-react'

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

  const handleAppClick = useCallback((app: MiniappManifest) => {
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
          <h1 className="text-xl font-bold">生态</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t('refresh', '刷新')}
          >
            <IconRefresh
              className={`size-5 ${refreshing ? 'animate-spin' : ''}`}
              stroke={1.5}
            />
          </button>
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 p-4">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconApps className="size-8 text-muted-foreground" stroke={1.5} />
            </div>
            <p className="text-muted-foreground">暂无小程序</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
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
                <span className="text-xs font-medium text-center line-clamp-2">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
