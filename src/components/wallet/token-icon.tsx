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
 * 根据模板 URL 和 symbol 生成图标 URL
 * 
 * 模板格式：URL 中包含 $symbol 或 $SYMBOL 占位符
 * - $symbol: 替换为小写 symbol (如 bft)
 * - $SYMBOL: 替换为大写 symbol (如 BFT)
 * 
 * 例如：
 * - "../icons/bfmeta/tokens/$symbol.svg" -> "../icons/bfmeta/tokens/bft.svg"
 * - "https://cdn.example.com/icon-$SYMBOL.png" -> "https://cdn.example.com/icon-BFT.png"
 */
function buildIconUrl(template: string, symbol: string): string {
  return template
    .replace(/\$SYMBOL/g, symbol.toUpperCase())
    .replace(/\$symbol/g, symbol.toLowerCase());
}

/**
 * Token 图标组件
 * 
 * 加载策略：首字母常驻 + 图片叠加
 * - 首字母始终渲染作为底层
 * - 图片加载成功后叠加显示，隐藏首字母
 * - 避免加载过程中的闪烁
 * 
 * @example
 * // 手动指定图标
 * <TokenIcon symbol="BFM" imageUrl="/path/to/icon.svg" />
 * 
 * // 自动从 Provider 获取（需要 chainId，仅 BioForest 链）
 * <TokenIcon symbol="BFM" chainId="bfmeta" />
 * 
 * // 仅显示首字母
 * <TokenIcon symbol="UNKNOWN" />
 */
export function TokenIcon({ symbol, chainId, imageUrl, size = 'md', className }: TokenIconProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [baseIndex, setBaseIndex] = useState(0);
  const context = useTokenIconContext();
  
  // 当 props 变化时重置状态
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setBaseIndex(0);
  }, [symbol, chainId, imageUrl]);
  
  const label = symbol.toUpperCase();
  const firstLetter = label.charAt(0);
  
  // 确定图片 URL：优先使用 imageUrl prop，否则尝试从 Provider 获取
  let finalImageUrl: string | undefined = imageUrl ?? undefined;
  
  // 只有在没有 imageUrl 且有 chainId 时才使用 tokenIconBase
  if (!finalImageUrl && chainId) {
    const bases = context?.getTokenIconBases(chainId) ?? [];
    const currentBase = bases[baseIndex];
    if (currentBase && baseIndex >= 0 && baseIndex < bases.length) {
      finalImageUrl = buildIconUrl(currentBase, symbol);
    }
  }
  
  const handleImageError = () => {
    // 如果还有更多 base 可以尝试，继续尝试下一个
    if (chainId && !imageUrl) {
      const bases = context?.getTokenIconBases(chainId) ?? [];
      if (baseIndex < bases.length - 1) {
        setBaseIndex(baseIndex + 1);
        setImageLoaded(false);
        return;
      }
    }
    setImageError(true);
  };
  
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizeClasses[size],
        className,
      )}
      aria-label={label}
    >
      {/* 首字母始终渲染（底层） */}
      <span
        className={cn(
          'flex size-full items-center justify-center bg-muted font-bold text-muted-foreground transition-opacity',
          imageLoaded && 'opacity-0'
        )}
      >
        {firstLetter}
      </span>
      
      {/* 图片叠加（顶层），成功加载后显示 */}
      {finalImageUrl && !imageError && (
        <img
          src={finalImageUrl}
          alt={label}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
      )}
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
