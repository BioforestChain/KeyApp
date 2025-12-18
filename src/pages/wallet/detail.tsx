import { useTranslation } from 'react-i18next';
import { useNavigation, useActivityParams } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/common/alert';
import { useBiometric, useToast, useHaptics } from '@/services';
import {
  IconCircleKey as KeyRound,
  IconTrash as Trash2,
  IconPencilMinus as Edit3,
  IconShield as Shield,
} from '@tabler/icons-react';
import { useWallets, walletActions, type ChainType } from '@/stores';

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
};

export function WalletDetailPage() {
  const { t } = useTranslation('wallet');
  const { walletId } = useActivityParams<{ walletId: string }>();
  const { goBack } = useNavigation();
  const biometric = useBiometric();
  const toast = useToast();
  const haptics = useHaptics();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const handleExportMnemonic = async () => {
    const { isAvailable } = await biometric.isAvailable();

    if (isAvailable) {
      const result = await biometric.verify({ title: t('detail.verifyToExport') });
      if (!result.success) {
        toast.show({ message: t('detail.verifyFailed'), position: 'center' });
        return;
      }
    }

    await haptics.impact('success');
    toast.show(t('detail.exportDeveloping'));
    // TODO: Implement mnemonic export
  };

  const handleDeleteWallet = async () => {
    const { isAvailable } = await biometric.isAvailable();

    if (isAvailable) {
      const result = await biometric.verify({ title: t('detail.verifyToDelete') });
      if (!result.success) {
        toast.show({ message: t('detail.verifyFailed'), position: 'center' });
        return;
      }
    }

    walletActions.deleteWallet(walletId);
    await haptics.impact('warning');
    toast.show(t('detail.walletDeleted'));
    goBack();
  };

  if (!wallet) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={goBack} />
        <div className="flex-1 p-4">
          <Alert variant="error">{t('detail.notFound')}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={wallet.name} onBack={goBack} />

      <div className="flex-1 space-y-6 p-4">
        {/* Wallet info */}
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <Shield className="text-primary size-6" />
            </div>
            <div>
              <h2 className="font-semibold">{wallet.name}</h2>
              <p className="text-muted-foreground text-sm">{t('detail.createdAt', { date: new Date(wallet.createdAt).toLocaleDateString() })}</p>
            </div>
          </div>
        </div>

        {/* Chain addresses */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">{t('detail.chainAddresses')}</h3>
          {wallet.chainAddresses.map((chainAddr) => (
            <div key={chainAddr.chain} className="bg-card flex items-center gap-3 rounded-xl p-4">
              <ChainIcon chain={chainAddr.chain} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{CHAIN_NAMES[chainAddr.chain] ?? chainAddr.chain}</p>
                <AddressDisplay address={chainAddr.address} copyable className="text-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // TODO: Edit wallet name
            }}
          >
            <Edit3 className="mr-3 size-4" />
            {t('detail.editName')}
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={handleExportMnemonic}>
            <KeyRound className="mr-3 size-4" />
            {t('detail.exportMnemonic')}
          </Button>

          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 w-full justify-start"
            onClick={handleDeleteWallet}
          >
            <Trash2 className="mr-3 size-4" />
            {t('detail.deleteWallet')}
          </Button>
        </div>

        {/* Security warning */}
        <Alert variant="warning">{t('detail.securityWarning')}</Alert>
      </div>
    </div>
  );
}
