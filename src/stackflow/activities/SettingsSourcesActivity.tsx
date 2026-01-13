/**
 * SettingsSourcesActivity - 可信源管理页面
 * 管理小程序订阅源
 */

import { useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import {
  IconPlus,
  IconTrash,
  IconRefresh,
  IconCheck,
  IconX,
  IconWorld,
  IconArrowLeft,
} from '@tabler/icons-react'
import { ecosystemStore, ecosystemActions, type SourceRecord } from '@/stores/ecosystem'
import { refreshSources } from '@/services/ecosystem/registry'
import { useFlow } from '../stackflow'

export const SettingsSourcesActivity: ActivityComponentType = () => {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const state = useStore(ecosystemStore)

  const [isAdding, setIsAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      setError('请输入订阅 URL')
      return
    }

    // 验证 URL
    try {
      new URL(newUrl)
    } catch {
      setError('无效的 URL 格式')
      return
    }

    // 检查是否已存在
    if (state.sources.some((s) => s.url === newUrl)) {
      setError('该订阅源已存在')
      return
    }

    ecosystemActions.addSource(newUrl, newName || '自定义源')
    setNewUrl('')
    setNewName('')
    setIsAdding(false)
    setError(null)
  }

  const handleRemove = (url: string) => {
    ecosystemActions.removeSource(url)
  }

  const handleToggle = (url: string) => {
    ecosystemActions.toggleSource(url)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSources()
    } catch (e) {
      
    }
    setIsRefreshing(false)
  }

  return (
    <AppScreen>
      <div className="flex flex-col min-h-full bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => pop()}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label={t('back', '返回')}
            >
              <IconArrowLeft className="size-5" stroke={1.5} />
            </button>
            <h1 className="flex-1 text-lg font-semibold">可信源管理</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label={t('refresh', '刷新')}
            >
              <IconRefresh
                className={cn('size-5', isRefreshing && 'animate-spin')}
                stroke={1.5}
              />
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="flex-1 p-4 space-y-3">
          {state.sources.map((source) => (
            <SourceItem
              key={source.url}
              source={source}
              onToggle={() => handleToggle(source.url)}
              onRemove={() => handleRemove(source.url)}
            />
          ))}

          {state.sources.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              暂无订阅源
            </div>
          )}
        </div>

        {/* Add Source */}
        {isAdding ? (
          <div className="border-t p-4 bg-background space-y-3">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value)
                setError(null)
              }}
              placeholder="订阅 URL (https://...)"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名称 (可选)"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewUrl('')
                  setNewName('')
                  setError(null)
                }}
                className="flex-1 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <IconPlus className="size-5" stroke={1.5} />
              <span>添加订阅源</span>
            </button>
          </div>
        )}

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </AppScreen>
  )
}

interface SourceItemProps {
  source: SourceRecord
  onToggle: () => void
  onRemove: () => void
}

function SourceItem({ source, onToggle, onRemove }: SourceItemProps) {
  const isDefault = source.url === '/ecosystem.json'

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        source.enabled ? 'bg-card' : 'bg-muted/30 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="rounded-full bg-primary/10 p-2 shrink-0">
          <IconWorld className="size-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{source.name}</h3>
            {isDefault && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                官方
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {source.url}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            更新于 {new Date(source.lastUpdated).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle */}
          <button
            onClick={onToggle}
            className={cn(
              'p-2 rounded-full transition-colors',
              source.enabled
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            aria-label={source.enabled ? '禁用' : '启用'}
          >
            {source.enabled ? (
              <IconCheck className="size-4" stroke={2} />
            ) : (
              <IconX className="size-4" stroke={2} />
            )}
          </button>

          {/* Remove (not for default) */}
          {!isDefault && (
            <button
              onClick={onRemove}
              className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="删除"
            >
              <IconTrash className="size-4" stroke={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
