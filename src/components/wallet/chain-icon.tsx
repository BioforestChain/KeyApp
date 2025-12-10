import { cn } from '@/lib/utils';

// 支持的链类型 - 与 stores/wallet.ts 中的 ChainType 对应
export type ChainType = 
  // 外部链 (BIP44)
  | 'ethereum' 
  | 'tron' 
  | 'bitcoin' 
  | 'binance'
  | 'bsc' // binance alias
  // BioForest 链 (Ed25519)  
  | 'bfmeta'
  | 'ccchain'
  | 'pmchain'
  | 'bfchainv2'
  | 'btgmeta'
  | 'biwmeta'
  | 'ethmeta'
  | 'malibu'
  // Legacy aliases
  | 'ccc';

interface ChainIconProps {
  chain: ChainType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const chainColors: Record<ChainType, string> = {
  // 外部链
  ethereum: 'bg-chain-ethereum',
  tron: 'bg-chain-tron',
  bitcoin: 'bg-chain-bitcoin',
  binance: 'bg-chain-binance',
  bsc: 'bg-chain-binance',
  // BioForest 链
  bfmeta: 'bg-chain-bfmeta',
  ccchain: 'bg-emerald-500',
  pmchain: 'bg-violet-500',
  bfchainv2: 'bg-chain-bfmeta',
  btgmeta: 'bg-amber-500',
  biwmeta: 'bg-cyan-500',
  ethmeta: 'bg-indigo-500',
  malibu: 'bg-pink-500',
  // Legacy
  ccc: 'bg-emerald-500',
};

const chainLabels: Record<ChainType, string> = {
  // 外部链
  ethereum: 'ETH',
  tron: 'TRX',
  bitcoin: 'BTC',
  binance: 'BNB',
  bsc: 'BNB',
  // BioForest 链
  bfmeta: 'BFT',
  ccchain: 'CC',
  pmchain: 'PM',
  bfchainv2: 'BFT',
  btgmeta: 'BTG',
  biwmeta: 'BIW',
  ethmeta: 'ETM',
  malibu: 'MLB',
  // Legacy
  ccc: 'CC',
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
