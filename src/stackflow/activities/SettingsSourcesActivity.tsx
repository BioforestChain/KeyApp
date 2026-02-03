/**
 * SettingsSourcesActivity - 可信源管理页面
 * 管理小程序订阅源
 */

import { useState, useEffect, useCallback } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconTrash,
  IconRefresh,
  IconCheck,
  IconX,
  IconWorld,
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconEdit,
} from '@tabler/icons-react';
import { ecosystemStore, ecosystemActions, type SourceRecord } from '@/stores/ecosystem';
import { refreshSources, refreshSource } from '@/services/ecosystem/registry';
import { useFlow } from '../stackflow';

export const SettingsSourcesActivity: ActivityComponentType = () => {
  const { t } = useTranslation('common');
  const { pop } = useFlow();
  const state = useStore(ecosystemStore);

  const [isEditing, setIsEditing] = useState(false);
  const [editingUrl, setEditingUrl] = useState<string | null>(null); // null = adding new, string = editing existing
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当 URL 变化时，尝试获取源的名称
  const fetchSourceName = useCallback(async (url: string) => {
    setIsFetchingName(true);
    setFetchedName(null);
    try {
      const normalizedUrl = new URL(url).toString();
      const response = await fetch(normalizedUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.name && typeof data.name === 'string') {
          setFetchedName(data.name);
        }
      }
    } catch {
      // 忽略错误，用户可以手动输入名称
    } finally {
      setIsFetchingName(false);
    }
  }, []);

  // URL 输入防抖获取名称
  useEffect(() => {
    if (!newUrl.trim()) {
      setFetchedName(null);
      return;
    }

    try {
      new URL(newUrl);
    } catch {
      return; // URL 无效，不获取
    }

    const timer = setTimeout(() => {
      fetchSourceName(newUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [newUrl, fetchSourceName]);

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingUrl(null);
    setNewUrl('');
    setNewName('');
    setFetchedName(null);
    setError(null);
  };

  const handleStartEdit = (source: SourceRecord) => {
    setIsEditing(true);
    setEditingUrl(source.url);
    setNewUrl(source.url);
    setNewName(source.name);
    setFetchedName(null);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingUrl(null);
    setNewUrl('');
    setNewName('');
    setFetchedName(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!newUrl.trim()) {
      setError(t('sources.enterUrl'));
      return;
    }

    // 验证 URL
    let normalizedUrl: string;
    try {
      normalizedUrl = new URL(newUrl).toString();
    } catch {
      setError(t('sources.invalidUrl'));
      return;
    }

    const finalName = newName.trim() || fetchedName || t('sources.customSource');

    if (editingUrl) {
      // 编辑模式
      if (editingUrl !== normalizedUrl) {
        // URL 变了，检查是否已存在
        if (state.sources.some((s) => s.url === normalizedUrl)) {
          setError(t('sources.alreadyExists'));
          return;
        }
        // 删除旧的，添加新的
        ecosystemActions.removeSource(editingUrl);
        ecosystemActions.addSource(normalizedUrl, finalName);
      } else {
        // URL 没变，只更新名称
        ecosystemActions.updateSourceName(editingUrl, finalName);
      }
    } else {
      // 添加模式
      if (state.sources.some((s) => s.url === normalizedUrl)) {
        setError(t('sources.alreadyExists'));
        return;
      }
      ecosystemActions.addSource(normalizedUrl, finalName);
    }

    handleCancel();
    // 立即触发刷新
    void refreshSource(normalizedUrl);
  };

  const handleRemove = (url: string) => {
    ecosystemActions.removeSource(url);
  };

  const handleToggle = (url: string) => {
    ecosystemActions.toggleSource(url);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSources();
    } catch (e) {}
    setIsRefreshing(false);
  };

  const isAddMode = editingUrl === null;
  const namePlaceholder = fetchedName
    ? t('sources.nameWithDefault', { name: fetchedName })
    : t('sources.namePlaceholder');

  return (
    <AppScreen>
      <div className="bg-background flex min-h-full flex-col">
        {/* Header */}
        <div className="bg-background sticky top-0 z-10 border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => pop()}
              className="hover:bg-muted rounded-full p-1.5 transition-colors"
              aria-label={t('back')}
            >
              <IconArrowLeft className="size-5" stroke={1.5} />
            </button>
            <h1 className="flex-1 text-lg font-semibold">{t('sources.title')}</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hover:bg-muted rounded-full p-1.5 transition-colors"
              aria-label={t('refresh')}
            >
              <IconRefresh className={cn('size-5', isRefreshing && 'animate-spin')} stroke={1.5} />
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="flex-1 space-y-3 p-4">
          {state.sources.map((source) => (
            <SourceItem
              key={source.url}
              source={source}
              onToggle={() => handleToggle(source.url)}
              onRemove={() => handleRemove(source.url)}
              onEdit={() => handleStartEdit(source)}
              isSelected={editingUrl === source.url}
            />
          ))}

          {state.sources.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">{t('sources.noSources')}</div>
          )}
        </div>

        {/* Add/Edit Source */}
        {isEditing ? (
          <div className="bg-background space-y-3 border-t p-4">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value);
                setError(null);
              }}
              placeholder={t('sources.urlPlaceholder')}
              className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
              disabled={editingUrl !== null && editingUrl === newUrl}
            />
            <div className="relative">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={namePlaceholder}
                className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 pr-8 focus:ring-2 focus:outline-none"
              />
              {isFetchingName && (
                <IconLoader2 className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin" />
              )}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-lg py-2 font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-lg py-2 font-medium"
              >
                {isAddMode ? t('add') : t('save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4">
            <button
              onClick={handleStartAdd}
              className="border-muted-foreground/30 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 transition-colors"
            >
              <IconPlus className="size-5" stroke={1.5} />
              <span>{t('sources.addSource')}</span>
            </button>
          </div>
        )}

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </AppScreen>
  );
};

interface SourceItemProps {
  source: SourceRecord;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: () => void;
  isSelected?: boolean;
}

function SourceItem({ source, onToggle, onRemove, onEdit, isSelected }: SourceItemProps) {
  const { t } = useTranslation('common');
  const isDefault = source.url.includes('ecosystem.json');

  const statusIcon = {
    idle: null,
    loading: <IconLoader2 className="text-muted-foreground size-3 animate-spin" />,
    success: <IconCheck className="size-3 text-green-500" />,
    error: <IconAlertCircle className="size-3 text-red-500" />,
  }[source.status];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors cursor-pointer',
        source.enabled ? 'bg-card' : 'bg-muted/30 opacity-60',
        isSelected && 'ring-2 ring-primary',
      )}
      onClick={onEdit}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 shrink-0 rounded-full p-2">
          <IconWorld className="text-primary size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{source.name}</h3>
            {isDefault && (
              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">{t('sources.official')}</span>
            )}
            {statusIcon}
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">{source.url}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-muted-foreground text-xs">
              {t('sources.updatedAt', { date: new Date(source.lastUpdated).toLocaleString() })}
            </p>
            {source.status === 'error' && source.errorMessage && (
              <p className="truncate text-xs text-red-500">{source.errorMessage}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggle}
            className={cn(
              'rounded-full p-2 transition-colors',
              source.enabled
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
            aria-label={source.enabled ? t('disable') : t('enable')}
          >
            {source.enabled ? <IconCheck className="size-4" stroke={2} /> : <IconX className="size-4" stroke={2} />}
          </button>

          {!isDefault && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-2 transition-colors"
              aria-label={t('delete')}
            >
              <IconTrash className="size-4" stroke={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
