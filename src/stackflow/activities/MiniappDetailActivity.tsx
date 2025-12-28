/**
 * MiniappDetailActivity - 小程序详情页 (App Store 风格)
 */

import { useEffect, useState, useCallback } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { useTranslation } from 'react-i18next'
import { useFlow } from '../stackflow'
import { 
  getAppById, 
  initRegistry, 
  addToMyApps,
  updateLastUsed,
  type MiniappManifest, 
  KNOWN_PERMISSIONS 
} from '@/services/ecosystem'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { MiniappIcon } from '@/components/ecosystem'
import { 
  IconArrowLeft, 
  IconExternalLink, 
  IconShieldCheck, 
  IconAlertTriangle,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconShare,
  IconLink,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

type MiniappDetailActivityParams = {
  appId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  defi: 'DeFi',
  nft: 'NFT',
  tools: '工具',
  games: '游戏',
  social: '社交',
  exchange: '交易所',
  other: '其他',
}

function PrivacyItem({ 
  permission, 
  isLast 
}: { 
  permission: string
  isLast: boolean 
}) {
  const def = KNOWN_PERMISSIONS[permission]
  const risk = def?.risk ?? 'medium'
  
  const Icon = risk === 'high' ? IconAlertTriangle : IconShieldCheck
  const iconColor = risk === 'high' ? 'text-red-500' : risk === 'medium' ? 'text-amber-500' : 'text-green-500'
  
  return (
    <div className={cn(
      'flex items-start gap-3 py-3',
      !isLast && 'border-b border-border/50'
    )}>
      <Icon className={cn('size-5 mt-0.5 shrink-0', iconColor)} stroke={1.5} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{def?.name ?? permission}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {def?.description ?? '此应用可能访问此功能'}
        </p>
      </div>
    </div>
  )
}

function InfoRow({ 
  label, 
  value, 
  isLink = false,
  href 
}: { 
  label: string
  value: string
  isLink?: boolean
  href?: string
}) {
  const content = (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn(
        'text-sm font-medium',
        isLink && 'text-primary flex items-center gap-1'
      )}>
        {value}
        {isLink && <IconChevronRight className="size-4" />}
      </span>
    </div>
  )
  
  if (isLink && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  
  return content
}

export const MiniappDetailActivity: ActivityComponentType<MiniappDetailActivityParams> = ({ params }) => {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const [app, setApp] = useState<MiniappManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    initRegistry().then(() => {
      const manifest = getAppById(params.appId)
      setApp(manifest ?? null)
      setLoading(false)
    })
  }, [params.appId])

  const handleOpen = useCallback(() => {
    if (!app) return
    addToMyApps(app.id)
    updateLastUsed(app.id)
    push('MiniappActivity', { appId: app.id })
  }, [app, push])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">应用不存在</p>
        <button
          onClick={() => pop()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium"
        >
          返回
        </button>
      </div>
    )
  }

  const description = app.longDescription ?? app.description
  const isDescLong = description.length > 150
  const displayDesc = descExpanded || !isDescLong 
    ? description 
    : description.slice(0, 150) + '...'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - 透明背景滚动效果 */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => pop()}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <IconArrowLeft className="size-5" stroke={1.5} />
          </button>
          
          <button className="p-1.5 -mr-1.5 rounded-full hover:bg-muted transition-colors">
            <IconShare className="size-5" stroke={1.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* App Header - App Store 风格 */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-start gap-4">
            {/* 大图标 */}
            <MiniappIcon 
              src={app.icon}
              name={app.name}
              size="2xl"
              shadow="lg"
              className="shrink-0"
            />

            {/* 信息区 */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-xl font-bold truncate">{app.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {app.author ?? '未知开发者'}
              </p>
              
              {/* 打开按钮 */}
              <button
                onClick={handleOpen}
                className="mt-4 px-8 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold"
              >
                打开
              </button>
            </div>
          </div>
          
          {/* 元信息行 */}
          <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
            {app.category && (
              <span className="font-medium text-foreground">
                {CATEGORY_LABELS[app.category] ?? app.category}
              </span>
            )}
            {app.beta && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                Beta
              </span>
            )}
            <span>v{app.version}</span>
          </div>
        </div>

        {/* 截图预览 - App Store 风格 */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="border-t border-border/50">
            <div className="px-5 py-4">
              <h2 className="text-lg font-bold mb-4">预览</h2>
              <div 
                className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
              >
                {app.screenshots.map((url, i) => (
                  <div 
                    key={i}
                    className="w-[220px] aspect-[9/19.5] rounded-2xl bg-muted overflow-hidden shrink-0 snap-center shadow-lg ring-1 ring-black/5"
                  >
                    <img 
                      src={url} 
                      alt={`${app.name} screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.parentElement!.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 描述 */}
        <div className="border-t border-border/50 px-5 py-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayDesc}
          </p>
          {isDescLong && (
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="text-primary text-sm font-medium mt-2 flex items-center gap-1"
            >
              {descExpanded ? '收起' : '更多'}
              {descExpanded ? (
                <IconChevronUp className="size-4" />
              ) : (
                <IconChevronDown className="size-4" />
              )}
            </button>
          )}
        </div>

        {/* 支持的链 */}
        {app.chains && app.chains.length > 0 && (
          <div className="border-t border-border/50 px-5 py-4">
            <h2 className="text-lg font-bold mb-3">支持的区块链</h2>
            <div className="flex flex-wrap gap-2">
              {app.chains.map((chain) => (
                <span 
                  key={chain}
                  className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium"
                >
                  {chain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 隐私 / 权限 - App Store 风格 */}
        {app.permissions && app.permissions.length > 0 && (
          <div className="border-t border-border/50 px-5 py-4">
            <h2 className="text-lg font-bold mb-1">应用隐私</h2>
            <p className="text-xs text-muted-foreground mb-4">
              开发者声明此应用可能会请求以下权限
            </p>
            <div className="bg-muted/50 rounded-2xl px-4">
              {app.permissions.map((perm, i) => (
                <PrivacyItem 
                  key={perm} 
                  permission={perm}
                  isLast={i === app.permissions!.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        {app.tags && app.tags.length > 0 && (
          <div className="border-t border-border/50 px-5 py-4">
            <h2 className="text-lg font-bold mb-3">标签</h2>
            <div className="flex flex-wrap gap-2">
              {app.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 信息 */}
        <div className="border-t border-border/50 px-5 py-4">
          <h2 className="text-lg font-bold mb-2">信息</h2>
          <div className="bg-muted/50 rounded-2xl px-4">
            {app.author && (
              <InfoRow label="开发者" value={app.author} />
            )}
            <InfoRow label="版本" value={app.version} />
            {app.category && (
              <InfoRow 
                label="类别" 
                value={CATEGORY_LABELS[app.category] ?? app.category} 
              />
            )}
            {app.publishedAt && (
              <InfoRow label="发布日期" value={app.publishedAt} />
            )}
            {app.updatedAt && (
              <InfoRow label="更新日期" value={app.updatedAt} />
            )}
            {app.website && (
              <InfoRow 
                label="开发者网站" 
                value="访问" 
                isLink 
                href={app.website}
              />
            )}
          </div>
        </div>

        {/* 底部安全间距 */}
        <div className="h-8" />
      </div>
    </div>
  )
}
