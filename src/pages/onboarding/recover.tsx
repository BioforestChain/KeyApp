import { useState, useCallback, useEffect } from 'react';
import { useNavigation, useFlow } from '@/stackflow';
import { setSecurityWarningConfirmCallback } from '@/stackflow/activities/sheets';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/page-header';
import { RecoverWalletForm, type RecoverWalletFormData } from '@/components/onboarding/recover-wallet-form';
import { KeyTypeSelector, type WalletKeyType } from '@/components/onboarding/key-type-selector';
import { ArbitraryKeyInput } from '@/components/onboarding/arbitrary-key-input';
import { ChainAddressPreview, type DerivedAddress } from '@/components/onboarding/chain-address-preview';
import { CollisionConfirmDialog } from '@/components/onboarding/collision-confirm-dialog';
import { ImportWalletSuccess } from '@/components/onboarding/import-wallet-success';
import { PatternLockSetup } from '@/components/security/pattern-lock-setup';
import { ChainSelector, getDefaultSelectedChains } from '@/components/onboarding/chain-selector';
import { WalletConfig } from '@/components/wallet/wallet-config';
import { Button } from '@/components/ui/button';
import { GradientButton, IconCircle, LoadingSpinner } from '@/components/common';
import { useDuplicateDetection } from '@/hooks/use-duplicate-detection';
import { deriveWalletChainAddresses } from '@/services/chain-adapter';
import { deriveThemeHue } from '@/hooks/useWalletTheme';
import { useChainConfigs, useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import type { IWalletQuery } from '@/services/wallet/types';
import { IconAlertCircle as AlertCircle, IconLoader2 as Loader2, IconCircleCheck as CheckCircle } from '@tabler/icons-react';
import { ProgressSteps } from '@/components/common';

type Step = 'keyType' | 'mnemonic' | 'arbitrary' | 'pattern' | 'chains' | 'theme' | 'collision' | 'success';

// Mock wallet query for now - will be replaced with real implementation
const mockWalletQuery: IWalletQuery = {
  getAllAddresses: async () => [],
  getAllMainWallets: async () => [],
  findWalletByAddress: async () => null,
};

/**
 * Onboarding recover wallet page
 * Implements wallet recovery with duplicate detection per openspec/changes/add-wallet-recover-duplicate-guards
 */
export function OnboardingRecoverPage() {
  const { navigate, goBack } = useNavigation();
  const { push } = useFlow();
  const { t } = useTranslation(['onboarding', 'common', 'wallet']);
  const chainConfigs = useChainConfigs();
  const chainConfigSnapshot = useChainConfigState().snapshot;
  const enabledBioforestChainConfigs = useEnabledBioforestChainConfigs();
  const [step, setStep] = useState<Step>('keyType');
  const [keyType, setKeyType] = useState<WalletKeyType>('mnemonic');
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [arbitrarySecret, setArbitrarySecret] = useState('');
  const [arbitraryError, setArbitraryError] = useState<string | null>(null);
  const [arbitraryDerivedAddresses, setArbitraryDerivedAddresses] = useState<DerivedAddress[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patternKey, setPatternKey] = useState('');
  const [createdWalletId, setCreatedWalletId] = useState<string | null>(null);
  
  // 链选择状态
  const [selectedChainIds, setSelectedChainIds] = useState<string[]>([]);
  const [initializedSelection, setInitializedSelection] = useState(false);

  // 初始化默认链选择
  useEffect(() => {
    if (!initializedSelection && chainConfigs.length > 0) {
      setSelectedChainIds(getDefaultSelectedChains(chainConfigs));
      setInitializedSelection(true);
    }
  }, [chainConfigs, initializedSelection]);

  // Duplicate detection hook
  const duplicateDetection = useDuplicateDetection(mockWalletQuery);

  // 计算进度条当前步骤 (5步: keyType -> mnemonic/arbitrary -> pattern -> chains -> theme)
  const currentStepIndex = (() => {
    switch (step) {
      case 'keyType': return 1;
      case 'mnemonic':
      case 'arbitrary': return 2;
      case 'collision': return 2; // collision 不算独立步骤
      case 'pattern': return 3;
      case 'chains': return 4;
      case 'theme': return 5;
      case 'success': return 5;
      default: return 1;
    }
  })();

  const handleBack = useCallback(() => {
    switch (step) {
      case 'keyType':
        goBack();
        break;
      case 'mnemonic':
      case 'arbitrary':
        setStep('keyType');
        duplicateDetection.reset();
        break;
      case 'collision':
        setStep('mnemonic');
        duplicateDetection.reset();
        break;
      case 'pattern':
        setStep(keyType === 'arbitrary' ? 'arbitrary' : 'mnemonic');
        break;
      case 'chains':
        setStep('pattern');
        break;
      case 'theme':
        setStep('chains');
        break;
      case 'success':
        // Can't go back from success
        break;
    }
  }, [step, goBack, duplicateDetection, keyType]);

  const goToPatternStep = useCallback(() => {
    setStep('pattern');
  }, []);

  const handlePatternComplete = useCallback((key: string) => {
    setPatternKey(key);
    setStep('chains');
  }, []);

  const handleKeyTypeContinue = useCallback(() => {
    if (keyType === 'mnemonic') {
      setStep('mnemonic');
      return;
    }

    if (securityAcknowledged) {
      setStep('arbitrary');
      return;
    }

    setSecurityWarningConfirmCallback(() => {
      setSecurityAcknowledged(true);
      setStep('arbitrary');
    });
    push('SecurityWarningJob', {});
  }, [keyType, securityAcknowledged, push]);

  const handleMnemonicSubmit = useCallback(
    async (data: RecoverWalletFormData) => {
      setMnemonic(data.mnemonic);

      // Check for duplicates
      const result = await duplicateDetection.check(data.mnemonic);

      if (result.isDuplicate) {
        if (result.type === 'address') {
          // Simple duplicate - show error toast
          // Toast: "该助记词已导入"
          console.log('Duplicate detected:', result.matchedWallet?.name);
          return;
        } else if (result.type === 'privateKey') {
          // Private key collision - show confirmation dialog
          setStep('collision');
          return;
        }
      }

      // No duplicate - proceed to password setup
      goToPatternStep();
    },
    [duplicateDetection, goToPatternStep],
  );

  const handleCollisionConfirm = useCallback(async () => {
    // User confirmed replacement - proceed with wallet creation
    // TODO: Delete the old private key wallet first
    goToPatternStep();
  }, [goToPatternStep]);

  const handleCollisionCancel = useCallback(() => {
    setStep('mnemonic');
    duplicateDetection.reset();
  }, [duplicateDetection]);

  const createWallet = useCallback(
    async (words: string[], walletPassword: string) => {
      setIsSubmitting(true);

      try {
        const mnemonicStr = words.join(' ');

        // 使用 chain-adapter 统一派生所有地址（单一真相）
        const derivedAddresses = await deriveWalletChainAddresses({
          mnemonic: mnemonicStr,
          selectedChainIds,
          chainConfigs,
        });

        const chainAddresses = derivedAddresses.map(({ chainId, address, publicKey }) => ({
          chain: chainId,
          address,
          publicKey: publicKey ?? '',
          tokens: [],
        }));

        const primaryChain = chainAddresses[0];
        if (!primaryChain) {
          throw new Error('No chain addresses derived');
        }

        const hue = deriveThemeHue(primaryChain.address);

        const wallet = await walletActions.createWallet(
          {
            name: t('wallet:defaultName'),
            keyType: 'mnemonic',
            address: primaryChain.address,
            chain: primaryChain.chain,
            chainAddresses,
            themeHue: hue,
          },
          mnemonicStr,
          walletPassword,
          hue
        );

        setCreatedWalletId(wallet.id);
        setStep('theme');
      } catch (error) {
        console.error('恢复钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [chainConfigs, selectedChainIds, t],
  );

  const createArbitraryWallet = useCallback(
    async (walletPassword: string) => {
      const secret = arbitrarySecret.trim();
      if (!secret) return;
      if (arbitraryDerivedAddresses.length === 0) return;

      setIsSubmitting(true);
      try {
        const primary = arbitraryDerivedAddresses[0];
        if (!primary) throw new Error('No enabled bioforest chains');
        const hue = deriveThemeHue(primary.address);

        const chainAddresses = arbitraryDerivedAddresses.map((item) => ({
          chain: item.chainId,
          address: item.address,
          publicKey: '',
          tokens: [],
        }));

        const wallet = await walletActions.createWallet(
          {
            name: t('wallet:defaultName'),
            keyType: 'arbitrary',
            address: primary.address,
            chain: primary.chainId,
            chainAddresses,
            themeHue: hue,
          },
          secret,
          walletPassword,
          hue
        );

        setCreatedWalletId(wallet.id);
        setStep('theme');
      } catch (error) {
        console.error('导入密钥钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [arbitraryDerivedAddresses, arbitrarySecret, t],
  );

  const handleEditOnlyComplete = useCallback(() => {
    navigate({ to: '/', replace: true });
  }, [navigate]);

  const handleChainsContinue = useCallback(async () => {
    if (isSubmitting) return;

    if (keyType === 'arbitrary') {
      await createArbitraryWallet(patternKey);
      return;
    }

    if (mnemonic.length === 0) {
      return;
    }

    await createWallet(mnemonic, patternKey);
  }, [createArbitraryWallet, createWallet, isSubmitting, keyType, mnemonic, patternKey]);

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      {step === 'keyType' && (
        <>
          <PageHeader title={t('onboarding:keyType.title')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div data-testid="key-type-step" className="flex-1 space-y-6 p-4">
            <KeyTypeSelector
              value={keyType}
              onChange={(next) => {
                setKeyType(next);
                if (next === 'mnemonic') {
                  setArbitrarySecret('');
                  setArbitraryDerivedAddresses([]);
                }
              }}
            />
            <Button type="button" data-testid="continue-button" onClick={handleKeyTypeContinue} className="w-full">
              {t('common:continue')}
            </Button>
          </div>
        </>
      )}

      {step === 'mnemonic' && (
        <>
          <PageHeader title={t('onboarding:recover.title')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div data-testid="mnemonic-step" className="flex-1 p-4">
            <RecoverWalletForm onSubmit={handleMnemonicSubmit} isSubmitting={duplicateDetection.isChecking} />
          </div>
        </>
      )}

      {step === 'arbitrary' && (
        <>
          <PageHeader title={t('onboarding:keyType.arbitrary')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div className="flex-1 space-y-4 p-4">
            <ArbitraryKeyInput
              value={arbitrarySecret}
              onChange={(next) => {
                setArbitraryError(null);
                setArbitrarySecret(next);
              }}
              disabled={isSubmitting}
            />
            {arbitraryError && (
              <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{arbitraryError}</span>
              </div>
            )}
            <ChainAddressPreview
              secret={arbitrarySecret}
              enabledBioforestChainConfigs={chainConfigSnapshot ? enabledBioforestChainConfigs : undefined}
              onDerived={setArbitraryDerivedAddresses}
            />
            <Button
              type="button"
              className="w-full"
              disabled={isSubmitting || (arbitrarySecret.trim() !== '' && arbitraryDerivedAddresses.length === 0)}
              onClick={() => {
                if (!arbitrarySecret.trim()) {
                  setArbitraryError(t('onboarding:arbitraryKey.required'));
                  return;
                }

                goToPatternStep();
              }}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t('common:continue')}
            </Button>
          </div>
        </>
      )}

      {step === 'collision' && (
        <>
          <PageHeader title={t('onboarding:recover.addressConflict')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div className="flex-1 p-4">
            <CollisionConfirmDialog
              result={duplicateDetection.result}
              onConfirm={handleCollisionConfirm}
              onCancel={handleCollisionCancel}
              isLoading={isSubmitting}
            />
          </div>
        </>
      )}

      {step === 'pattern' && (
        <>
          <PageHeader title={t('onboarding:recover.setWalletLock')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div data-testid="pattern-step" className="flex-1 p-4">
            <PatternLockSetup
              onComplete={handlePatternComplete}
              minPoints={4}
            />
          </div>
        </>
      )}

      {step === 'chains' && (
        <>
          <PageHeader title={t('onboarding:chainSelector.title')} onBack={handleBack} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div data-testid="chains-step" className="flex-1 p-4">
            <div className="space-y-6">
              <div className="text-center">
                <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
                <h2 className="text-xl font-bold">{t('onboarding:chainSelector.title')}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:chainSelector.subtitle')}</p>
              </div>

              {chainConfigs.length === 0 ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (
                <ChainSelector
                  data-testid="chain-selector"
                  chains={chainConfigs}
                  selectedChains={selectedChainIds}
                  onSelectionChange={setSelectedChainIds}
                />
              )}

              <GradientButton
                variant="mint"
                className="w-full"
                data-testid="chains-continue-button"
                disabled={selectedChainIds.length === 0}
                onClick={handleChainsContinue}
              >
                {t('common:next')}
              </GradientButton>
            </div>
          </div>
        </>
      )}

      {step === 'theme' && createdWalletId && (
        <>
          <PageHeader title={t('onboarding:create.themeTitle')} />
          <div className="px-4 pt-4">
            <ProgressSteps total={5} current={currentStepIndex} />
          </div>
          <div data-testid="theme-step" className="flex-1 p-4">
            <WalletConfig
              mode="edit-only"
              walletId={createdWalletId}
              onEditOnlyComplete={handleEditOnlyComplete}
            />
          </div>
        </>
      )}

      {step === 'success' && (
        <ImportWalletSuccess
          walletName={t('wallet:defaultName')}
          onEnterWallet={handleEnterWallet}
        />
      )}
    </div>
  );
}
