import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import {
  RecoverWalletForm,
  type RecoverWalletFormData,
} from '@/components/onboarding/recover-wallet-form'
import { CollisionConfirmDialog } from '@/components/onboarding/collision-confirm-dialog'
import { CreateWalletSuccess } from '@/components/onboarding/create-wallet-success'
import { useDuplicateDetection } from '@/hooks/use-duplicate-detection'
import { encrypt, deriveMultiChainKeys, deriveBioforestMultiChainKeys } from '@/lib/crypto'
import type { BioforestChainType } from '@/lib/crypto'
import { walletActions } from '@/stores'
import type { IWalletQuery } from '@/services/wallet/types'

type Step = 'mnemonic' | 'password' | 'collision' | 'success'

// Mock wallet query for now - will be replaced with real implementation
const mockWalletQuery: IWalletQuery = {
  getAllAddresses: async () => [],
  getAllMainWallets: async () => [],
  findWalletByAddress: async () => null,
}

/**
 * Onboarding recover wallet page
 * Implements wallet recovery with duplicate detection per openspec/changes/add-wallet-recover-duplicate-guards
 */
export function OnboardingRecoverPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('mnemonic')
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recoveredWalletName, setRecoveredWalletName] = useState('')

  // Duplicate detection hook
  const duplicateDetection = useDuplicateDetection(mockWalletQuery)

  const handleBack = useCallback(() => {
    switch (step) {
      case 'mnemonic':
        navigate({ to: '/' })
        break
      case 'collision':
        setStep('mnemonic')
        duplicateDetection.reset()
        break
      case 'password':
        setStep('mnemonic')
        break
      case 'success':
        // Can't go back from success
        break
    }
  }, [step, navigate, duplicateDetection])

  const handleMnemonicSubmit = useCallback(
    async (data: RecoverWalletFormData) => {
      setMnemonic(data.mnemonic)

      // Check for duplicates
      const result = await duplicateDetection.check(data.mnemonic)

      if (result.isDuplicate) {
        if (result.type === 'address') {
          // Simple duplicate - show error toast
          // Toast: "该助记词已导入"
          console.log('Duplicate detected:', result.matchedWallet?.name)
          return
        } else if (result.type === 'privateKey') {
          // Private key collision - show confirmation dialog
          setStep('collision')
          return
        }
      }

      // No duplicate - proceed to password setup (or directly create for now)
      setStep('password')
      // For now, we skip password step and create directly
      await createWallet(data.mnemonic)
    },
    [duplicateDetection],
  )

  const handleCollisionConfirm = useCallback(async () => {
    // User confirmed replacement - proceed with wallet creation
    // TODO: Delete the old private key wallet first
    await createWallet(mnemonic)
  }, [mnemonic])

  const handleCollisionCancel = useCallback(() => {
    setStep('mnemonic')
    duplicateDetection.reset()
  }, [duplicateDetection])

  const createWallet = useCallback(
    async (words: string[]) => {
      setIsSubmitting(true)

      try {
        const mnemonicStr = words.join(' ')

        // Generate wallet name (auto-increment pattern)
        // TODO: Use wallet storage service for actual name generation
        const walletName = `钱包 ${Date.now() % 1000}`

        // Encrypt mnemonic with a default password for now
        // TODO: Implement password step
        const defaultPassword = 'temp-password'
        const encryptedMnemonic = await encrypt(mnemonicStr, defaultPassword)

        // Derive external chain addresses (BIP44)
        const externalKeys = deriveMultiChainKeys(mnemonicStr, ['ethereum', 'bitcoin', 'tron'], 0)

        // Derive BioForest chain addresses (Ed25519)
        const bioforestChains: BioforestChainType[] = ['bfmeta', 'pmchain', 'ccchain']
        const bioforestKeys = deriveBioforestMultiChainKeys(mnemonicStr, bioforestChains)

        const ethKey = externalKeys.find((k) => k.chain === 'ethereum')!

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
        ]

        // Create wallet with skipBackup=true (recovery doesn't need backup prompt)
        walletActions.createWallet({
          name: walletName,
          address: ethKey.address,
          chain: 'ethereum',
          chainAddresses,
          encryptedMnemonic,
        })

        setRecoveredWalletName(walletName)
        setStep('success')
      } catch (error) {
        console.error('恢复钱包失败:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  const handleBackup = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  const handleEnterWallet = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col">
      {step === 'mnemonic' && (
        <>
          <PageHeader title="恢复钱包" onBack={handleBack} />
          <div className="flex-1 p-4">
            <RecoverWalletForm
              onSubmit={handleMnemonicSubmit}
              isSubmitting={duplicateDetection.isChecking}
            />
          </div>
        </>
      )}

      {step === 'collision' && (
        <>
          <PageHeader title="地址冲突" onBack={handleBack} />
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
          <PageHeader title="设置密码" onBack={handleBack} />
          <div className="flex-1 p-4">
            {/* TODO: PasswordSetupForm - reuse from create flow */}
            <p className="text-muted-foreground">密码设置步骤（待实现）</p>
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
    </div>
  )
}
