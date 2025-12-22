import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { GradientButton } from '@/components/common/gradient-button';
import { IconCircle } from '@/components/common/icon-circle';
import { FormField } from '@/components/common/form-field';
import { Alert } from '@/components/common/alert';
import { ProgressSteps } from '@/components/common/step-indicator';
import { MnemonicDisplay } from '@/components/security/mnemonic-display';
import { PasswordInput } from '@/components/security/password-input';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  IconShieldCheck as ShieldCheck,
  IconEye as Eye,
  IconEyeOff as EyeOff,
  IconChevronRight as ArrowRight,
  IconCircleKey as KeyRound,
  IconCircleCheck as CheckCircle,
} from '@tabler/icons-react';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import { generateMnemonic, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';

type Step = 'password' | 'mnemonic' | 'verify';

const STEPS: Step[] = ['password', 'mnemonic', 'verify'];

export function WalletCreatePage() {
  const { navigate, goBack } = useNavigation();
  const { t } = useTranslation();
  const chainConfigSnapshot = useChainConfigState().snapshot;
  const enabledBioforestChainConfigs = useEnabledBioforestChainConfigs();
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic] = useState<string[]>(generateMnemonic);
  const [mnemonicHidden, setMnemonicHidden] = useState(true);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);

  const currentStepIndex = STEPS.indexOf(step) + 1;

  const handleBack = () => {
    if (step === 'mnemonic') {
      setStep('password');
    } else if (step === 'verify') {
      setStep('mnemonic');
    } else {
      goBack();
    }
  };

  const handlePasswordSubmit = () => {
    if (password.length >= 8 && password === confirmPassword) {
      setStep('mnemonic');
    }
  };

  const handleMnemonicContinue = () => {
    if (mnemonicCopied || !mnemonicHidden) {
      setStep('verify');
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleComplete = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const mnemonicStr = mnemonic.join(' ');

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

      const ethKey = externalKeys.find((k) => k.chain === 'ethereum');
      if (!ethKey) {
        throw new Error('Failed to derive ethereum key');
      }

      // 合并所有链地址
      const chainAddresses = [
        ...externalKeys.map((key) => ({
          chain: key.chain as 'ethereum' | 'bitcoin' | 'tron',
          address: key.address,
          tokens: [],
        })),
        ...bioforestChainAddresses,
      ];

      await walletActions.createWallet(
        {
          name: t('onboarding:create.defaultWalletName'),
          keyType: 'mnemonic',
          address: ethKey.address,
          chain: 'ethereum',
          chainAddresses,
        },
        mnemonicStr,
        password
      );

      navigate({ to: '/' });
    } catch (error) {
      console.error(t('onboarding:create.createFailed'), error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('onboarding:create.title')} onBack={handleBack} />

      {/* 进度指示器 */}
      <div className="px-4 pt-4">
        <ProgressSteps total={3} current={currentStepIndex} />
      </div>

      <div className="flex-1 p-4">
        {step === 'password' && (
          <div data-testid="password-step">
            <PasswordStep
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handlePasswordSubmit}
            />
          </div>
        )}

        {step === 'mnemonic' && (
          <div data-testid="mnemonic-step">
            <MnemonicStep
              mnemonic={mnemonic}
              hidden={mnemonicHidden}
              copied={mnemonicCopied}
              onToggleHidden={() => setMnemonicHidden(!mnemonicHidden)}
              onCopy={() => setMnemonicCopied(true)}
              onContinue={handleMnemonicContinue}
            />
          </div>
        )}

        {step === 'verify' && (
          <div data-testid="verify-step">
            <VerifyStep mnemonic={mnemonic} onComplete={handleComplete} />
          </div>
        )}
      </div>
    </div>
  );
}

interface PasswordStepProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

function PasswordStep({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: PasswordStepProps) {
  const { t } = useTranslation();
  const isValid = password.length >= 8 && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={ShieldCheck} variant="primary" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('onboarding:create.setPassword')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:create.passwordDesc')}</p>
      </div>

      <div className="space-y-4">
        <FormField label={t('onboarding:create.passwordLabel')} hint={t('onboarding:create.passwordHint')}>
          <PasswordInput
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t('onboarding:create.passwordPlaceholder')}
            showStrength
          />
        </FormField>

        <FormField label={t('onboarding:create.confirmPasswordLabel')} error={passwordMismatch ? t('onboarding:create.passwordMismatch') : undefined}>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder={t('onboarding:create.confirmPasswordPlaceholder')}
          />
        </FormField>
      </div>

      <GradientButton variant="mint" className="w-full" data-testid="next-step-button" disabled={!isValid} onClick={onSubmit}>
        {t('onboarding:create.nextStep')}
        <ArrowRight className="ml-2 size-4" />
      </GradientButton>
    </div>
  );
}

interface MnemonicStepProps {
  mnemonic: string[];
  hidden: boolean;
  copied: boolean;
  onToggleHidden: () => void;
  onCopy: () => void;
  onContinue: () => void;
}

function MnemonicStep({ mnemonic, hidden, copied, onToggleHidden, onCopy, onContinue }: MnemonicStepProps) {
  const { t } = useTranslation();
  const canContinue = copied || !hidden;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={KeyRound} variant="warning" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('onboarding:create.backupMnemonic')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:create.backupHint')}</p>
      </div>

      <Alert variant="warning">{t('onboarding:create.mnemonicWarning')}</Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('onboarding:create.mnemonicTitle')}</span>
          <button type="button" data-testid="toggle-mnemonic-button" onClick={onToggleHidden} className="text-primary flex items-center gap-1 text-sm">
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {hidden ? t('onboarding:create.mnemonicShow') : t('onboarding:create.mnemonicHide')}
          </button>
        </div>

        <MnemonicDisplay words={mnemonic} hidden={hidden} onCopy={onCopy} />
      </div>

      <GradientButton variant="mint" className="w-full" data-testid="mnemonic-backed-up-button" disabled={!canContinue} onClick={onContinue}>
        {canContinue ? t('onboarding:create.mnemonicBackedUp') : t('onboarding:create.mnemonicViewFirst')}
        {canContinue && <ArrowRight className="ml-2 size-4" />}
      </GradientButton>
    </div>
  );
}

interface VerifyStepProps {
  mnemonic: string[];
  onComplete: () => void;
}

function VerifyStep({ mnemonic, onComplete }: VerifyStepProps) {
  const { t } = useTranslation();
  const [selectedIndices] = useState<number[]>(() => {
    const indices = Array.from({ length: mnemonic.length }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).sort((a, b) => a - b);
  });

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const isValid = selectedIndices.every((idx) => {
    const word = mnemonic[idx];
    const answer = answers[idx];
    return word && answer && answer.toLowerCase() === word.toLowerCase();
  });

  const handleInputChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const getFieldError = (index: number) => {
    const word = mnemonic[index];
    const answer = answers[index];
    if (answer && word && answer.toLowerCase() !== word.toLowerCase()) {
      return t('onboarding:create.wordIncorrect');
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('onboarding:create.verifyTitle')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:create.verifyDesc')}</p>
      </div>

      <div className="space-y-4">
        {selectedIndices.map((index) => (
          <FormField key={index} label={t('onboarding:create.wordN', { n: index + 1 })} error={getFieldError(index)}>
            <Input
              data-testid={`verify-word-input-${index}`}
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={cn(getFieldError(index) && 'border-destructive focus-visible:ring-destructive')}
              placeholder={t('onboarding:create.wordNPlaceholder', { n: index + 1 })}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </FormField>
        ))}
      </div>

      <GradientButton variant="mint" className="w-full" data-testid="complete-button" disabled={!isValid} onClick={onComplete}>
        {t('onboarding:create.complete')}
      </GradientButton>
    </div>
  );
}
