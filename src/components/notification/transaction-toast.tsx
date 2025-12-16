import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX as X,
  IconCircleCheck as CheckCircle2,
  IconCircleX as XCircle,
  IconLoader2 as Loader2,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { NotificationStatus } from '@/stores/notification';

export interface TransactionToastProps {
  /** 唯一标识 */
  id: string;
  /** 交易状态 */
  status: NotificationStatus;
  /** 标题 */
  title: string;
  /** 消息内容 */
  message?: string;
  /** 交易哈希（可选） */
  txHash?: string;
  /** 自动关闭延迟（毫秒），0 表示不自动关闭 */
  duration?: number;
  /** 关闭回调 */
  onClose?: ((id: string) => void) | undefined;
  /** 点击回调 */
  onClick?: ((id: string) => void) | undefined;
}

/** 状态样式和图标配置 */
const statusConfig: Record<
  NotificationStatus,
  { icon: typeof CheckCircle2; className: string; iconClassName: string }
> = {
  pending: {
    icon: Loader2,
    className: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    iconClassName: 'text-yellow-600 dark:text-yellow-400 animate-spin',
  },
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  failed: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
};

/** 缩短交易哈希显示 */
function shortenHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * 交易状态 Toast 组件
 * 用于显示交易状态更新（pending/success/failed）
 */
export function TransactionToast({
  id,
  status,
  title,
  message,
  txHash,
  duration = 5000,
  onClose,
  onClick,
}: TransactionToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 200); // Animation duration
  }, [id, onClose]);

  // Auto-close (except for pending)
  useEffect(() => {
    if (duration > 0 && status !== 'pending') {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, status, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={() => onClick?.(id)}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-200',
        config.className,
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        onClick && 'cursor-pointer',
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', config.iconClassName)} />

      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-muted-foreground mt-0.5 text-sm">{message}</p>}
        {txHash && <p className="text-muted-foreground mt-1 font-mono text-xs">{shortenHash(txHash)}</p>}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="关闭"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/** Toast 容器组件 - 用于管理多个 toast 的显示 */
export interface ToastContainerProps {
  toasts: TransactionToastProps[];
  onClose: (id: string) => void;
  onClick?: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const positionStyles: Record<ToastContainerProps['position'] & string, string> = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ toasts, onClose, onClick, position = 'top-right' }: ToastContainerProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn('pointer-events-none fixed z-50 flex flex-col gap-2', positionStyles[position])}
      aria-label="通知"
    >
      {toasts.map((toast) => (
        <TransactionToast key={toast.id} {...toast} onClose={onClose} onClick={onClick ?? undefined} />
      ))}
    </div>,
    document.body,
  );
}
