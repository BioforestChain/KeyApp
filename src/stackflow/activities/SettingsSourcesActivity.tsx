/**
 * SettingsSourcesActivity - 可信源管理页面
 * 管理小程序订阅源
 */

import { useState } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import { IconPlus, IconTrash, IconRefresh, IconCheck, IconX, IconWorld, IconArrowLeft } from '@tabler/icons-react';
import { ecosystemStore, ecosystemActions, type SourceRecord } from '@/stores/ecosystem';
import { refreshSources } from '@/services/ecosystem/registry';
import { useFlow } from '../stackflow';

export const SettingsSourcesActivity: ActivityComponentType = () => {
  const { t } = useTranslation('common');
  const { pop } = useFlow();
  const state = useStore(ecosystemStore);

  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      setError(t('sources.enterUrl'));
      return;
    }

    // 验证 URL
    try {
      new URL(newUrl);
    } catch {
      setError(t('sources.invalidUrl'));
      return;
    }

    // 检查是否已存在
    if (state.sources.some((s) => s.url === newUrl)) {
      setError(t('sources.alreadyExists'));
      return;
    }

    ecosystemActions.addSource(newUrl, newName || t('sources.customSource'));
    setNewUrl('');
    setNewName('');
    setIsAdding(false);
    setError(null);
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
            />
          ))}

          {state.sources.length === 0 && <div className="text-muted-foreground py-12 text-center">暂无订阅源</div>}
        </div>

        {/* Add Source */}
        {isAdding ? (
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
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('sources.namePlaceholder')}
              className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewUrl('');
                  setNewName('');
                  setError(null);
                }}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-lg py-2 font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAdd}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-lg py-2 font-medium"
              >
                {t('add')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4">
            <button
              onClick={() => setIsAdding(true)}
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
}

function SourceItem({ source, onToggle, onRemove }: SourceItemProps) {
  const isDefault = source.url === '/ecosystem.json';

  return (
    <div
      className={cn('rounded-xl border p-4 transition-colors', source.enabled ? 'bg-card' : 'bg-muted/30 opacity-60')}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="bg-primary/10 shrink-0 rounded-full p-2">
          <IconWorld className="text-primary size-5" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{source.name}</h3>
            {isDefault && <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">官方</span>}
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">{source.url}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            更新于 {new Date(source.lastUpdated).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Toggle */}
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

          {/* Remove (not for default) */}
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
