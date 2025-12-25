import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * TokenIcon Context - 提供 chainId -> tokenIconBase[] 的映射
 */
interface TokenIconContextValue {
  getTokenIconBases: (chainId: string) => string[];
}

const TokenIconContext = createContext<TokenIconContextValue | null>(null);

interface TokenIconProviderProps {
  /** 
   * 获取 token 图标基础路径数组的函数
   * 返回 [本地路径, CDN, GitHub] 等多层 fallback
   */
  getTokenIconBases: (chainId: string) => string[];
  children: ReactNode;
}

/**
 * TokenIcon Provider
 * 
 * 在应用根部注入，提供 chainId -> tokenIconBase[] 的自动解析
 * 支持多层 fallback：本地 → CDN → GitHub
 * 
 * @example
 * const { configs } = useChainConfig();
 * 
 * <TokenIconProvider 
 *   getTokenIconBases={(chainId) => 
 *     configs.find(c => c.id === chainId)?.tokenIconBase ?? []
 *   }
 * >
 *   <App />
 * </TokenIconProvider>
 */
export function TokenIconProvider({ getTokenIconBases, children }: TokenIconProviderProps) {
  return (
    <TokenIconContext.Provider value={{ getTokenIconBases }}>
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
  /** 所属链 ID（用于获取 tokenIconBase） */
  chainId?: string | undefined;
  /** 图标 URL（优先使用，覆盖所有 fallback） */
  iconUrl?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

/**
 * 根据 base 路径和 symbol 生成图标 URL
 * 本地: {base}/{symbol}.svg
 * 远程: {base}/icon-{symbol}.png
 */
function buildIconUrl(base: string, symbol: string): string {
  const lowerSymbol = symbol.toLowerCase();
  if (base.startsWith('/') || base.startsWith('./')) {
    // 本地路径
    return `${base}/${lowerSymbol}.svg`;
  }
  // 远程路径 (CDN/GitHub)
  return `${base}/icon-${lowerSymbol}.png`;
}

/**
 * Token 图标组件
 * 
 * 图标加载优先级（基于 tokenIconBase 配置）：
 * 1. iconUrl prop（手动指定）
 * 2. tokenIconBase[0] 本地路径
 * 3. tokenIconBase[1] CDN
 * 4. tokenIconBase[2] GitHub Raw
 * 5. 代码生成的样式（首字母 + 背景色）
 * 
 * @example
 * // 自动加载，支持多层 fallback
 * <TokenIcon symbol="ETH" chainId="ethereum" />
 * 
 * // 手动指定图标 URL
 * <TokenIcon symbol="BFM" iconUrl="/custom-icon.svg" />
 */
export function TokenIcon({ symbol, chainId, iconUrl, size = 'md', className }: TokenIconProps) {
  const [urlIndex, setUrlIndex] = useState(0);
  const [manualError, setManualError] = useState(false);
  const context = useTokenIconContext();
  
  // 当 symbol/chainId 变化时重置状态
  useEffect(() => {
    setUrlIndex(0);
    setManualError(false);
  }, [symbol, chainId]);
  
  const label = symbol.toUpperCase();
  
  // 如果有手动指定的 iconUrl，直接使用
  if (iconUrl && !manualError) {
    return (
      <img
        src={iconUrl}
        alt={label}
        aria-label={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={() => setManualError(true)}
      />
    );
  }
  
  // 获取 tokenIconBase 数组
  const bases = chainId ? context?.getTokenIconBases(chainId) ?? [] : [];
  const currentBase = bases[urlIndex];
  const currentUrl = currentBase ? buildIconUrl(currentBase, symbol) : undefined;
  
  const handleError = () => {
    if (urlIndex < bases.length - 1) {
      // 尝试下一个 base
      setUrlIndex(urlIndex + 1);
    } else {
      // 所有都失败，使用字母 fallback
      setUrlIndex(-1);
    }
  };
  
  // 有图标 URL 时，使用图片
  if (currentUrl && urlIndex >= 0) {
    return (
      <img
        src={currentUrl}
        alt={label}
        aria-label={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={handleError}
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
  chainId?: string | undefined;
  iconUrl?: string | undefined;
  className?: string | undefined;
}

export function TokenBadge({ symbol, chainId, iconUrl, className }: TokenBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <TokenIcon symbol={symbol} chainId={chainId} iconUrl={iconUrl} size="sm" className="size-4" />
      {symbol.toUpperCase()}
    </span>
  );
}
