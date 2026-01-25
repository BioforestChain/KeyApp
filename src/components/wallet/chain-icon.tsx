import { useState } from 'react';
import { cn } from '@/lib/utils';
import { chainConfigService } from '@/services/chain-config/service'

export type ChainType = string;

interface ChainIconProps {
  /** 链 ID，用于从 chainConfigService 获取图标和符号 */
  chainId?: ChainType | undefined;
  /** 图标 URL（优先使用，覆盖 service） */
  iconUrl?: string | undefined;
  /** 链符号，用于 fallback 显示 */
  symbol?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
  /** @deprecated 使用 chainId 代替 */
  chain?: ChainType | undefined;
}

const sizeClasses = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-10',
};

const textSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/**
 * 链图标组件
 * 
 * 优先级：iconUrl prop > chainConfigService > 首字母 fallback
 * 
 * @example
 * // 自动从 chainConfigService 获取图标
 * <ChainIcon chainId="ethereum" />
 * 
 * // 手动指定图标 URL
 * <ChainIcon chainId="ethereum" iconUrl="/custom-icon.svg" />
 */
export function ChainIcon({ chainId, iconUrl, symbol, size = 'md', className, chain }: ChainIconProps) {
  const [imgError, setImgError] = useState(false);
  
  // 兼容旧的 chain prop
  const resolvedChainId = chainId ?? chain;
  
  // 从 service 获取图标和符号
  const serviceIcon = resolvedChainId ? chainConfigService.getIcon(resolvedChainId) : null;
  const serviceSymbol = resolvedChainId ? chainConfigService.getSymbol(resolvedChainId) : '';
  
  const resolvedIconUrl = iconUrl ?? serviceIcon;
  const label = symbol ?? serviceSymbol ?? resolvedChainId?.slice(0, 4).toUpperCase() ?? '?';
  
  // 有图标 URL 且未加载失败时，使用图片
  if (resolvedIconUrl && !imgError) {
    return (
      <img
        src={resolvedIconUrl}
        alt={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={() => setImgError(true)}
      />
    );
  }
  
  // Fallback: 首字母 + 背景色
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold',
        'bg-muted text-muted-foreground',
        sizeClasses[size],
        textSizeClasses[size],
        className,
      )}
      title={label}
      aria-label={label}
    >
      {label.charAt(0)}
    </div>
  );
}

interface ChainBadgeProps {
  chainId?: ChainType | undefined;
  iconUrl?: string | undefined;
  symbol?: string | undefined;
  className?: string | undefined;
  /** @deprecated 使用 chainId 代替 */
  chain?: ChainType | undefined;
}

/**
 * 链徽章组件 - 显示链图标和名称
 * 
 * @example
 * <ChainBadge chainId="bfmeta" />  // 显示 BFMeta 图标和名称
 */
export function ChainBadge({ chainId, iconUrl, symbol, className, chain }: ChainBadgeProps) {
  const resolvedChainId = chainId ?? chain ?? '';
  
  // 使用 chainConfigService 获取完整链名
  const label = symbol ?? (resolvedChainId ? chainConfigService.getName(resolvedChainId) : resolvedChainId);
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <ChainIcon chainId={resolvedChainId} iconUrl={iconUrl} size="sm" className="size-4" />
      {label}
    </span>
  );
}
