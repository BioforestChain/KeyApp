import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useNavigation } from '@/stackflow';
import { IconBell as Bell, IconCheck as Check, IconTrash as Trash2, IconChevronRight } from '@tabler/icons-react';
import { useStore } from '@tanstack/react-store';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  notificationStore,
  notificationActions,
  type Notification,
  type NotificationType,
} from '@/stores/notification';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/stores';

/** 通知类型图标和样式 */
const typeStyles: Record<NotificationType, { icon: string; bg: string }> = {
  transaction: { icon: '💸', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  security: { icon: '🔐', bg: 'bg-red-100 dark:bg-red-900/30' },
  system: { icon: '📢', bg: 'bg-gray-100 dark:bg-gray-800/30' },
};

/** 格式化相对时间 */
function useFormatRelativeTime() {
  const { t } = useTranslation('notification');
  const language = useLanguage();

  return useCallback(
    (timestamp: number): string => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return t('time.justNow');
      if (minutes < 60) return t('time.minutesAgo', { count: minutes });
      if (hours < 24) return t('time.hoursAgo', { count: hours });
      if (days < 7) return t('time.daysAgo', { count: days });
      return new Date(timestamp).toLocaleDateString(language);
    },
    [t, language],
  );
}

/** 通知项组件 */
function NotificationItem({
  notification,
  onRead,
  onRemove,
  onNavigate,
  formatRelativeTime,
  t,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate?: (notification: Notification) => void;
  formatRelativeTime: (timestamp: number) => string;
  t: TFunction<'notification'>;
}) {
  const style = typeStyles[notification.type];
  const hasPendingTxLink = notification.type === 'transaction' && !!notification.data?.pendingTxId;

  // 点击标记为已读并跳转
  const handleClick = useCallback(() => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (hasPendingTxLink && onNavigate) {
      onNavigate(notification);
    }
  }, [notification, onRead, onNavigate, hasPendingTxLink]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors',
        notification.read ? 'bg-muted/30' : 'bg-card shadow-sm',
      )}
    >
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', style.bg)}>
        <span className="text-lg">{style.icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn('font-medium', notification.read && 'text-muted-foreground')}>{notification.title}</h4>
          <span className="text-muted-foreground shrink-0 text-xs">{formatRelativeTime(notification.timestamp)}</span>
        </div>
        <p className={cn('mt-1 text-sm', notification.read ? 'text-muted-foreground' : 'text-foreground/80')}>
          {notification.message}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {!notification.read && <div className="bg-primary flex size-2 rounded-full" aria-label={t('unread')} />}
          {hasPendingTxLink && (
            <span className="text-primary flex items-center gap-0.5 text-xs">
              {t('viewDetails')}
              <IconChevronRight className="size-3" />
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="text-muted-foreground hover:text-destructive shrink-0 p-1"
        aria-label={t('delete')}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

/** 按日期分组的通知列表 */
function GroupedNotificationList({
  notifications,
  onRead,
  onRemove,
  onNavigate,
  formatRelativeTime,
  t,
  language,
}: {
  notifications: Notification[];
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate?: (notification: Notification) => void;
  formatRelativeTime: (timestamp: number) => string;
  t: TFunction<'notification'>;
  language: string;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Notification[]>();
    const today = new Date().toLocaleDateString(language);
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(language);

    for (const n of notifications) {
      const date = new Date(n.timestamp).toLocaleDateString(language);
      let label = date;
      if (date === today) label = t('time.today');
      else if (date === yesterday) label = t('time.yesterday');

      const existing = map.get(label) || [];
      map.set(label, [...existing, n]);
    }
    return map;
  }, [notifications, language, t]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
          <Bell className="text-muted-foreground size-8" />
        </div>
        <h3 className="text-lg font-medium">{t('empty.title')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('empty.desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-muted-foreground mb-2 text-sm font-medium">{date}</h3>
          <div className="space-y-2">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={onRead}
                onRemove={onRemove}
                onNavigate={onNavigate}
                formatRelativeTime={formatRelativeTime}
                t={t}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 通知中心页面 */
export function NotificationCenterPage() {
  const { t } = useTranslation('notification');
  const language = useLanguage();
  const formatRelativeTime = useFormatRelativeTime();
  const { goBack, navigate } = useNavigation();
  const state = useStore(notificationStore);

  // 初始化加载
  useEffect(() => {
    if (!state.isInitialized) {
      notificationActions.initialize();
    }
  }, [state.isInitialized]);

  const handleRead = useCallback((id: string) => {
    notificationActions.markRead(id);
  }, []);

  const handleRemove = useCallback((id: string) => {
    notificationActions.remove(id);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    notificationActions.markAllRead();
  }, []);

  const handleClearAll = useCallback(() => {
    notificationActions.clearAll();
  }, []);

  // 处理通知点击导航
  const handleNavigate = useCallback((notification: Notification) => {
    if (notification.type === 'transaction' && notification.data?.pendingTxId) {
      navigate({ to: `/pending-tx/${notification.data.pendingTxId}` });
    }
  }, [navigate]);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('title')}
        onBack={goBack}
        rightAction={
          state.unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm"
              aria-label={t('markAllRead')}
            >
              <Check className="size-4" />
              {t('markAllRead')}
            </button>
          ) : undefined
        }
      />

      {/* 统计栏 */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {state.unreadCount > 0 ? t('unreadCount', { count: state.unreadCount }) : t('noUnread')}
          </p>
          {state.notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive">
              <Trash2 className="mr-1 size-4" />
              {t('clear')}
            </Button>
          )}
        </div>
      </div>

      {/* 通知列表 */}
      <div className="flex-1 p-4">
        <GroupedNotificationList
          notifications={state.notifications}
          onRead={handleRead}
          onRemove={handleRemove}
          onNavigate={handleNavigate}
          formatRelativeTime={formatRelativeTime}
          t={t}
          language={language}
        />
      </div>
    </div>
  );
}
