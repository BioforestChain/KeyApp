import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { PatternLock, patternToString } from '@/components/security/pattern-lock';
import { PatternLockSetup } from '@/components/security/pattern-lock-setup';
import { MnemonicInput } from '@/components/security/mnemonic-input';
import { Button } from '@/components/ui/button';
import { useCurrentWallet, walletActions } from '@/stores';
import { verifyPassword, validateMnemonic } from '@/lib/crypto';

type Step = 'verify' | 'setup' | 'success';
type VerifyMethod = 'pattern' | 'mnemonic';

export function ChangeWalletLockPage() {
  const { t } = useTranslation('settings');
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();

  const [step, setStep] = useState<Step>('verify');
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>('pattern');
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [verifyError, setVerifyError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 助记词验证相关状态
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [mnemonicComplete, setMnemonicComplete] = useState(false);
  const [mnemonicError, setMnemonicError] = useState<string | null>(null);
  const [verifiedMnemonic, setVerifiedMnemonic] = useState<string | null>(null);

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
          setCurrentPattern(nodes);
          setStep('setup');
        } else {
          setVerifyError(true);
          setCurrentPattern([]);
          setTimeout(() => {
            setVerifyError(false);
          }, 1500);
        }
      } catch {
        setVerifyError(true);
        setCurrentPattern([]);
        setTimeout(() => {
          setVerifyError(false);
        }, 1500);
      } finally {
        setIsVerifying(false);
      }
    },
    [currentWallet],
  );

  // 助记词输入变化
  const handleMnemonicChange = useCallback((words: string[], isComplete: boolean) => {
    setMnemonicWords(words);
    setMnemonicComplete(isComplete);
    setMnemonicError(null);
  }, []);

  // 验证助记词
  const handleMnemonicVerify = useCallback(async () => {
    if (!currentWallet?.encryptedWalletLock) return;

    setIsVerifying(true);
    setMnemonicError(null);

    try {
      // 首先验证助记词格式
      if (!validateMnemonic(mnemonicWords)) {
        setMnemonicError(t('changeWalletLock.invalidMnemonic'));
        setIsVerifying(false);
        return;
      }

      const mnemonic = mnemonicWords.join(' ');

      // 验证助记词是否正确（不修改数据）
      const isValid = await walletActions.verifyMnemonic(currentWallet.id, mnemonic);
      
      if (isValid) {
        // 保存验证通过的助记词，在设置新图案时使用
        setVerifiedMnemonic(mnemonic);
        setStep('setup');
      } else {
        setMnemonicError(t('changeWalletLock.mnemonicVerifyFailed'));
      }
    } catch {
      setMnemonicError(t('changeWalletLock.mnemonicVerifyFailed'));
    } finally {
      setIsVerifying(false);
    }
  }, [currentWallet, mnemonicWords, t]);

  // 设置新图案完成
  const handleNewPatternComplete = useCallback(
    async (newPatternKey: string) => {
      if (!currentWallet) return;

      try {
        if (verifyMethod === 'mnemonic' && verifiedMnemonic) {
          // 使用助记词重置钱包锁
          await walletActions.resetWalletLockByMnemonic(
            currentWallet.id,
            verifiedMnemonic,
            newPatternKey
          );
        } else {
          // 使用旧图案更新钱包锁
          const currentPatternKey = patternToString(currentPattern);
          await walletActions.updateWalletLock(
            currentWallet.id,
            currentPatternKey,
            newPatternKey
          );
        }

        setStep('success');

        setTimeout(() => {
          goBack();
        }, 2000);
      } catch {
        setStep('verify');
        setCurrentPattern([]);
        setVerifiedMnemonic(null);
      }
    },
    [currentWallet, verifyMethod, verifiedMnemonic, currentPattern, goBack],
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

  // 验证当前图案或助记词
  if (step === 'verify') {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changeWalletLock.title')} onBack={goBack} />
        <div className="flex-1 p-4">
          {verifyMethod === 'pattern' ? (
            <>
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

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVerifyMethod('mnemonic')}
                  className="text-primary hover:text-primary/80 text-sm underline"
                  data-testid="switch-to-mnemonic"
                >
                  {t('changeWalletLock.forgotPattern')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold">{t('changeWalletLock.mnemonicVerifyTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t('changeWalletLock.mnemonicVerifyDesc')}
                </p>
              </div>

              <MnemonicInput
                wordCount={12}
                onChange={handleMnemonicChange}
              />

              {mnemonicError && (
                <p className="text-destructive mt-4 text-center text-sm">{mnemonicError}</p>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleMnemonicVerify}
                  disabled={!mnemonicComplete || isVerifying}
                  className="w-full"
                  data-testid="verify-mnemonic-button"
                >
                  {isVerifying ? t('changeWalletLock.verifying') : t('changeWalletLock.verifyMnemonic')}
                </Button>
                
                <button
                  type="button"
                  onClick={() => {
                    setVerifyMethod('pattern');
                    setMnemonicWords([]);
                    setMnemonicError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground w-full text-center text-sm"
                  data-testid="switch-to-pattern"
                >
                  {t('changeWalletLock.usePattern')}
                </button>
              </div>
            </>
          )}
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
