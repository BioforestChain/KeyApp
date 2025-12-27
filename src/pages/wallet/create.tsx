import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { GradientButton } from '@/components/common/gradient-button';
import { IconCircle } from '@/components/common/icon-circle';
import { Alert } from '@/components/common/alert';
import { ProgressSteps } from '@/components/common/step-indicator';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { MnemonicDisplay } from '@/components/security/mnemonic-display';
import { PatternLockSetup } from '@/components/security/pattern-lock-setup';
import { ChainSelector, getDefaultSelectedChains } from '@/components/onboarding/chain-selector';
import { WalletConfig } from '@/components/wallet/wallet-config';
import { FormField } from '@/components/common/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  IconEye as Eye,
  IconEyeOff as EyeOff,
  IconChevronRight as ArrowRight,
  IconCircleKey as KeyRound,
  IconCircleCheck as CheckCircle,
} from '@tabler/icons-react';
import { useChainConfigs, walletActions } from '@/stores';
import { generateMnemonic, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';
import { deriveThemeHue } from '@/hooks/useWalletTheme';
import type { ChainConfig } from '@/services/chain-config';

type Step = 'pattern' | 'mnemonic' | 'verify' | 'chains' | 'theme';

const STEPS: Step[] = ['pattern', 'mnemonic', 'verify', 'chains', 'theme'];

export function WalletCreatePage() {
  const { goBack, navigate } = useNavigation();
  const { t } = useTranslation('onboarding');
  const chainConfigs = useChainConfigs();
  const [step, setStep] = useState<Step>('pattern');
  const [patternKey, setPatternKey] = useState('');
  const [mnemonic] = useState<string[]>(generateMnemonic);
  const [mnemonicHidden, setMnemonicHidden] = useState(true);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [selectedChainIds, setSelectedChainIds] = useState<string[]>([]);
  const [initializedSelection, setInitializedSelection] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdWalletId, setCreatedWalletId] = useState<string | null>(null);

  const currentStepIndex = STEPS.indexOf(step) + 1;

  useEffect(() => {
    if (!initializedSelection && chainConfigs.length > 0) {
      setSelectedChainIds(getDefaultSelectedChains(chainConfigs));
      setInitializedSelection(true);
    }
  }, [chainConfigs, initializedSelection]);

  const handleBack = () => {
    if (step === 'mnemonic') {
      setStep('pattern');
      setPatternKey('');
    } else if (step === 'verify') {
      setStep('mnemonic');
    } else if (step === 'chains') {
      setStep('verify');
    } else if (step === 'theme') {
      // 不允许从 theme 返回，钱包已创建
    } else {
      goBack();
    }
  };

  const handlePatternComplete = (key: string) => {
    setPatternKey(key);
    setStep('mnemonic');
  };

  const handleMnemonicContinue = () => {
    if (mnemonicCopied || !mnemonicHidden) {
      setStep('verify');
    }
  };

  const handleVerifyContinue = () => {
    setStep('chains');
  };

  const handleChainsContinue = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const mnemonicStr = mnemonic.join(' ');

      const selectedConfigs = chainConfigs.filter((config) => selectedChainIds.includes(config.id));
      const selectedBioforestConfigs = selectedConfigs.filter((config) => config.type === 'bioforest');
      const selectedBip39Ids = new Set(
        selectedConfigs.filter((config) => config.type === 'bip39').map((config) => config.id),
      );
      const selectedEvmConfigs = selectedConfigs.filter(
        (config) => config.type === 'evm' || config.type === 'custom',
      );

      const externalChains: Array<'ethereum' | 'bitcoin' | 'tron'> = [];
      if (selectedEvmConfigs.length > 0) externalChains.push('ethereum');
      if (selectedBip39Ids.has('bitcoin')) externalChains.push('bitcoin');
      if (selectedBip39Ids.has('tron')) externalChains.push('tron');

      const externalKeys = externalChains.length > 0
        ? deriveMultiChainKeys(mnemonicStr, externalChains, 0)
        : [];

      const addressByChain = new Map<string, string>();
      const ethKey = externalKeys.find((k) => k.chain === 'ethereum');
      if (ethKey) {
        if (selectedChainIds.includes('ethereum')) {
          addressByChain.set('ethereum', ethKey.address);
        }
        for (const config of selectedEvmConfigs) {
          addressByChain.set(config.id, ethKey.address);
        }
      }

      const bitcoinKey = externalKeys.find((k) => k.chain === 'bitcoin');
      if (bitcoinKey && selectedBip39Ids.has('bitcoin')) {
        addressByChain.set('bitcoin', bitcoinKey.address);
      }

      const tronKey = externalKeys.find((k) => k.chain === 'tron');
      if (tronKey && selectedBip39Ids.has('tron')) {
        addressByChain.set('tron', tronKey.address);
      }

      const bioforestChainAddresses = deriveBioforestAddresses(
        mnemonicStr,
        selectedBioforestConfigs.length > 0 ? selectedBioforestConfigs : [],
      );
      for (const item of bioforestChainAddresses) {
        addressByChain.set(item.chainId, item.address);
      }

      const chainAddresses = selectedChainIds
        .map((chainId) => {
          const address = addressByChain.get(chainId);
          if (!address) return null;
          return {
            chain: chainId,
            address,
            tokens: [],
          };
        })
        .filter((item): item is { chain: string; address: string; tokens: [] } => Boolean(item));

      const primaryChain = chainAddresses[0];
      if (!primaryChain) {
        throw new Error('No chain addresses derived');
      }

      const themeHue = deriveThemeHue(primaryChain.address);

      const wallet = await walletActions.createWallet(
        {
          name: t('create.defaultWalletName'),
          keyType: 'mnemonic',
          address: primaryChain.address,
          chain: primaryChain.chain,
          chainAddresses,
          themeHue,
        },
        mnemonicStr,
        patternKey,
        themeHue
      );

      // 保存钱包ID，进入主题编辑步骤
      setCreatedWalletId(wallet.id);
      setStep('theme');
    } catch (error) {
      console.error(t('create.createFailed'), error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditOnlyComplete = () => {
    navigate({ to: '/', replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('create.title')} onBack={handleBack} />

      {/* 进度指示器 */}
      <div className="px-4 pt-4">
        <ProgressSteps total={5} current={currentStepIndex} />
      </div>

      <div className="flex-1 p-4">
        {step === 'pattern' && (
          <div data-testid="pattern-step">
            <PatternLockSetup
              onComplete={handlePatternComplete}
              minPoints={4}
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
            <VerifyStep mnemonic={mnemonic} onContinue={handleVerifyContinue} />
          </div>
        )}

        {step === 'chains' && (
          <div data-testid="chain-selector-step">
            <ChainSelectionStep
              chains={chainConfigs}
              selectedChains={selectedChainIds}
              selectionCount={selectedChainIds.length}
              onSelectionChange={setSelectedChainIds}
              onComplete={handleChainsContinue}
              completeLabel={t('create.nextStep')}
              isSubmitting={isCreating}
            />
          </div>
        )}

        {step === 'theme' && createdWalletId && (
          <div data-testid="theme-step">
            <WalletConfig
              mode="edit-only"
              walletId={createdWalletId}
              onEditOnlyComplete={handleEditOnlyComplete}
            />
          </div>
        )}
      </div>
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
  const { t } = useTranslation('onboarding');
  const canContinue = copied || !hidden;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={KeyRound} variant="warning" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('create.backupMnemonic')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('create.backupHint')}</p>
      </div>

      <Alert variant="warning">{t('create.mnemonicWarning')}</Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('create.mnemonicTitle')}</span>
          <button type="button" data-testid="toggle-mnemonic-button" onClick={onToggleHidden} className="text-primary flex items-center gap-1 text-sm">
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {hidden ? t('create.mnemonicShow') : t('create.mnemonicHide')}
          </button>
        </div>

        <MnemonicDisplay words={mnemonic} hidden={hidden} onCopy={onCopy} />
      </div>

      <GradientButton variant="mint" className="w-full" data-testid="mnemonic-backed-up-button" disabled={!canContinue} onClick={onContinue}>
        {canContinue ? t('create.mnemonicBackedUp') : t('create.mnemonicViewFirst')}
        {canContinue && <ArrowRight className="ml-2 size-4" />}
      </GradientButton>
    </div>
  );
}

interface VerifyStepProps {
  mnemonic: string[];
  onContinue: () => void;
}

function VerifyStep({ mnemonic, onContinue }: VerifyStepProps) {
  const { t } = useTranslation(['onboarding', 'common']);
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
      return t('create.wordIncorrect');
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('create.verifyTitle')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('create.verifyDesc')}</p>
      </div>

      <div className="space-y-4">
        {selectedIndices.map((index) => (
          <FormField key={index} label={t('create.wordN', { n: index + 1 })} error={getFieldError(index)}>
            <Input
              data-testid={`verify-word-input-${index}`}
              data-verify-index={index}
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={cn(getFieldError(index) && 'border-destructive focus-visible:ring-destructive')}
              placeholder={t('create.wordNPlaceholder', { n: index + 1 })}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </FormField>
        ))}
      </div>

      <GradientButton
        variant="mint"
        className="w-full"
        data-testid="verify-next-button"
        disabled={!isValid}
        onClick={onContinue}
      >
        {t('common:next')}
      </GradientButton>
    </div>
  );
}

interface ChainSelectionStepProps {
  chains: ChainConfig[];
  selectedChains: string[];
  selectionCount: number;
  isSubmitting: boolean;
  completeLabel: string;
  onSelectionChange: (chainIds: string[]) => void;
  onComplete: () => void;
}

function ChainSelectionStep({
  chains,
  selectedChains,
  selectionCount,
  isSubmitting,
  completeLabel,
  onSelectionChange,
  onComplete,
}: ChainSelectionStepProps) {
  const { t } = useTranslation(['onboarding', 'common']);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{t('chainSelector.title')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('chainSelector.subtitle')}</p>
      </div>

      {chains.length === 0 ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <ChainSelector
          data-testid="chain-selector"
          chains={chains}
          selectedChains={selectedChains}
          onSelectionChange={onSelectionChange}
        />
      )}

      <GradientButton
        variant="mint"
        className="w-full"
        data-testid="chain-selector-complete-button"
        disabled={selectionCount === 0 || isSubmitting}
        onClick={onComplete}
      >
        {completeLabel}
      </GradientButton>
    </div>
  );
}


