import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useTranslation } from 'react-i18next';
import { ActivityParamsProvider, useActivityParams, useNavigation } from "../hooks";
import { PageHeader } from '@/components/layout/page-header';
import { WalletConfig } from '@/components/wallet/wallet-config';
import { Alert } from '@/components/common/alert';
import { useWallets } from '@/stores';

type WalletConfigParams = {
  walletId: string;
  walletName?: string;
  mode?: 'default' | 'edit-only';
};

function WalletConfigContent() {
  const { t } = useTranslation('wallet');
  const { walletId, mode = 'default' } = useActivityParams<WalletConfigParams>();
  const { goBack, navigate } = useNavigation();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const handleEditOnlyComplete = () => {
    navigate({ to: '/', replace: true });
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

  const title = mode === 'edit-only' ? t('detail.editTitle') : t('detail.title');

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader 
        title={title} 
        {...(mode !== 'edit-only' && { onBack: goBack })}
      />

      <div className="flex-1 p-4">
        <WalletConfig
          mode={mode}
          walletId={walletId}
          onEditOnlyComplete={handleEditOnlyComplete}
        />

        {mode === 'default' && (
          <div className="mt-6">
            <Alert variant="warning">{t('detail.securityWarning')}</Alert>
          </div>
        )}
      </div>
    </div>
  );
}

export const WalletConfigActivity: ActivityComponentType<WalletConfigParams> = ({ params }) => {
  return (
    <AppScreen>
      <ActivityParamsProvider params={params}>
        <WalletConfigContent />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
