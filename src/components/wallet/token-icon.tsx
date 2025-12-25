import { useState, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * TokenIcon Context - 提供 symbol -> iconUrl 的映射
 */
interface TokenIconContextValue {
  getIconUrl: (symbol: string) => string | undefined;
}

const TokenIconContext = createContext<TokenIconContextValue | null>(null);

interface TokenIconProviderProps {
  /** 
   * 获取 token 图标 URL 的函数
   * 默认实现：`/icons/tokens/${symbol.toLowerCase()}.svg`
   */
  getIconUrl?: ((symbol: string) => string | undefined) | undefined;
  /** Token 图标基础路径（默认 /icons/tokens） */
  basePath?: string | undefined;
  children: ReactNode;
}

/**
 * TokenIcon Provider
 * 
 * 在应用根部注入，提供 symbol -> iconUrl 的自动解析
 * 
 * @example
 * // 使用默认路径
 * <TokenIconProvider>
 *   <App />
 * </TokenIconProvider>
 * 
 * // 自定义路径
 * <TokenIconProvider basePath="/assets/tokens">
 *   <App />
 * </TokenIconProvider>
 * 
 * // 完全自定义
 * <TokenIconProvider getIconUrl={(symbol) => tokenMap[symbol]}>
 *   <App />
 * </TokenIconProvider>
 */
export function TokenIconProvider({ 
  getIconUrl: customGetIconUrl, 
  basePath = '/icons/tokens',
  children 
}: TokenIconProviderProps) {
  const getIconUrl = customGetIconUrl ?? ((symbol: string) => 
    `${basePath}/${symbol.toLowerCase()}.svg`
  );

  return (
    <TokenIconContext.Provider value={{ getIconUrl }}>
      {children}
    </TokenIconContext.Provider>
  );
}

function useTokenIconContext() {
  return useContext(TokenIconContext);
}

const sizeClasses = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-10',
} as const;

interface TokenIconProps {
  /** Token symbol (如 ETH, BFM, USDT) */
  symbol: string;
  /** 图标 URL（优先使用，覆盖 context） */
  iconUrl?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

/**
 * Token 图标组件
 * 
 * 优先级：iconUrl prop > context > fallback（首字母）
 * 
 * @example
 * // 自动从 context 获取图标（需要 TokenIconProvider）
 * <TokenIcon symbol="ETH" />
 * <TokenIcon symbol="USDT" size="lg" />
 * 
 * // 手动指定图标 URL
 * <TokenIcon symbol="BFM" iconUrl="/custom-icon.svg" />
 */
export function TokenIcon({ symbol, iconUrl, size = 'md', className }: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const context = useTokenIconContext();
  
  const label = symbol.toUpperCase();
  
  // 解析图标 URL：prop 优先，否则从 context 获取
  const resolvedIconUrl = iconUrl ?? context?.getIconUrl(symbol);
  
  // 有图标 URL 且未加载失败时，使用图片
  if (resolvedIconUrl && !imgError) {
    return (
      <img
        src={resolvedIconUrl}
        alt={label}
        aria-label={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={() => setImgError(true)}
      />
    );
  }
  
  // Fallback: 首字母 + 灰色背景
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
        sizeClasses[size],
        size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-base',
        className,
      )}
    >
      {label.charAt(0)}
    </div>
  );
}

interface TokenBadgeProps {
  symbol: string;
  iconUrl?: string | undefined;
  className?: string | undefined;
}

export function TokenBadge({ symbol, iconUrl, className }: TokenBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <TokenIcon symbol={symbol} iconUrl={iconUrl} size="sm" className="size-4" />
      {symbol.toUpperCase()}
    </span>
  );
}
