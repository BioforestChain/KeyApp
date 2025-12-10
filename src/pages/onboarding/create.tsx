import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/layout/page-header';
import {
  CreateWalletForm,
  type CreateWalletFormData,
  type MnemonicOptions,
} from '@/components/onboarding/create-wallet-form';
import { MnemonicOptionsSheet } from '@/components/onboarding/mnemonic-options-sheet';
import { CreateWalletSuccess } from '@/components/onboarding/create-wallet-success';
import { generateMnemonic, encrypt, deriveMultiChainKeys, deriveBioforestMultiChainKeys } from '@/lib/crypto';
import type { BioforestChainType } from '@/lib/crypto';
import { walletActions } from '@/stores';

type Step = 'form' | 'success';

/**
 * Onboarding create wallet page
 * Implements the create-flow slice of wallet onboarding per openspec/changes/add-wallet-create-flow
 */
export function OnboardingCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [mnemonicOptions, setMnemonicOptions] = useState<MnemonicOptions>({
    language: 'english',
    length: 12,
  });
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdWalletName, setCreatedWalletName] = useState('');

  const handleBack = useCallback(() => {
    if (step === 'success') {
      // Can't go back from success
      return;
    }
    navigate({ to: '/' });
  }, [step, navigate]);

  const handleSubmit = useCallback(
    async (data: CreateWalletFormData) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Generate mnemonic based on options
        // Note: generateMnemonic currently only supports 12-word English
        // TODO: Support language and length options when bip39 lib is extended
        const mnemonic = generateMnemonic();
        const mnemonicStr = mnemonic.join(' ');

        // Encrypt mnemonic with password
        const encryptedMnemonic = await encrypt(mnemonicStr, data.password);

        // Derive external chain addresses (BIP44)
        const externalKeys = deriveMultiChainKeys(mnemonicStr, ['ethereum', 'bitcoin', 'tron'], 0);

        // Derive BioForest chain addresses (Ed25519)
        const bioforestChains: BioforestChainType[] = ['bfmeta', 'pmchain', 'ccchain'];
        const bioforestKeys = deriveBioforestMultiChainKeys(mnemonicStr, bioforestChains);

        const ethKey = externalKeys.find((k) => k.chain === 'ethereum')!;

        // Combine all chain addresses
        const chainAddresses = [
          ...externalKeys.map((key) => ({
            chain: key.chain as 'ethereum' | 'bitcoin' | 'tron',
            address: key.address,
            tokens: [],
          })),
          ...bioforestKeys.map((key) => ({
            chain: key.chain,
            address: key.address,
            tokens: [],
          })),
        ];

        // Create wallet with skipBackup=true (per spec)
        walletActions.createWallet({
          name: data.name,
          address: ethKey.address,
          chain: 'ethereum',
          chainAddresses,
          encryptedMnemonic,
          // Note: skipBackup would be stored in wallet settings
        });

        // Store password hint if provided
        // TODO: Store tip in wallet settings when settings system is implemented

        setCreatedWalletName(data.name);
        setStep('success');
      } catch (error) {
        console.error('创建钱包失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting],
  );

  const handleBackup = useCallback(() => {
    // Navigate to backup flow
    // TODO: Implement backup route when add-wallet-backup-and-biometrics change is implemented
    navigate({ to: '/' });
  }, [navigate]);

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      {step === 'form' && (
        <>
          <PageHeader title="创建钱包" onBack={handleBack} />
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

      {step === 'success' && (
        <CreateWalletSuccess
          walletName={createdWalletName}
          skipBackup={true}
          onBackup={handleBackup}
          onEnterWallet={handleEnterWallet}
        />
      )}
    </div>
  );
}
