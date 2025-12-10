import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ChainIcon, type ChainType } from './chain-icon';

export interface ChainAddress {
  /** Address string */
  address: string;
  /** Balance display string */
  balance?: string;
  /** Whether this is the default address */
  isDefault?: boolean;
}

export interface ChainData {
  /** Chain type for icon rendering */
  chain: ChainType;
  /** Display name */
  name: string;
  /** Addresses on this chain */
  addresses: ChainAddress[];
}

interface ChainAddressSelectorProps {
  /** List of chains with addresses */
  chains: ChainData[];
  /** Selected chain type */
  selectedChain?: ChainType;
  /** Selected address */
  selectedAddress?: string;
  /** Callback when address is selected */
  onSelect?: (chain: ChainType, address: string) => void;
  /** Additional class names */
  className?: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

interface ChainItemProps {
  chain: ChainData;
  isSelected: boolean;
  onSelect: () => void;
}

function ChainItem({ chain, isSelected, onSelect }: ChainItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'bg-muted',
      )}
      aria-selected={isSelected}
      role="option"
    >
      <ChainIcon chain={chain.chain} size="sm" />
      <span className={cn('text-sm', isSelected && 'font-medium')}>{chain.name}</span>
    </button>
  );
}

interface AddressItemProps {
  address: ChainAddress;
  isSelected: boolean;
  onSelect: () => void;
}

function AddressItem({ address, isSelected, onSelect }: AddressItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'bg-primary/10',
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm">{truncateAddress(address.address)}</span>
          {address.isDefault && (
            <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
              默认
            </span>
          )}
        </div>
        {address.balance && (
          <p className="text-xs text-muted-foreground">{address.balance}</p>
        )}
      </div>
      {isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
    </button>
  );
}

/**
 * Two-column chain and address selector
 */
export function ChainAddressSelector({
  chains,
  selectedChain,
  selectedAddress,
  onSelect,
  className,
}: ChainAddressSelectorProps) {
  const [activeChain, setActiveChain] = useState<ChainType>(
    selectedChain ?? chains[0]?.chain ?? 'ethereum',
  );

  const activeChainData = useMemo(
    () => chains.find((c) => c.chain === activeChain),
    [chains, activeChain],
  );

  const handleChainSelect = useCallback((chain: ChainType) => {
    setActiveChain(chain);
  }, []);

  const handleAddressSelect = useCallback(
    (address: string) => {
      onSelect?.(activeChain, address);
    },
    [activeChain, onSelect],
  );

  if (chains.length === 0) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        <p>暂无可用链</p>
      </div>
    );
  }

  return (
    <div className={cn('flex min-h-48 overflow-hidden rounded-lg border border-border', className)}>
      {/* Chain list (left) */}
      <div
        className="w-28 shrink-0 space-y-0.5 overflow-y-auto border-r border-border bg-muted/30 p-2"
        role="listbox"
        aria-label="Select chain"
      >
        {chains.map((chain) => (
          <ChainItem
            key={chain.chain}
            chain={chain}
            isSelected={chain.chain === activeChain}
            onSelect={() => handleChainSelect(chain.chain)}
          />
        ))}
      </div>

      {/* Address list (right) */}
      <div
        className="min-w-0 flex-1 space-y-0.5 overflow-y-auto p-2"
        role="listbox"
        aria-label="Select address"
      >
        {activeChainData?.addresses.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            该链暂无地址
          </div>
        )}
        {activeChainData?.addresses.map((addr) => (
          <AddressItem
            key={addr.address}
            address={addr}
            isSelected={addr.address === selectedAddress}
            onSelect={() => handleAddressSelect(addr.address)}
          />
        ))}
      </div>
    </div>
  );
}
