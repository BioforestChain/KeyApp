import { useState, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 默认的 CDN fallback URL 模板
 * {chainId} 和 {symbol} 会被替换
 */
const DEFAULT_CDN_URL_TEMPLATE = 
  'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/{chainId}/icon-{symbol}.png';

/**
 * TokenIcon Context - 提供 (chainId, symbol) -> iconUrl 的映射
 */
interface TokenIconContextValue {
  getLocalUrl: (symbol: string, chainId?: string) => string | undefined;
  getFallbackUrl: (symbol: string, chainId?: string) => string | undefined;
}

const TokenIconContext = createContext<TokenIconContextValue | null>(null);

interface TokenIconProviderProps {
  /** 
   * 图标基础路径（默认 /icons）
   * 本地路径格式: {basePath}/{chainId}/tokens/{symbol}.svg
   */
  basePath?: string | undefined;
  /** 
   * CDN fallback URL 模板
   * 支持占位符：{chainId}, {symbol}
   * 默认: https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/{chainId}/icon-{symbol}.png
   */
  fallbackUrlTemplate?: string | undefined;
  children: ReactNode;
}

/**
 * TokenIcon Provider
 * 
 * 在应用根部注入，提供 symbol -> iconUrl 的自动解析
 * 
 * 图标加载优先级：
 * 1. iconUrl prop（手动指定）
 * 2. 本地路径 `/icons/{chainId}/tokens/{symbol}.svg`
 * 3. CDN fallback `https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/{chainId}/icon-{symbol}.png`
 * 4. 代码生成的样式（首字母 + 背景色）
 * 
 * @example
 * // 使用默认配置
 * <TokenIconProvider>
 *   <App />
 * </TokenIconProvider>
 * 
 * // 自定义路径和 fallback
 * <TokenIconProvider 
 *   basePath="/assets"
 *   fallbackUrlTemplate="https://cdn.example.com/{chainId}/{symbol}.png"
 * >
 *   <App />
 * </TokenIconProvider>
 */
export function TokenIconProvider({ 
  basePath = '/icons',
  fallbackUrlTemplate = DEFAULT_CDN_URL_TEMPLATE,
  children 
}: TokenIconProviderProps) {
  // 本地路径: /icons/{chainId}/tokens/{symbol}.svg
  const getLocalUrl = (symbol: string, chainId?: string) => {
    if (!chainId) return undefined;
    return `${basePath}/${chainId.toLowerCase()}/tokens/${symbol.toLowerCase()}.svg`;
  };

  const getFallbackUrl = (symbol: string, chainId?: string) => {
    if (!chainId) return undefined;
    return fallbackUrlTemplate
      .replace('{chainId}', chainId.toLowerCase())
      .replace('{symbol}', symbol.toLowerCase());
  };

  return (
    <TokenIconContext.Provider value={{ getLocalUrl, getFallbackUrl }}>
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

type FallbackState = 'local' | 'cdn' | 'letter';

interface TokenIconProps {
  /** Token symbol (如 ETH, BFM, USDT) */
  symbol: string;
  /** 所属链 ID（用于 CDN fallback） */
  chainId?: string | undefined;
  /** 图标 URL（优先使用，覆盖所有 fallback） */
  iconUrl?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

/**
 * Token 图标组件
 * 
 * 图标加载优先级：
 * 1. iconUrl prop（手动指定）
 * 2. 本地路径 `/icons/tokens/{symbol}.svg`
 * 3. CDN fallback（需要 chainId）
 * 4. 代码生成的样式（首字母 + 背景色）
 * 
 * @example
 * // 自动加载，支持 CDN fallback
 * <TokenIcon symbol="ETH" chainId="ethereum" />
 * 
 * // 仅本地（无 CDN fallback）
 * <TokenIcon symbol="USDT" />
 * 
 * // 手动指定图标 URL
 * <TokenIcon symbol="BFM" iconUrl="/custom-icon.svg" />
 */
export function TokenIcon({ symbol, chainId, iconUrl, size = 'md', className }: TokenIconProps) {
  const [fallbackState, setFallbackState] = useState<FallbackState>('local');
  const context = useTokenIconContext();
  
  const label = symbol.toUpperCase();
  
  // 如果有手动指定的 iconUrl，直接使用
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={label}
        aria-label={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={() => setFallbackState('letter')}
      />
    );
  }
  
  // 根据 fallback 状态决定 URL
  const getUrl = (): string | undefined => {
    if (!context || !chainId) return undefined;
    
    switch (fallbackState) {
      case 'local':
        return context.getLocalUrl(symbol, chainId);
      case 'cdn':
        return context.getFallbackUrl(symbol, chainId);
      default:
        return undefined;
    }
  };
  
  const handleError = () => {
    if (fallbackState === 'local') {
      // 本地失败，尝试 CDN
      setFallbackState('cdn');
    } else {
      // CDN 也失败，使用字母
      setFallbackState('letter');
    }
  };
  
  const currentUrl = getUrl();
  
  // 有图标 URL 时，使用图片
  if (currentUrl && fallbackState !== 'letter') {
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
