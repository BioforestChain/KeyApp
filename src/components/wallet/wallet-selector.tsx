import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { WalletInfo } from './wallet-card';

interface WalletSelectorProps {
  /** List of available wallets */
  wallets: WalletInfo[];
  /** Currently selected wallet ID */
  selectedId?: string;
  /** Callback when wallet is selected */
  onSelect?: (wallet: WalletInfo) => void;
  /** Callback when selector is closed */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface WalletItemProps {
  wallet: WalletInfo;
  isSelected: boolean;
  onSelect: () => void;
}

function WalletItem({ wallet, isSelected, onSelect }: WalletItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'bg-muted',
      )}
      aria-selected={isSelected}
      role="option"
    >
      {/* Avatar */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {wallet.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{wallet.name}</span>
          {!wallet.isBackedUp && (
            <span className="shrink-0 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
              未备份
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{truncateAddress(wallet.address)}</span>
          <span>•</span>
          <span className="truncate">{wallet.balance}</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />}
    </button>
  );
}

/**
 * Wallet selector component for switching between multiple wallets
 */
export function WalletSelector({
  wallets,
  selectedId,
  onSelect,
  onClose,
  className,
}: WalletSelectorProps) {
  const handleSelect = (wallet: WalletInfo) => {
    onSelect?.(wallet);
    onClose?.();
  };

  if (wallets.length === 0) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        <p>暂无钱包</p>
        <p className="mt-1 text-sm">请先创建或导入钱包</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)} role="listbox" aria-label="Select wallet">
      {wallets.map((wallet) => (
        <WalletItem
          key={wallet.id}
          wallet={wallet}
          isSelected={wallet.id === selectedId}
          onSelect={() => handleSelect(wallet)}
        />
      ))}
    </div>
  );
}
