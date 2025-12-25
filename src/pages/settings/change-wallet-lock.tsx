import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { PatternLock, patternToString } from '@/components/security/pattern-lock';
import { PatternLockSetup } from '@/components/security/pattern-lock-setup';
import { useCurrentWallet, walletActions } from '@/stores';
import { verifyPassword } from '@/lib/crypto';

type Step = 'verify' | 'setup' | 'success';

export function ChangeWalletLockPage() {
  const { t } = useTranslation('settings');
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();

  const [step, setStep] = useState<Step>('verify');
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [verifyError, setVerifyError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 验证当前图案
  const handleVerifyComplete = useCallback(
    async (nodes: number[]) => {
      if (!currentWallet?.encryptedMnemonic) return;

      setIsVerifying(true);
      setVerifyError(false);

      try {
        const patternKey = patternToString(nodes);
        const isValid = await verifyPassword(currentWallet.encryptedMnemonic, patternKey);

        if (isValid) {
          setStep('setup');
        } else {
          setVerifyError(true);
          setCurrentPattern([]);
          // 1.5秒后自动重置错误状态，让用户重新输入
          setTimeout(() => {
            setVerifyError(false);
          }, 1500);
        }
      } catch {
        setVerifyError(true);
        setCurrentPattern([]);
        // 1.5秒后自动重置错误状态
        setTimeout(() => {
          setVerifyError(false);
        }, 1500);
      } finally {
        setIsVerifying(false);
      }
    },
    [currentWallet],
  );

  // 设置新图案完成
  const handleNewPatternComplete = useCallback(
    async (newPatternKey: string) => {
      if (!currentWallet?.encryptedMnemonic) return;

      try {
        const currentPatternKey = patternToString(currentPattern);
        await walletActions.updateWalletEncryptedMnemonic(
          currentWallet.id,
          currentPatternKey,
          newPatternKey
        );

        setStep('success');

        // 2秒后返回
        setTimeout(() => {
          goBack();
        }, 2000);
      } catch {
        // 错误处理 - 返回验证步骤
        setStep('verify');
        setCurrentPattern([]);
      }
    },
    [currentWallet, currentPattern, goBack],
  );

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changeWalletLock.title')} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('changeWalletLock.noWallet')}</p>
        </div>
      </div>
    );
  }

  // 成功状态
  if (step === 'success') {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changeWalletLock.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="bg-green-500/10 flex size-16 items-center justify-center rounded-full">
            <Check className="text-green-500 size-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">{t('changeWalletLock.success')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t('changeWalletLock.returning')}</p>
          </div>
        </div>
      </div>
    );
  }

  // 验证当前图案
  if (step === 'verify') {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changeWalletLock.title')} onBack={goBack} />
        <div className="flex-1 p-4">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">{t('changeWalletLock.verifyTitle')}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('changeWalletLock.verifyDesc')}
            </p>
          </div>

          <PatternLock
            value={currentPattern}
            onChange={setCurrentPattern}
            onComplete={handleVerifyComplete}
            minPoints={4}
            error={verifyError}
            disabled={isVerifying}
            data-testid="verify-pattern-lock"
          />
        </div>
      </div>
    );
  }

  // 设置新图案
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('changeWalletLock.title')}
        onBack={() => {
          setStep('verify');
          setCurrentPattern([]);
        }}
      />
      <div className="flex-1 p-4">
        <PatternLockSetup
          onComplete={handleNewPatternComplete}
          minPoints={4}
        />
      </div>
    </div>
  );
}
