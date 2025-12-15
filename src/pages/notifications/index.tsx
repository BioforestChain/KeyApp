import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, Check, Trash2 } from 'lucide-react';
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

/** 通知类型图标和样式 */
const typeStyles: Record<NotificationType, { icon: string; bg: string }> = {
  transaction: { icon: '💸', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  security: { icon: '🔐', bg: 'bg-red-100 dark:bg-red-900/30' },
  system: { icon: '📢', bg: 'bg-gray-100 dark:bg-gray-800/30' },
};

/** 格式化相对时间 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

/** 通知项组件 */
function NotificationItem({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const style = typeStyles[notification.type];

  // 点击标记为已读
  const handleClick = useCallback(() => {
    if (!notification.read) {
      onRead(notification.id);
    }
  }, [notification.id, notification.read, onRead]);

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
        {!notification.read && <div className="bg-primary mt-2 flex size-2 rounded-full" aria-label="未读" />}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="text-muted-foreground hover:text-destructive shrink-0 p-1"
        aria-label="删除"
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
}: {
  notifications: Notification[];
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Notification[]>();
    const today = new Date().toLocaleDateString('zh-CN');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN');

    for (const n of notifications) {
      const date = new Date(n.timestamp).toLocaleDateString('zh-CN');
      let label = date;
      if (date === today) label = '今天';
      else if (date === yesterday) label = '昨天';

      const existing = map.get(label) || [];
      map.set(label, [...existing, n]);
    }
    return map;
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
          <Bell className="text-muted-foreground size-8" />
        </div>
        <h3 className="text-lg font-medium">暂无通知</h3>
        <p className="text-muted-foreground mt-1 text-sm">您的所有通知都会显示在这里</p>
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
              <NotificationItem key={n.id} notification={n} onRead={onRead} onRemove={onRemove} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 通知中心页面 */
export function NotificationCenterPage() {
  const navigate = useNavigate();
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

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title="通知中心"
        onBack={() => navigate({ to: '/' })}
        rightAction={
          state.unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm"
              aria-label="全部已读"
            >
              <Check className="size-4" />
              全部已读
            </button>
          ) : undefined
        }
      />

      {/* 统计栏 */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {state.unreadCount > 0 ? (
              <>
                <span className="text-foreground font-medium">{state.unreadCount}</span> 条未读
              </>
            ) : (
              '没有未读通知'
            )}
          </p>
          {state.notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive">
              <Trash2 className="mr-1 size-4" />
              清空
            </Button>
          )}
        </div>
      </div>

      {/* 通知列表 */}
      <div className="flex-1 p-4">
        <GroupedNotificationList notifications={state.notifications} onRead={handleRead} onRemove={handleRemove} />
      </div>
    </div>
  );
}
