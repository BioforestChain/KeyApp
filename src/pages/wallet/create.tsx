import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
  IconArrowRight as ArrowRight,
  IconCircleKey as KeyRound,
  IconCircleCheck as CheckCircle,
} from '@tabler/icons-react';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import { generateMnemonic, encrypt, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';

type Step = 'password' | 'mnemonic' | 'verify';

const STEPS: Step[] = ['password', 'mnemonic', 'verify'];

export function WalletCreatePage() {
  const navigate = useNavigate();
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
      navigate({ to: '/' });
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

      walletActions.createWallet({
        name: '主钱包',
        keyType: 'mnemonic',
        address: ethKey.address,
        chain: 'ethereum',
        chainAddresses,
        encryptedMnemonic,
      });

      navigate({ to: '/' });
    } catch (error) {
      console.error('创建钱包失败:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="创建钱包" onBack={handleBack} />

      {/* 进度指示器 */}
      <div className="px-4 pt-4">
        <ProgressSteps total={3} current={currentStepIndex} />
      </div>

      <div className="flex-1 p-4">
        {step === 'password' && (
          <PasswordStep
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
          />
        )}

        {step === 'mnemonic' && (
          <MnemonicStep
            mnemonic={mnemonic}
            hidden={mnemonicHidden}
            copied={mnemonicCopied}
            onToggleHidden={() => setMnemonicHidden(!mnemonicHidden)}
            onCopy={() => setMnemonicCopied(true)}
            onContinue={handleMnemonicContinue}
          />
        )}

        {step === 'verify' && <VerifyStep mnemonic={mnemonic} onComplete={handleComplete} />}
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
  const isValid = password.length >= 8 && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={ShieldCheck} variant="primary" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">设置密码</h2>
        <p className="text-muted-foreground mt-2 text-sm">密码用于加密您的钱包，请牢记</p>
      </div>

      <div className="space-y-4">
        <FormField label="密码" hint="至少 8 位字符">
          <PasswordInput
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="输入密码"
            showStrength
          />
        </FormField>

        <FormField label="确认密码" error={passwordMismatch ? '两次密码不一致' : undefined}>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="再次输入密码"
          />
        </FormField>
      </div>

      <GradientButton variant="mint" className="w-full" disabled={!isValid} onClick={onSubmit}>
        下一步
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
  const canContinue = copied || !hidden;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={KeyRound} variant="warning" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">备份助记词</h2>
        <p className="text-muted-foreground mt-2 text-sm">请按顺序抄写助记词，并妥善保管</p>
      </div>

      <Alert variant="warning">助记词是恢复钱包的唯一方式，丢失后无法找回。请勿截图或在线存储。</Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">助记词</span>
          <button type="button" onClick={onToggleHidden} className="text-primary flex items-center gap-1 text-sm">
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {hidden ? '显示' : '隐藏'}
          </button>
        </div>

        <MnemonicDisplay words={mnemonic} hidden={hidden} onCopy={onCopy} />
      </div>

      <GradientButton variant="mint" className="w-full" disabled={!canContinue} onClick={onContinue}>
        {canContinue ? '我已备份' : '请先查看并复制助记词'}
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
      return '单词不正确';
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">验证助记词</h2>
        <p className="text-muted-foreground mt-2 text-sm">请输入以下位置的助记词</p>
      </div>

      <div className="space-y-4">
        {selectedIndices.map((index) => (
          <FormField key={index} label={`第 ${index + 1} 个单词`} error={getFieldError(index)}>
            <Input
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={cn(getFieldError(index) && 'border-destructive focus-visible:ring-destructive')}
              placeholder={`输入第 ${index + 1} 个单词`}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </FormField>
        ))}
      </div>

      <GradientButton variant="mint" className="w-full" disabled={!isValid} onClick={onComplete}>
        完成创建
      </GradientButton>
    </div>
  );
}
