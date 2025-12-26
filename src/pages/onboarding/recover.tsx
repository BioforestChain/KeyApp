import { useState, useCallback } from 'react';
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
import { ThemeSelector } from '@/components/onboarding/theme-selector';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/common/gradient-button';
import { IconCircle } from '@/components/common/icon-circle';
import { useDuplicateDetection } from '@/hooks/use-duplicate-detection';
import { deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';
import { deriveThemeHue } from '@/hooks/useWalletTheme';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import type { IWalletQuery } from '@/services/wallet/types';
import { IconAlertCircle as AlertCircle, IconLoader2 as Loader2, IconPalette as Palette } from '@tabler/icons-react';

type Step = 'keyType' | 'mnemonic' | 'arbitrary' | 'pattern' | 'theme' | 'collision' | 'success';

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
  const [recoveredWalletName, setRecoveredWalletName] = useState('');
  const [themeHue, setThemeHue] = useState(0);
  const [patternKey, setPatternKey] = useState('');

  // Duplicate detection hook
  const duplicateDetection = useDuplicateDetection(mockWalletQuery);

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
      case 'theme':
        setStep('pattern');
        break;
      case 'success':
        // Can't go back from success
        break;
    }
  }, [step, goBack, duplicateDetection, keyType]);

  const goToPatternStep = useCallback(() => {
    // 设置初始 themeHue
    const secret = keyType === 'arbitrary' ? arbitrarySecret : mnemonic.join(' ');
    setThemeHue(deriveThemeHue(secret));
    setStep('pattern');
  }, [keyType, arbitrarySecret, mnemonic]);

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
    async (words: string[], walletPassword: string, hue: number) => {
      setIsSubmitting(true);

      try {
        const mnemonicStr = words.join(' ');

        // Generate wallet name (auto-increment pattern)
        const walletName = `钱包 ${Date.now() % 1000}`;

        // Derive external chain addresses (BIP44)
        const externalKeys = deriveMultiChainKeys(mnemonicStr, ['ethereum', 'bitcoin', 'tron'], 0);

        // Derive BioForest chain addresses (Ed25519)
        const bioforestConfigs = enabledBioforestChainConfigs.length > 0 ? enabledBioforestChainConfigs : undefined;
        const bioforestChainAddresses = deriveBioforestAddresses(
          mnemonicStr,
          bioforestConfigs,
        ).map((item) => ({
          chain: item.chainId,
          address: item.address,
          tokens: [],
        }));

        const ethKey = externalKeys.find((k) => k.chain === 'ethereum')!;

        // Combine all chain addresses
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
            name: walletName,
            keyType: 'mnemonic',
            address: ethKey.address,
            chain: 'ethereum',
            chainAddresses,
            themeHue: hue,
          },
          mnemonicStr,
          walletPassword,
          hue
        );

        setRecoveredWalletName(walletName);
        setStep('success');
      } catch (error) {
        console.error('恢复钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [enabledBioforestChainConfigs],
  );

  const createArbitraryWallet = useCallback(
    async (walletPassword: string, hue: number) => {
      const secret = arbitrarySecret.trim();
      if (!secret) return;
      if (arbitraryDerivedAddresses.length === 0) return;

      setIsSubmitting(true);
      try {
        const walletName = `${t('wallet:wallet')} ${Date.now() % 1000}`;

        const chainAddresses = arbitraryDerivedAddresses.map((item) => ({
          chain: item.chainId,
          address: item.address,
          tokens: [],
        }));

        const primary = chainAddresses[0];
        if (!primary) throw new Error('No enabled bioforest chains');

        await walletActions.createWallet(
          {
            name: walletName,
            keyType: 'arbitrary',
            address: primary.address,
            chain: primary.chain,
            chainAddresses,
            themeHue: hue,
          },
          secret,
          walletPassword,
          hue
        );

        setRecoveredWalletName(walletName);
        setStep('success');
      } catch (error) {
        console.error('导入密钥钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [arbitraryDerivedAddresses, arbitrarySecret, t],
  );

  const handlePatternComplete = useCallback((key: string) => {
    setPatternKey(key);
    setStep('theme');
  }, []);

  const handleThemeComplete = useCallback(async () => {
    if (isSubmitting) return;

    if (keyType === 'arbitrary') {
      await createArbitraryWallet(patternKey, themeHue);
      return;
    }

    if (mnemonic.length === 0) {
      return;
    }

    await createWallet(mnemonic, patternKey, themeHue);
  }, [createArbitraryWallet, createWallet, isSubmitting, keyType, mnemonic, patternKey, themeHue]);

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      {step === 'keyType' && (
        <>
          <PageHeader title={t('onboarding:keyType.title')} onBack={handleBack} />
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
          <div data-testid="mnemonic-step" className="flex-1 p-4">
            <RecoverWalletForm onSubmit={handleMnemonicSubmit} isSubmitting={duplicateDetection.isChecking} />
          </div>
        </>
      )}

      {step === 'arbitrary' && (
        <>
          <PageHeader title={t('onboarding:keyType.arbitrary')} onBack={handleBack} />
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
          <div data-testid="pattern-step" className="flex-1 p-4">
            <PatternLockSetup
              onComplete={handlePatternComplete}
              minPoints={4}
            />
          </div>
        </>
      )}

      {step === 'theme' && (
        <>
          <PageHeader title={t('onboarding:create.themeTitle')} onBack={handleBack} />
          <div data-testid="theme-step" className="flex-1 p-4">
            <div className="space-y-6">
              <div className="text-center">
                <IconCircle icon={Palette} variant="primary" size="lg" className="mx-auto mb-4" />
                <h2 className="text-xl font-bold">{t('onboarding:create.themeTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:create.themeSubtitle')}</p>
              </div>

              <ThemeSelector
                secret={keyType === 'arbitrary' ? arbitrarySecret : mnemonic.join(' ')}
                value={themeHue}
                onChange={setThemeHue}
              />

              <GradientButton
                variant="mint"
                className="w-full"
                data-testid="theme-complete-button"
                disabled={isSubmitting}
                onClick={handleThemeComplete}
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : t('onboarding:import.complete')}
              </GradientButton>
            </div>
          </div>
        </>
      )}

      {step === 'success' && (
        <ImportWalletSuccess
          walletName={recoveredWalletName}
          onEnterWallet={handleEnterWallet}
        />
      )}
    </div>
  );
}
