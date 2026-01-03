/**
 * Source Icon Component
 *
 * 订阅源图标组件
 * - 有自定义图标时显示图标
 * - 没有图标时显示 HTTPS 锁图标（表示安全来源）
 */

import { forwardRef } from 'react';
import { IconLock } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface SourceIconProps {
  /** 图标 URL */
  src?: string | null;
  /** 订阅源名称 */
  name?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

const SIZES = {
  sm: { icon: 24, lock: 14 },
  md: { icon: 32, lock: 18 },
  lg: { icon: 40, lock: 22 },
};

export const SourceIcon = forwardRef<HTMLDivElement, SourceIconProps>(function SourceIcon(
  { src, name = 'Source', size = 'md', className },
  ref,
) {
  const { icon: iconSize, lock: lockSize } = SIZES[size];
  const radius = Math.round(iconSize * 0.22);

  // 有自定义图标
  if (src) {
    return (
      <div
        ref={ref}
        className={cn('bg-muted shrink-0 overflow-hidden', 'ring-border/50 ring-1', className)}
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: radius,
        }}
      >
        <img src={src} alt={name} className="size-full object-cover" draggable={false} />
      </div>
    );
  }

  // 默认 HTTPS 锁图标
  return (
    <div
      ref={ref}
      className={cn(
        'flex shrink-0 items-center justify-center',
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        'ring-1 ring-emerald-500/20',
        className,
      )}
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: radius,
      }}
    >
      <IconLock size={lockSize} stroke={2} />
    </div>
  );
});
