/**
 * MiniappDetailActivity - 小程序详情页
 * 
 * 展示小程序的完整元数据，包括描述、权限、截图等
 */

import { useEffect, useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../stackflow'
import { getAppById, initRegistry, type MiniappManifest, KNOWN_PERMISSIONS } from '@/services/ecosystem'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { 
  IconArrowLeft, 
  IconExternalLink, 
  IconShieldCheck, 
  IconAlertTriangle,
  IconCalendar,
  IconUser,
  IconTag,
  IconApps,
  IconChevronRight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

type MiniappDetailActivityParams = {
  appId: string
}

function PermissionBadge({ permission }: { permission: string }) {
  const def = KNOWN_PERMISSIONS[permission]
  const risk = def?.risk ?? 'medium'
  
  return (
    <div className={cn(
      'flex items-center gap-2 p-3 rounded-xl',
      risk === 'low' && 'bg-green-50 dark:bg-green-950/30',
      risk === 'medium' && 'bg-amber-50 dark:bg-amber-950/30',
      risk === 'high' && 'bg-red-50 dark:bg-red-950/30',
    )}>
      <div className={cn(
        'size-8 rounded-full flex items-center justify-center',
        risk === 'low' && 'bg-green-100 dark:bg-green-900',
        risk === 'medium' && 'bg-amber-100 dark:bg-amber-900',
        risk === 'high' && 'bg-red-100 dark:bg-red-900',
      )}>
        {risk === 'high' ? (
          <IconAlertTriangle className="size-4 text-red-600" />
        ) : (
          <IconShieldCheck className={cn(
            'size-4',
            risk === 'low' && 'text-green-600',
            risk === 'medium' && 'text-amber-600',
          )} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{def?.name ?? permission}</p>
        <p className="text-xs text-muted-foreground">{def?.description ?? '未知权限'}</p>
      </div>
    </div>
  )
}

function CategoryBadge({ category }: { category: string | undefined }) {
  const labels: Record<string, string> = {
    defi: 'DeFi',
    nft: 'NFT',
    tools: '工具',
    games: '游戏',
    social: '社交',
    exchange: '交易所',
    other: '其他',
  }
  
  return (
    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
      {labels[category ?? 'other'] ?? category}
    </span>
  )
}

export const MiniappDetailActivity: ActivityComponentType<MiniappDetailActivityParams> = ({ params }) => {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const [app, setApp] = useState<MiniappManifest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initRegistry().then(() => {
      const manifest = getAppById(params.appId)
      setApp(manifest ?? null)
      setLoading(false)
    })
  }, [params.appId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">小程序不存在</p>
      </div>
    )
  }

  const handleOpen = () => {
    push('MiniappActivity', { appId: app.id })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => pop()}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <IconArrowLeft className="size-5" stroke={1.5} />
          </button>
          <h1 className="font-semibold flex-1">{t('appDetails', '应用详情')}</h1>
        </div>
      </div>

      {/* App Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden shrink-0">
            {app.icon ? (
              <img src={app.icon} alt={app.name} className="size-full object-cover" />
            ) : (
              <IconApps className="size-10 text-primary" stroke={1.5} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold truncate">{app.name}</h2>
              {app.beta && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                  Beta
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-0.5">
              {app.author ?? '未知开发者'}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <CategoryBadge category={app.category} />
              <span className="text-xs text-muted-foreground">v{app.version}</span>
            </div>
          </div>
        </div>

        {/* Open Button */}
        <button
          onClick={handleOpen}
          className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <IconExternalLink className="size-4" />
          {t('open', '打开')}
        </button>
      </div>

      {/* Description */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">{t('description', '介绍')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {app.longDescription ?? app.description}
        </p>
      </div>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">{t('screenshots', '截图')}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {app.screenshots.map((url, i) => (
              <div 
                key={i}
                className="w-40 h-72 rounded-xl bg-muted overflow-hidden shrink-0"
              >
                <img 
                  src={url} 
                  alt={`${app.name} screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {app.permissions && app.permissions.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">{t('permissions', '权限')}</h3>
          <div className="space-y-2">
            {app.permissions.map((perm) => (
              <PermissionBadge key={perm} permission={perm} />
            ))}
          </div>
        </div>
      )}

      {/* Chains */}
      {app.chains && app.chains.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">{t('supportedChains', '支持的链')}</h3>
          <div className="flex flex-wrap gap-2">
            {app.chains.map((chain) => (
              <span 
                key={chain}
                className="px-3 py-1.5 bg-muted rounded-full text-sm"
              >
                {chain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {app.tags && app.tags.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">{t('tags', '标签')}</h3>
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1.5 bg-muted rounded-full text-sm flex items-center gap-1"
              >
                <IconTag className="size-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold mb-3">{t('info', '信息')}</h3>
        <div className="space-y-3">
          {app.author && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <IconUser className="size-4" />
                {t('developer', '开发者')}
              </span>
              <span className="text-sm">{app.author}</span>
            </div>
          )}
          
          {app.publishedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <IconCalendar className="size-4" />
                {t('publishedAt', '发布时间')}
              </span>
              <span className="text-sm">{app.publishedAt}</span>
            </div>
          )}
          
          {app.updatedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <IconCalendar className="size-4" />
                {t('updatedAt', '更新时间')}
              </span>
              <span className="text-sm">{app.updatedAt}</span>
            </div>
          )}

          {app.website && (
            <a 
              href={app.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2"
            >
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <IconExternalLink className="size-4" />
                {t('website', '官网')}
              </span>
              <IconChevronRight className="size-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
