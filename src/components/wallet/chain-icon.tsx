import { cn } from '@/lib/utils';

export type ChainType = 'ethereum' | 'tron' | 'bsc' | 'bitcoin' | 'bfmeta' | 'btgmeta' | 'ethmeta' | 'ccc';

interface ChainIconProps {
  chain: ChainType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const chainColors: Record<ChainType, string> = {
  ethereum: 'bg-chain-ethereum',
  tron: 'bg-chain-tron',
  bsc: 'bg-chain-binance',
  bitcoin: 'bg-chain-bitcoin',
  bfmeta: 'bg-chain-bfmeta',
  btgmeta: 'bg-chain-bfmeta',
  ethmeta: 'bg-chain-ethereum',
  ccc: 'bg-chain-bfmeta',
};

const chainLabels: Record<ChainType, string> = {
  ethereum: 'ETH',
  tron: 'TRX',
  bsc: 'BNB',
  bitcoin: 'BTC',
  bfmeta: 'BFM',
  btgmeta: 'BTGM',
  ethmeta: 'ETHM',
  ccc: 'CCC',
};

const sizeClasses = {
  sm: 'w-6 aspect-square text-[10px]',
  md: 'w-8 aspect-square text-xs',
  lg: 'w-10 aspect-square text-sm',
};

export function ChainIcon({ chain, size = 'md', className }: ChainIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold text-white',
        chainColors[chain],
        sizeClasses[size],
        className,
      )}
      title={chainLabels[chain]}
      aria-label={chainLabels[chain]}
    >
      {chainLabels[chain].charAt(0)}
    </div>
  );
}

export function ChainBadge({ chain, className }: { chain: ChainType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 ps-0.5 text-xs font-medium',
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      <ChainIcon chain={chain} size="sm" className="size-4 text-[8px]" />
      {chainLabels[chain]}
    </span>
  );
}
