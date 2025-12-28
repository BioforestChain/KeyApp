import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconCheck as Check } from '@tabler/icons-react';
import type { WalletInfo } from './index';
import { WalletMiniCard } from './wallet-mini-card';

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
  notBackedUpLabel: string;
}

function WalletItem({ wallet, isSelected, onSelect, notBackedUpLabel }: WalletItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
        'hover:bg-muted/50 focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
        isSelected && 'bg-muted',
      )}
      aria-selected={isSelected}
      role="option"
    >
      {/* 钱包小卡片 */}
      <WalletMiniCard
        themeHue={wallet.themeHue ?? 323}
        size="md"
        watermarkIconUrl={wallet.chainIconUrl}
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{wallet.name}</span>
          {!wallet.isBackedUp && (
            <span className="bg-warning/20 text-warning shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
              {notBackedUpLabel}
            </span>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="font-mono">{truncateAddress(wallet.address)}</span>
          <span>•</span>
          <span className="truncate">{wallet.balance}</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && <Check className="text-primary size-5 shrink-0" aria-hidden="true" />}
    </button>
  );
}

/**
 * Wallet selector component for switching between multiple wallets
 */
export function WalletSelector({ wallets, selectedId, onSelect, onClose, className }: WalletSelectorProps) {
  const { t } = useTranslation(['common', 'wallet']);

  const handleSelect = (wallet: WalletInfo) => {
    onSelect?.(wallet);
    onClose?.();
  };

  if (wallets.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        <p>{t('wallet:empty')}</p>
        <p className="mt-1 text-sm">{t('wallet:emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)} role="listbox" aria-label={t('a11y.selectWallet')}>
      {wallets.map((wallet) => (
        <WalletItem
          key={wallet.id}
          wallet={wallet}
          isSelected={wallet.id === selectedId}
          onSelect={() => handleSelect(wallet)}
          notBackedUpLabel={t('notBackedUp')}
        />
      ))}
    </div>
  );
}
