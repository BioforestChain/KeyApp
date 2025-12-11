import { cn } from '@/lib/utils';
import { Check, X, Clock, Ban } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TransactionStatusType = 'success' | 'failed' | 'pending' | 'cancelled';

interface TransactionStatusProps {
  /** Transaction status */
  status: TransactionStatusType;
  /** Show text label */
  showLabel?: boolean | undefined;
  /** Custom label text */
  label?: string | undefined;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Additional class names */
  className?: string | undefined;
}

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  colorClass: string;
  bgClass: string;
}

const statusConfigs: Record<TransactionStatusType, StatusConfig> = {
  success: {
    icon: Check,
    label: 'Success',
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
  },
  failed: {
    icon: X,
    label: 'Failed',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  cancelled: {
    icon: Ban,
    label: 'Cancelled',
    colorClass: 'text-gray-500 dark:text-gray-400',
    bgClass: 'bg-gray-100 dark:bg-gray-800/50',
  },
};

const sizeClasses = {
  sm: { icon: 'size-3', text: 'text-xs', gap: 'gap-1', padding: 'px-1.5 py-0.5' },
  md: { icon: 'size-4', text: 'text-sm', gap: 'gap-1.5', padding: 'px-2 py-1' },
  lg: { icon: 'size-5', text: 'text-base', gap: 'gap-2', padding: 'px-2.5 py-1.5' },
};

/**
 * Transaction status badge with icon and optional label
 */
export function TransactionStatus({
  status,
  showLabel = true,
  label,
  size = 'md',
  className,
}: TransactionStatusProps) {
  const config = statusConfigs[status];
  const sizes = sizeClasses[size];
  const Icon = config.icon;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizes.gap,
        sizes.padding,
        sizes.text,
        config.colorClass,
        config.bgClass,
        className,
      )}
      aria-label={displayLabel}
    >
      <Icon className={sizes.icon} aria-hidden="true" />
      {showLabel && <span>{displayLabel}</span>}
    </span>
  );
}

/**
 * Minimal status indicator (icon only, no background)
 */
export function TransactionStatusIcon({
  status,
  size = 'md',
  className,
}: Omit<TransactionStatusProps, 'showLabel' | 'label'>) {
  const config = statusConfigs[status];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <Icon
      className={cn(sizes.icon, config.colorClass, className)}
      aria-label={config.label}
    />
  );
}
