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
  getTokenIconBases: (chainId: string) => string[];
  children: ReactNode;
}

/**
 * TokenIcon Provider - 可选，用于自动解析 token 图标
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
  xs: 'aspect-square w-4 text-[8px]',
  sm: 'aspect-square w-6 text-[10px]',
  md: 'aspect-square w-8 text-xs',
  lg: 'aspect-square w-10 @xs:w-12 text-sm',
} as const;

export interface TokenIconProps {
  /** Token symbol (如 ETH, BFM, USDT) */
  symbol: string;
  /** 所属链 ID（用于从 Provider 获取图标） */
  chainId?: string | undefined;
  /** 图标 URL（最高优先级，覆盖所有 fallback） */
  imageUrl?: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

/**
 * 检查 URL 是否是同源的（本地资源）
 */
function isSameOrigin(url: string): boolean {
  // 相对路径视为同源
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true
  }
  // 检查是否与当前页面同源
  try {
    const urlObj = new URL(url)
    return urlObj.origin === window.location.origin
  } catch {
    return true // 解析失败视为相对路径
  }
}

/**
 * 根据 base 路径和 symbol 生成图标 URL
 * - 本地资源（同源）：使用 {symbol}.svg 格式
 * - CDN 资源（跨域）：使用 icon-{symbol}.png 格式
 */
function buildIconUrl(base: string, symbol: string): string {
  const lowerSymbol = symbol.toLowerCase();
  if (isSameOrigin(base)) {
    return `${base}/${lowerSymbol}.svg`;
  }
  return `${base}/icon-${lowerSymbol}.png`;
}

/**
 * Token 图标组件
 * 
 * 加载优先级：
 * 1. imageUrl prop（手动指定）
 * 2. TokenIconProvider + chainId（多层 fallback）
 * 3. 首字母 fallback
 * 
 * @example
 * // 手动指定图标
 * <TokenIcon symbol="BFM" imageUrl="/path/to/icon.svg" />
 * 
 * // 自动从 Provider 获取（需要 chainId）
 * <TokenIcon symbol="BFM" chainId="bfmeta" />
 * 
 * // 仅显示首字母
 * <TokenIcon symbol="UNKNOWN" />
 */
export function TokenIcon({ symbol, chainId, imageUrl, size = 'md', className }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);
  const [baseIndex, setBaseIndex] = useState(0);
  const context = useTokenIconContext();
  
  // 当 props 变化时重置状态
  useEffect(() => {
    setImageError(false);
    setBaseIndex(0);
  }, [symbol, chainId, imageUrl]);
  
  const label = symbol.toUpperCase();
  const firstLetter = label.charAt(0);
  
  // 优先级 1: imageUrl prop
  if (imageUrl && !imageError) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          sizeClasses[size],
          className,
        )}
        aria-label={label}
      >
        <img
          src={imageUrl}
          alt={label}
          className="size-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
  
  // 优先级 2: Provider + chainId
  const bases = chainId ? context?.getTokenIconBases(chainId) ?? [] : [];
  const currentBase = bases[baseIndex];
  const providerUrl = currentBase ? buildIconUrl(currentBase, symbol) : undefined;
  
  if (providerUrl && baseIndex >= 0 && baseIndex < bases.length) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          sizeClasses[size],
          className,
        )}
        aria-label={label}
      >
        <img
          src={providerUrl}
          alt={label}
          className="size-full object-cover"
          onError={() => {
            if (baseIndex < bases.length - 1) {
              setBaseIndex(baseIndex + 1);
            } else {
              setBaseIndex(-1); // 触发 fallback
            }
          }}
        />
      </div>
    );
  }
  
  // 优先级 3: 首字母 fallback
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-muted font-bold text-muted-foreground',
        sizeClasses[size],
        className,
      )}
      aria-label={label}
    >
      {firstLetter}
    </div>
  );
}

interface TokenBadgeProps {
  symbol: string;
  chainId?: string | undefined;
  imageUrl?: string | null | undefined;
  className?: string | undefined;
}

export function TokenBadge({ symbol, chainId, imageUrl, className }: TokenBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <TokenIcon symbol={symbol} chainId={chainId} imageUrl={imageUrl} size="sm" className="size-4" />
      {symbol.toUpperCase()}
    </span>
  );
}
