import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { GradientButton } from '@/components/common/gradient-button';
import { IconCircle } from '@/components/common/icon-circle';
import { FormField } from '@/components/common/form-field';
import { Alert } from '@/components/common/alert';
import { ProgressSteps } from '@/components/common/step-indicator';
import { MnemonicInput } from '@/components/security/mnemonic-input';
import { PasswordInput } from '@/components/security/password-input';
import {
  IconShieldCheck as ShieldCheck,
  IconChevronRight as ArrowRight,
  IconSquareKey as FileKey,
} from '@tabler/icons-react';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import { validateMnemonic, encrypt, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';

type Step = 'mnemonic' | 'password';

const STEPS: Step[] = ['mnemonic', 'password'];

export function WalletImportPage() {
  const { t } = useTranslation('onboarding');
  const { navigate } = useNavigation();
  const chainConfigSnapshot = useChainConfigState().snapshot;
  const enabledBioforestChainConfigs = useEnabledBioforestChainConfigs();
  const [step, setStep] = useState<Step>('mnemonic');
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [mnemonicError, setMnemonicError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wordCount, setWordCount] = useState<12 | 24>(12);

  const currentStepIndex = STEPS.indexOf(step) + 1;

  const handleBack = () => {
    if (step === 'password') {
      setStep('mnemonic');
    } else {
      navigate({ to: '/' });
    }
  };

  const handleMnemonicComplete = (words: string[]) => {
    setMnemonic(words);
    setMnemonicError(null);
  };

  const handleMnemonicContinue = () => {
    if (mnemonic.length !== wordCount || mnemonic.some((w) => !w)) {
      setMnemonicError(t('import.fillAllWords'));
      return;
    }

    if (!validateMnemonic(mnemonic)) {
      setMnemonicError(t('import.invalidMnemonic'));
      return;
    }

    setMnemonicError(null);
    setStep('password');
  };

  const [isImporting, setIsImporting] = useState(false);

  const handleComplete = async () => {
    if (isImporting) return;
    setIsImporting(true);

    try {
      const mnemonicStr = mnemonic.join(' ');
      const encryptedMnemonic = await encrypt(mnemonicStr, password);

      // 派生外部链地址 (BIP44)
      const externalKeys = deriveMultiChainKeys(mnemonicStr, ['ethereum', 'bitcoin', 'tron'], 0);

      // 派生 BioForest 链地址 (Ed25519) - 使用相同的助记词字符串
      const bioforestChainAddresses = deriveBioforestAddresses(
        mnemonicStr,
        chainConfigSnapshot ? enabledBioforestChainConfigs : undefined,
      ).map((item) => ({
        chain: item.chainId,
        address: item.address,
        tokens: [],
      }));

      const ethKey = externalKeys.find((k) => k.chain === 'ethereum')!;

      // 合并所有链地址
      const chainAddresses = [
        ...externalKeys.map((key) => ({
          chain: key.chain as 'ethereum' | 'bitcoin' | 'tron',
          address: key.address,
          tokens: [],
        })),
        ...bioforestChainAddresses,
      ];

      walletActions.importWallet({
        name: t('import.defaultWalletName'),
        keyType: 'mnemonic',
        address: ethKey.address,
        chain: 'ethereum',
        chainAddresses,
        encryptedMnemonic,
      });

      navigate({ to: '/' });
    } catch (error) {
      console.error(t('import.importFailed'), error);
      setIsImporting(false);
    }
  };

  const isPasswordValid = password.length >= 8 && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('import.title')} onBack={handleBack} />

      {/* 进度指示器 */}
      <div className="px-4 pt-4">
        <ProgressSteps total={2} current={currentStepIndex} />
      </div>

      <div className="flex-1 p-4">
        {step === 'mnemonic' && (
          <div className="space-y-6">
            <div className="text-center">
              <IconCircle icon={FileKey} variant="primary" size="lg" className="mx-auto mb-4" />
              <h2 className="text-xl font-bold">{t('import.enterMnemonic')}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{t('import.enterMnemonicDesc')}</p>
            </div>

            {/* 助记词数量选择 */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setWordCount(12)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  wordCount === 12
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('import.words12')}
              </button>
              <button
                type="button"
                onClick={() => setWordCount(24)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  wordCount === 24
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('import.words24')}
              </button>
            </div>

            <MnemonicInput key={wordCount} wordCount={wordCount} onComplete={handleMnemonicComplete} />

            {mnemonicError && <Alert variant="error">{mnemonicError}</Alert>}

            <GradientButton
              variant="mint"
              className="w-full"
              disabled={mnemonic.length !== wordCount || mnemonic.some((w) => !w)}
              onClick={handleMnemonicContinue}
            >
              {t('import.nextStep')}
              <ArrowRight className="ml-2 size-4" />
            </GradientButton>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <div className="text-center">
              <IconCircle icon={ShieldCheck} variant="primary" size="lg" className="mx-auto mb-4" />
              <h2 className="text-xl font-bold">{t('import.setPassword')}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{t('import.setPasswordDesc')}</p>
            </div>

            <div className="space-y-4">
              <FormField label={t('import.passwordLabel')} hint={t('import.passwordHint')}>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('import.passwordPlaceholder')}
                  showStrength
                />
              </FormField>

              <FormField label={t('import.confirmPasswordLabel')} error={passwordMismatch ? t('import.passwordMismatch') : undefined}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('import.confirmPasswordPlaceholder')}
                />
              </FormField>
            </div>

            <GradientButton variant="mint" className="w-full" disabled={!isPasswordValid} onClick={handleComplete}>
              {t('import.complete')}
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
}
