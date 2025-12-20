import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import {
  CreateWalletForm,
  type CreateWalletFormData,
  type MnemonicOptions,
} from '@/components/onboarding/create-wallet-form';
import { MnemonicOptionsSheet } from '@/components/onboarding/mnemonic-options-sheet';
import { CreateWalletSuccess } from '@/components/onboarding/create-wallet-success';
import { BackupTipsSheet } from '@/components/onboarding/backup-tips-sheet';
import { MnemonicDisplay } from '@/components/security/mnemonic-display';
import { MnemonicConfirmBackup } from '@/components/onboarding/mnemonic-confirm-backup';
import { useMnemonicVerification } from '@/hooks/use-mnemonic-verification';
import { generateMnemonic, deriveMultiChainKeys, deriveBioforestAddresses } from '@/lib/crypto';
import { useChainConfigState, useEnabledBioforestChainConfigs, walletActions } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  IconArrowLeft as ArrowLeft,
  IconChevronRight as ArrowRight,
  IconCircleCheck as CheckCircle,
} from '@tabler/icons-react';

type Step = 'form' | 'success' | 'backup-tips' | 'backup-display' | 'backup-confirm' | 'backup-complete';

/**
 * Onboarding create wallet page
 * Implements the create-flow and backup-verification per openspec changes
 */
export function OnboardingCreatePage() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { navigate } = useNavigation();
  const chainConfigSnapshot = useChainConfigState().snapshot;
  const enabledBioforestChainConfigs = useEnabledBioforestChainConfigs();
  const [step, setStep] = useState<Step>('form');
  const [mnemonicOptions, setMnemonicOptions] = useState<MnemonicOptions>({
    language: 'english',
    length: 12,
  });
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdWalletName, setCreatedWalletName] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [showBackupTips, setShowBackupTips] = useState(false);

  // Verification hook for backup confirmation
  const verification = useMnemonicVerification(generatedMnemonic);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'form':
        navigate({ to: '/' });
        break;
      case 'success':
        // Can't go back from success
        break;
      case 'backup-tips':
        setShowBackupTips(false);
        break;
      case 'backup-display':
        setStep('success');
        setShowBackupTips(true);
        break;
      case 'backup-confirm':
        setStep('backup-display');
        verification.reset();
        break;
      case 'backup-complete':
        // Can't go back from complete
        break;
    }
  }, [step, navigate, verification]);

  const handleSubmit = useCallback(
    async (data: CreateWalletFormData) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Generate mnemonic based on options
        const mnemonic = generateMnemonic();
        const mnemonicStr = mnemonic.join(' ');

        // Store mnemonic for backup verification
        setGeneratedMnemonic(mnemonic);

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

        // Create wallet (encryption handled by walletActions)
        await walletActions.createWallet(
          {
            name: data.name,
            keyType: 'mnemonic',
            address: ethKey.address,
            chain: 'ethereum',
            chainAddresses,
          },
          mnemonicStr,
          data.password
        );

        setCreatedWalletName(data.name);
        setStep('success');
      } catch (error) {
        console.error('创建钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [chainConfigSnapshot, enabledBioforestChainConfigs, isSubmitting],
  );

  const handleStartBackup = useCallback(() => {
    setShowBackupTips(true);
  }, []);

  const handleBackupTipsProceed = useCallback(() => {
    setShowBackupTips(false);
    setStep('backup-display');
  }, []);

  const handleBackupTipsSkip = useCallback(() => {
    setShowBackupTips(false);
    // Stay on success, user chose to skip
  }, []);

  const handleDisplayConfirm = useCallback(() => {
    verification.reset(); // Generate fresh verification challenge
    setStep('backup-confirm');
  }, [verification]);

  const handleVerificationComplete = useCallback(() => {
    setStep('backup-complete');
    // TODO: Update wallet skipBackup=false when settings system is implemented
  }, []);

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  // Render based on current step
  return (
    <div className="flex min-h-screen flex-col">
      {/* Form step */}
      {step === 'form' && (
        <>
          <PageHeader title={t('onboarding:create.title')} onBack={handleBack} />
          <div className="flex-1 p-4">
            <CreateWalletForm
              onSubmit={handleSubmit}
              onOpenMnemonicOptions={() => setShowOptionsSheet(true)}
              mnemonicOptions={mnemonicOptions}
              isSubmitting={isSubmitting}
            />
          </div>

          <MnemonicOptionsSheet
            open={showOptionsSheet}
            onClose={() => setShowOptionsSheet(false)}
            onConfirm={setMnemonicOptions}
            value={mnemonicOptions}
          />
        </>
      )}

      {/* Success step */}
      {step === 'success' && (
        <>
          <CreateWalletSuccess
            walletName={createdWalletName}
            skipBackup={true}
            onBackup={handleStartBackup}
            onEnterWallet={handleEnterWallet}
          />
          <BackupTipsSheet
            open={showBackupTips}
            onClose={() => setShowBackupTips(false)}
            onProceed={handleBackupTipsProceed}
            onSkip={handleBackupTipsSkip}
          />
        </>
      )}

      {/* Backup display step */}
      {step === 'backup-display' && (
        <>
          <PageHeader title={t('onboarding:create.backupMnemonic')} onBack={handleBack} />
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-6 text-center">
              <p className="text-muted-foreground text-sm">{t('onboarding:create.backupHint')}</p>
            </div>

            <div className="flex-1">
              <MnemonicDisplay words={generatedMnemonic} />
            </div>

            <div className="mt-6 space-y-3">
              <Button onClick={handleDisplayConfirm} className="w-full" size="lg">
                {t('onboarding:create.confirmWritten')}
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button onClick={handleBack} variant="ghost" className="text-muted-foreground w-full">
                <ArrowLeft className="mr-2 size-4" />
                {t('common:back')}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Backup confirm step */}
      {step === 'backup-confirm' && (
        <>
          <PageHeader title={t('onboarding:create.verifyMnemonic')} onBack={handleBack} />
          <div className="flex-1 p-4">
            <MnemonicConfirmBackup
              slots={verification.state.slots}
              candidates={verification.state.candidates}
              usedWords={verification.state.usedWords}
              nextEmptySlotIndex={verification.nextEmptySlotIndex}
              isComplete={verification.state.isComplete}
              onSelectWord={verification.selectWord}
              onDeselectSlot={verification.deselectSlot}
              onComplete={handleVerificationComplete}
            />
          </div>
        </>
      )}

      {/* Backup complete step */}
      {step === 'backup-complete' && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">{t('onboarding:create.backupComplete')}</h1>
          <p className="text-muted-foreground mb-8 text-center">{t('onboarding:create.backupSuccessDesc')}</p>

          <Button onClick={handleEnterWallet} size="lg" className="w-full max-w-xs">
            {t('onboarding:create.enterWallet')}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
