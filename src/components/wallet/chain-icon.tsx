import { useState } from 'react';
import { cn } from '@/lib/utils';

export type ChainType = string;

interface ChainIconProps {
  /** 链 ID，用于 fallback 显示 */
  chainId?: ChainType | undefined;
  /** 图标 URL（优先使用） */
  iconUrl?: string | undefined;
  /** 链符号，用于 fallback 显示 */
  symbol?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
  /** @deprecated 使用 chainId 代替 */
  chain?: ChainType | undefined;
}

const chainColors: Record<string, string> = {
  ethereum: 'bg-chain-ethereum',
  tron: 'bg-chain-tron',
  bitcoin: 'bg-chain-bitcoin',
  binance: 'bg-chain-binance',
  bsc: 'bg-chain-binance',
  bfmeta: 'bg-chain-bfmeta',
  ccchain: 'bg-emerald-500',
  pmchain: 'bg-violet-500',
  bfchainv2: 'bg-chain-bfmeta',
  btgmeta: 'bg-amber-500',
  biwmeta: 'bg-cyan-500',
  ethmeta: 'bg-indigo-500',
  malibu: 'bg-pink-500',
  ccc: 'bg-emerald-500',
};

const chainLabels: Record<string, string> = {
  ethereum: 'ETH',
  tron: 'TRX',
  bitcoin: 'BTC',
  binance: 'BNB',
  bsc: 'BNB',
  bfmeta: 'BFM',
  ccchain: 'CCC',
  pmchain: 'PMC',
  bfchainv2: 'BFT',
  btgmeta: 'BTGM',
  biwmeta: 'BIW',
  ethmeta: 'ETHM',
  malibu: 'MLB',
  ccc: 'CCC',
};

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

function toFallbackLabel(chainId?: string, symbol?: string): string {
  if (symbol) return symbol.slice(0, 4).toUpperCase();
  if (chainId) {
    const label = chainLabels[chainId];
    if (label) return label;
    return chainId.slice(0, 4).toUpperCase();
  }
  return '?';
}

/**
 * 链图标组件
 * 
 * 优先使用 iconUrl 显示 SVG 图标，fallback 到首字母 + 背景色
 * 
 * @example
 * // 使用图标 URL（推荐，从 chain-config service 获取）
 * <ChainIcon iconUrl={chainConfig.icon} chainId={chainConfig.id} />
 * 
 * // 仅使用 chainId（fallback 模式）
 * <ChainIcon chainId="ethereum" />
 */
export function ChainIcon({ chainId, iconUrl, symbol, size = 'md', className, chain }: ChainIconProps) {
  const [imgError, setImgError] = useState(false);
  
  // 兼容旧的 chain prop
  const resolvedChainId = chainId ?? chain;
  const label = toFallbackLabel(resolvedChainId, symbol);
  
  // 有图标 URL 且未加载失败时，使用图片
  if (iconUrl && !imgError) {
    return (
      <img
        src={iconUrl}
        alt={label}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
        onError={() => setImgError(true)}
      />
    );
  }
  
  // Fallback: 首字母 + 背景色
  const bgColor = resolvedChainId ? chainColors[resolvedChainId] : undefined;
  const isKnown = resolvedChainId ? resolvedChainId in chainColors : false;
  
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold',
        bgColor ?? 'bg-muted',
        isKnown ? 'text-white' : 'text-muted-foreground',
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

export function ChainBadge({ chainId, iconUrl, symbol, className, chain }: ChainBadgeProps) {
  const resolvedChainId = chainId ?? chain ?? '';
  const label = symbol ?? chainLabels[resolvedChainId] ?? resolvedChainId;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <ChainIcon chainId={resolvedChainId} iconUrl={iconUrl} symbol={symbol} size="sm" className="size-4" />
      {label}
    </span>
  );
}
