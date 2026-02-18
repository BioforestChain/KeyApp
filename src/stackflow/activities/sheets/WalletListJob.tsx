import { useMemo } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { IconPlus, IconCircleCheckFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useFlow } from '../../stackflow';
import { useWallets, useCurrentWallet, useChainPreferences, useChainConfigs, walletActions } from '@/stores';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { useChainIconUrls } from '@/hooks/useChainIconUrls';
import { WalletMiniCard } from '@/components/wallet/wallet-mini-card';

export const WalletListJob: ActivityComponentType = () => {
  const { t } = useTranslation(['wallet', 'common']);
  const { pop, push } = useFlow();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const chainPreferences = useChainPreferences();
  const chainConfigs = useChainConfigs();
  const currentWalletId = currentWallet?.id;
  const { getWalletTheme } = useWalletTheme();
  const chainIconUrls = useChainIconUrls();
  const chainNameMap = useMemo(() => {
    return Object.fromEntries(chainConfigs.map((config) => [config.id, config.name]));
  }, [chainConfigs]);

  const handleSelectWallet = (walletId: string) => {
    walletActions.setCurrentWallet(walletId);
    pop();
  };

  const handleAddWallet = () => {
    pop();
    push('WalletAddJob', {});
  };
  const handleCancel = () => {
    pop();
  };

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Title */}
        <div className="border-border border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t('common:a11y.tabWallet')}</h2>
        </div>

        {/* Wallet List */}
        <div className="max-h-[50vh] space-y-2 overflow-y-auto p-4">
          {wallets.map((wallet) => {
            const isActive = wallet.id === currentWalletId;
            const preferredChain = chainPreferences[wallet.id] ?? wallet.chain;
            const resolvedChain = wallet.chainAddresses.some((ca) => ca.chain === preferredChain)
              ? preferredChain
              : (wallet.chainAddresses[0]?.chain ?? wallet.chain);
            const chainAddress = wallet.chainAddresses.find((ca) => ca.chain === resolvedChain);
            const address = chainAddress?.address ?? wallet.address;
            const chainName =
              chainNameMap[resolvedChain] ?? t(`common:chains.${resolvedChain}`, { defaultValue: resolvedChain });
            const displayAddress = address
              ? `${chainName} · ${address.slice(0, 6)}...${address.slice(-4)}`
              : `${chainName} · ---`;
            const themeHue = getWalletTheme(wallet.id);

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelectWallet(wallet.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-4 transition-all',
                  'active:scale-[0.98]',
                  isActive ? 'bg-primary/10 ring-primary ring-2' : 'bg-muted/50 hover:bg-muted',
                )}
              >
                {/* 钱包小卡片图标 */}
                <WalletMiniCard themeHue={themeHue} size="md" watermarkIconUrl={chainIconUrls[resolvedChain]} />

                {/* 钱包信息 */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{wallet.name}</span>
                    {isActive && <IconCircleCheckFilled className="text-primary size-4 shrink-0" />}
                  </div>
                  <p className="text-muted-foreground truncate font-mono text-xs">{displayAddress}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add wallet button */}
        <div className="border-border border-t p-4">
          <button
            onClick={handleAddWallet}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl p-4',
              'bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors',
            )}
          >
            <IconPlus className="size-5" />
            <span className="font-medium">{t('wallet:add')}</span>
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
};
