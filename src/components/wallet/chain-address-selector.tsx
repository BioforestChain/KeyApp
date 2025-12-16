import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { IconCheck as Check } from '@tabler/icons-react';
import { ChainIcon, type ChainType } from './chain-icon';

export interface ChainAddress {
  /** Address string */
  address: string;
  /** Balance display string */
  balance?: string | undefined;
  /** Whether this is the default address */
  isDefault?: boolean | undefined;
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
  selectedChain?: ChainType | undefined;
  /** Selected address */
  selectedAddress?: string | undefined;
  /** Callback when address is selected */
  onSelect?: ((chain: ChainType, address: string) => void) | undefined;
  /** Additional class names */
  className?: string | undefined;
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
        'hover:bg-muted/50 focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
        isSelected && 'bg-muted',
      )}
      aria-selected={isSelected}
      role="option"
    >
      <ChainIcon chain={chain.chain} size="sm" />
      <span className={cn('truncate text-sm', isSelected && 'font-medium')}>{chain.name}</span>
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
        'hover:bg-muted/50 focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
        isSelected && 'bg-primary/10',
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm">{truncateAddress(address.address)}</span>
          {address.isDefault && (
            <span className="bg-muted text-muted-foreground shrink-0 rounded px-1 py-0.5 text-[10px]">默认</span>
          )}
        </div>
        {address.balance && <p className="text-muted-foreground text-xs">{address.balance}</p>}
      </div>
      {isSelected && <Check className="text-primary size-4 shrink-0" aria-hidden="true" />}
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
  const [activeChain, setActiveChain] = useState<ChainType>(selectedChain ?? chains[0]?.chain ?? 'ethereum');

  const activeChainData = useMemo(() => chains.find((c) => c.chain === activeChain), [chains, activeChain]);

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
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        <p>暂无可用链</p>
      </div>
    );
  }

  return (
    <div className={cn('border-border flex min-h-48 overflow-hidden rounded-lg border', className)}>
      {/* Chain list (left) */}
      <div
        className="border-border bg-muted/30 w-28 shrink-0 space-y-0.5 overflow-y-auto border-r p-2"
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
      <div className="min-w-0 flex-1 space-y-0.5 overflow-y-auto p-2" role="listbox" aria-label="Select address">
        {activeChainData?.addresses.length === 0 && (
          <div className="text-muted-foreground py-6 text-center text-sm">该链暂无地址</div>
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
