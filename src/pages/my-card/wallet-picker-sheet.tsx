/**
 * WalletPickerSheet - 钱包选择器底部弹窗
 * 
 * 用于在我的名片中选择要显示的钱包（最多3个）
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { IconCheck as Check } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
    useWallets,
    useChainPreferences,
    useSelectedWalletIds,
    useCanAddMoreWallets,
    useChainNameMap,
    userProfileActions,
} from '@/stores';

interface WalletPickerSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WalletPickerSheet({ open, onOpenChange }: WalletPickerSheetProps) {
    const { t } = useTranslation('common');
    const wallets = useWallets();
    const chainPreferences = useChainPreferences();
    const selectedWalletIds = useSelectedWalletIds();
    const canAddMore = useCanAddMoreWallets();
    const chainNameMap = useChainNameMap();

    const handleWalletToggle = useCallback((walletId: string) => {
        const isSelected = selectedWalletIds.includes(walletId);

        // If not selected and can't add more, don't do anything
        if (!isSelected && !canAddMore) return;

        userProfileActions.toggleWalletSelection(walletId);
    }, [selectedWalletIds, canAddMore]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader className="pb-4">
                    <SheetTitle>{t('myCard.selectWallets')}</SheetTitle>
                </SheetHeader>

                <div className="max-h-[50vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                    {wallets.map((wallet) => {
                        const selectedChain = chainPreferences[wallet.id] || wallet.chain;
                        const chainAddress = wallet.chainAddresses.find(ca => ca.chain === selectedChain);
                        const isSelected = selectedWalletIds.includes(wallet.id);
                        const isDisabled = !isSelected && !canAddMore;

                        return (
                            <button
                                key={wallet.id}
                                type="button"
                                onClick={() => handleWalletToggle(wallet.id)}
                                disabled={isDisabled}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                                    isSelected && 'bg-primary/10',
                                    !isDisabled && 'hover:bg-muted',
                                    isDisabled && 'cursor-not-allowed opacity-50'
                                )}
                            >
                                <ChainIcon chain={selectedChain} size="md" />

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium">{wallet.name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{chainNameMap[selectedChain] || selectedChain}</span>
                                        <span className="truncate font-mono text-xs">
                                            {chainAddress?.address.slice(0, 8)}...{chainAddress?.address.slice(-6)}
                                        </span>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                                        <Check className="size-4 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {wallets.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            {t('noAssets')}
                        </div>
                    )}
                </div>

                <p className="py-4 text-center text-xs text-muted-foreground">
                    {t('myCard.maxWallets', { max: 3 })}
                </p>
            </SheetContent>
        </Sheet>
    );
}
