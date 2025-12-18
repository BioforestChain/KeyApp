import { useState, useCallback } from 'react';
import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/page-header';
import { RecoverWalletForm, type RecoverWalletFormData } from '@/components/onboarding/recover-wallet-form';
import { KeyTypeSelector, type WalletKeyType } from '@/components/onboarding/key-type-selector';
import { ArbitraryKeyInput } from '@/components/onboarding/arbitrary-key-input';
import { SecurityWarningDialog } from '@/components/onboarding/security-warning-dialog';
import { ChainAddressPreview, type DerivedAddress } from '@/components/onboarding/chain-address-preview';
import { CollisionConfirmDialog } from '@/components/onboarding/collision-confirm-dialog';
import { CreateWalletSuccess } from '@/components/onboarding/create-wallet-success';
import { PasswordInput } from '@/components/security/password-input';
import { Button } from '@/components/ui/button';
import { useDuplicateDetection } from '@/hooks/use-duplicate-detection';
import { encrypt, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import type { IWalletQuery } from '@/services/wallet/types';
import { IconAlertCircle as AlertCircle, IconLoader2 as Loader2 } from '@tabler/icons-react';

type Step = 'keyType' | 'mnemonic' | 'arbitrary' | 'password' | 'collision' | 'success';

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
  const { navigate } = useNavigation();
  const { t } = useTranslation(['onboarding', 'common', 'wallet']);
  const chainConfigSnapshot = useChainConfigState().snapshot;
  const enabledBioforestChainConfigs = useEnabledBioforestChainConfigs();
  const [step, setStep] = useState<Step>('keyType');
  const [keyType, setKeyType] = useState<WalletKeyType>('mnemonic');
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [arbitrarySecret, setArbitrarySecret] = useState('');
  const [arbitraryError, setArbitraryError] = useState<string | null>(null);
  const [arbitraryDerivedAddresses, setArbitraryDerivedAddresses] = useState<DerivedAddress[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveredWalletName, setRecoveredWalletName] = useState('');

  // Duplicate detection hook
  const duplicateDetection = useDuplicateDetection(mockWalletQuery);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'keyType':
        navigate({ to: '/' });
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
      case 'password':
        setPassword('');
        setConfirmPassword('');
        setPasswordError(null);
        setStep(keyType === 'arbitrary' ? 'arbitrary' : 'mnemonic');
        break;
      case 'success':
        // Can't go back from success
        break;
    }
  }, [step, navigate, duplicateDetection, keyType]);

  const goToPasswordStep = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setStep('password');
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

    setShowSecurityWarning(true);
  }, [keyType, securityAcknowledged]);

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
      goToPasswordStep();
    },
    [duplicateDetection, goToPasswordStep],
  );

  const handleCollisionConfirm = useCallback(async () => {
    // User confirmed replacement - proceed with wallet creation
    // TODO: Delete the old private key wallet first
    goToPasswordStep();
  }, [goToPasswordStep]);

  const handleCollisionCancel = useCallback(() => {
    setStep('mnemonic');
    duplicateDetection.reset();
  }, [duplicateDetection]);

  const createWallet = useCallback(
    async (words: string[], walletPassword: string) => {
      setIsSubmitting(true);

      try {
        const mnemonicStr = words.join(' ');

        // Generate wallet name (auto-increment pattern)
        // TODO: Use wallet storage service for actual name generation
        const walletName = `钱包 ${Date.now() % 1000}`;

        const encryptedMnemonic = await encrypt(mnemonicStr, walletPassword);

        // Derive external chain addresses (BIP44)
        const externalKeys = deriveMultiChainKeys(mnemonicStr, ['ethereum', 'bitcoin', 'tron'], 0);

        // Derive BioForest chain addresses (Ed25519)
        const bioforestChainAddresses = deriveBioforestAddresses(
          mnemonicStr,
          chainConfigSnapshot ? enabledBioforestChainConfigs : undefined,
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

        // Create wallet with skipBackup=true (recovery doesn't need backup prompt)
        walletActions.createWallet({
          name: walletName,
          keyType: 'mnemonic',
          address: ethKey.address,
          chain: 'ethereum',
          chainAddresses,
          encryptedMnemonic,
        });

        setRecoveredWalletName(walletName);
        setStep('success');
      } catch (error) {
        console.error('恢复钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [chainConfigSnapshot, enabledBioforestChainConfigs],
  );

  const createArbitraryWallet = useCallback(
    async (walletPassword: string) => {
      const secret = arbitrarySecret.trim();
      if (!secret) return;
      if (arbitraryDerivedAddresses.length === 0) return;

      setIsSubmitting(true);
      try {
        const walletName = `${t('wallet:wallet')} ${Date.now() % 1000}`;

        const encryptedMnemonic = await encrypt(secret, walletPassword);

        const chainAddresses = arbitraryDerivedAddresses.map((item) => ({
          chain: item.chainId,
          address: item.address,
          tokens: [],
        }));

        const primary = chainAddresses[0];
        if (!primary) throw new Error('No enabled bioforest chains');

        walletActions.createWallet({
          name: walletName,
          keyType: 'arbitrary',
          address: primary.address,
          chain: primary.chain,
          chainAddresses,
          encryptedMnemonic,
        });

        setRecoveredWalletName(walletName);
        setStep('success');
      } catch (error) {
        console.error('导入密钥钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [arbitraryDerivedAddresses, arbitrarySecret],
  );

  const handlePasswordContinue = useCallback(async () => {
    if (isSubmitting) return;

    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError(t('onboarding:recover.errors.minLength'));
      return;
    }

    if (/\s/.test(password)) {
      setPasswordError(t('onboarding:recover.errors.noSpaces'));
      return;
    }

    if (confirmPassword !== password) {
      setPasswordError(t('onboarding:recover.errors.mismatch'));
      return;
    }

    if (keyType === 'arbitrary') {
      await createArbitraryWallet(password);
      return;
    }

    if (mnemonic.length === 0) {
      setPasswordError(t('onboarding:recover.errors.mnemonicIncomplete'));
      return;
    }

    await createWallet(mnemonic, password);
  }, [confirmPassword, createArbitraryWallet, createWallet, isSubmitting, keyType, mnemonic, password]);

  const handleBackup = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      {step === 'keyType' && (
        <>
          <PageHeader title={t('onboarding:keyType.title')} onBack={handleBack} />
          <div className="flex-1 space-y-6 p-4">
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
            <Button type="button" onClick={handleKeyTypeContinue} className="w-full">
              {t('common:continue')}
            </Button>
          </div>
        </>
      )}

      {step === 'mnemonic' && (
        <>
          <PageHeader title={t('onboarding:recover.title')} onBack={handleBack} />
          <div className="flex-1 p-4">
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

                goToPasswordStep();
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

      {step === 'password' && (
        <>
          <PageHeader title={t('onboarding:recover.setPassword')} onBack={handleBack} />
          <div className="flex-1 p-4">
            <div className="space-y-5">
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>{t('onboarding:recover.passwordHint')}</p>
                <p>{t('onboarding:recover.passwordRule')}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('onboarding:recover.password')}</label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('onboarding:recover.passwordPlaceholder')}
                    showStrength
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('onboarding:recover.confirmPassword')}</label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('onboarding:recover.confirmPlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>

                {passwordError && (
                  <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => {
                  void handlePasswordContinue();
                }}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {t('common:continue')}
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 'success' && (
        <CreateWalletSuccess
          walletName={recoveredWalletName}
          skipBackup={true}
          onBackup={handleBackup}
          onEnterWallet={handleEnterWallet}
        />
      )}

      <SecurityWarningDialog
        open={showSecurityWarning}
        onOpenChange={setShowSecurityWarning}
        onConfirm={() => {
          setSecurityAcknowledged(true);
          setStep('arbitrary');
        }}
        onCancel={() => {
          setKeyType('mnemonic');
        }}
      />
    </div>
  );
}
