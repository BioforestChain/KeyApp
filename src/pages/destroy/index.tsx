/**
 * DestroyPage - 资产销毁页面
 * 
 * 仅支持 BioForest 链，主资产不可销毁
 */

import { useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation, useActivityParams, useFlow } from '@/stackflow'
import { setTransferConfirmCallback, setTransferWalletLockCallback } from '@/stackflow/activities/sheets'
import { PageHeader } from '@/components/layout/page-header'
import { AssetSelector } from '@/components/asset'
import { AmountInput } from '@/components/transfer/amount-input'
import { GradientButton, Alert } from '@/components/common'
import { ChainIcon } from '@/components/wallet/chain-icon'
import { SendResult } from '@/components/transfer/send-result'
import { useToast, useHaptics } from '@/services'
import { useBurn } from '@/hooks/use-burn'
import { Amount } from '@/types/amount'
import type { AssetInfo } from '@/types/asset'
import type { TokenInfo } from '@/components/token/token-item'
import { IconFlame } from '@tabler/icons-react'
import {
  useChainConfigState,
  chainConfigSelectors,
  useCurrentChainAddress,
  useCurrentWallet,
  useSelectedChain,
  useCurrentChainTokens,
  type ChainType,
} from '@/stores'

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
}

/** Convert TokenInfo to AssetInfo */
function tokenToAsset(token: TokenInfo): AssetInfo {
  return {
    assetType: token.symbol,
    name: token.name,
    amount: Amount.fromFormatted(token.balance, token.decimals ?? 8, token.symbol),
    decimals: token.decimals ?? 8,
    logoUrl: token.icon,
  }
}

/** Convert AssetInfo to TokenInfo */
function assetToToken(asset: AssetInfo, chain: ChainType): TokenInfo {
  return {
    symbol: asset.assetType,
    name: asset.name ?? asset.assetType,
    balance: asset.amount.toFormatted(),
    decimals: asset.decimals,
    chain,
    icon: asset.logoUrl,
  }
}

export function DestroyPage() {
  const { t } = useTranslation(['transaction', 'common', 'security'])
  const { goBack: navGoBack } = useNavigation()
  const { push } = useFlow()
  const toast = useToast()
  const haptics = useHaptics()
  const isWalletLockSheetOpen = useRef(false)

  // Read params
  const { assetType: initialAssetType, assetLocked: assetLockedParam } = useActivityParams<{
    assetType?: string
    assetLocked?: string
  }>()

  const selectedChain = useSelectedChain()
  const currentWallet = useCurrentWallet()
  const currentChainAddress = useCurrentChainAddress()
  const chainConfigState = useChainConfigState()
  const chainConfig = chainConfigState.snapshot
    ? chainConfigSelectors.getChainById(chainConfigState, selectedChain)
    : null
  const selectedChainName = chainConfig?.name ?? CHAIN_NAMES[selectedChain] ?? selectedChain
  const tokens = useCurrentChainTokens()

  // Filter out main asset (cannot be destroyed)
  const destroyableTokens = useMemo(() => {
    if (!chainConfig) return []
    return tokens.filter((token) => token.symbol.toUpperCase() !== chainConfig.symbol.toUpperCase())
  }, [tokens, chainConfig])

  // Find initial asset from params
  const initialAsset = useMemo(() => {
    if (!initialAssetType || destroyableTokens.length === 0) return null
    const found = destroyableTokens.find(
      (t) => t.symbol.toUpperCase() === initialAssetType.toUpperCase()
    )
    return found ? tokenToAsset(found) : null
  }, [initialAssetType, destroyableTokens])

  const assetLocked = assetLockedParam === 'true'

  const { 
    state, 
    setAmount, 
    setAsset, 
    goToConfirm, 
    submit, 
    submitWithTwoStepSecret, 
    reset, 
    canProceed 
  } = useBurn({
    initialAsset: initialAsset ?? undefined,
    assetLocked,
    useMock: false,
    walletId: currentWallet?.id,
    fromAddress: currentChainAddress?.address,
    chainConfig,
  })

  // Handle asset selection
  const handleAssetSelect = useCallback((token: TokenInfo) => {
    setAsset(tokenToAsset(token))
  }, [setAsset])

  // Selected token for AssetSelector
  const selectedToken = useMemo(() => {
    if (!state.asset) return null
    return assetToToken(state.asset, selectedChain)
  }, [state.asset, selectedChain])

  // Derive formatted values for display
  const balance = state.asset?.amount ?? null
  const symbol = state.asset?.assetType ?? 'TOKEN'

  const handleProceed = () => {
    if (!goToConfirm()) return

    haptics.impact('light')

    // Set up callback: TransferConfirm -> TransferWalletLock
    setTransferConfirmCallback(
      async () => {
        if (isWalletLockSheetOpen.current) return
        isWalletLockSheetOpen.current = true

        await haptics.impact('medium')

        setTransferWalletLockCallback(async (walletLockKey: string, twoStepSecret?: string) => {
          if (!twoStepSecret) {
            const result = await submit(walletLockKey)
            
            if (result.status === 'password') {
              return { status: 'wallet_lock_invalid' as const }
            }
            
            if (result.status === 'two_step_secret_required') {
              return { status: 'two_step_secret_required' as const }
            }
            
            if (result.status === 'ok') {
              isWalletLockSheetOpen.current = false
              return { status: 'ok' as const, txHash: result.txHash, pendingTxId: result.pendingTxId }
            }
            
            if (result.status === 'error') {
              return { status: 'error' as const, message: result.message, pendingTxId: result.pendingTxId }
            }
            
            return { status: 'error' as const, message: '销毁失败' }
          }
          
          const result = await submitWithTwoStepSecret(walletLockKey, twoStepSecret)
          
          if (result.status === 'ok') {
            isWalletLockSheetOpen.current = false
            return { status: 'ok' as const, txHash: result.txHash, pendingTxId: result.pendingTxId }
          }
          
          if (result.status === 'password') {
            return { status: 'two_step_secret_invalid' as const, message: '安全密码错误' }
          }
          
          if (result.status === 'error') {
            return { status: 'error' as const, message: result.message, pendingTxId: result.pendingTxId }
          }
          
          return { status: 'error' as const, message: '未知错误' }
        })

        push('TransferWalletLockJob', {
          title: t('security:walletLock.verifyTitle'),
        })
      },
      {
        minFee: state.feeMinAmount?.toFormatted() ?? state.feeAmount?.toFormatted() ?? '0',
      }
    )

    push('TransferConfirmJob', {
      amount: state.amount?.toFormatted() ?? '0',
      symbol,
      toAddress: state.recipientAddress ?? '',
      feeAmount: state.feeAmount?.toFormatted() ?? '0',
      feeSymbol: state.feeSymbol,
      feeLoading: state.feeLoading ? 'true' : 'false',
    })
  }

  const handleDone = () => {
    if (state.resultStatus === 'success') {
      haptics.impact('success')
    }
    navGoBack()
  }

  const handleRetry = () => {
    reset()
  }

  const handleViewExplorer = useCallback(() => {
    if (!state.txHash) return
    const queryTx = chainConfig?.explorer?.queryTx
    if (!queryTx) {
      toast.show(t('sendPage.explorerNotImplemented'))
      return
    }
    const url = queryTx.replace(':hash', state.txHash).replace(':signature', state.txHash)
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [state.txHash, chainConfig?.explorer?.queryTx, toast, t])

  // Check if chain supports destroy
  const isBioforestChain = chainConfig?.chainKind === 'bioforest'

  if (!currentWallet || !currentChainAddress) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={t('destroyPage.title', '销毁')} onBack={navGoBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('history.noWallet')}</p>
        </div>
      </div>
    )
  }

  if (!isBioforestChain) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={t('destroyPage.title', '销毁')} onBack={navGoBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <IconFlame className="size-16 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            {t('destroyPage.notSupported', '当前链不支持资产销毁')}
          </p>
        </div>
      </div>
    )
  }

  // Result step
  if (state.step === 'result' || state.step === 'burning') {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={t('destroyPage.resultTitle', '销毁结果')} />
        <SendResult
          status={state.step === 'burning' ? 'pending' : (state.resultStatus ?? 'pending')}
          amount={state.amount?.toFormatted() ?? '0'}
          symbol={symbol}
          toAddress={state.recipientAddress ?? ''}
          txHash={state.txHash ?? undefined}
          errorMessage={state.errorMessage ?? undefined}
          onDone={handleDone}
          onRetry={state.resultStatus === 'failed' ? handleRetry : undefined}
          onViewExplorer={state.resultStatus === 'success' && chainConfig?.explorer?.queryTx ? handleViewExplorer : undefined}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('destroyPage.title', '销毁')} onBack={navGoBack} />

      <div className="flex-1 space-y-6 p-4">
        {/* Current chain info & sender address */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ChainIcon chain={selectedChain} size="sm" />
            <span className="text-sm font-medium">{selectedChainName}</span>
          </div>
          {currentChainAddress?.address && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <span>{t('sendPage.from')}:</span>
              <span className="font-mono">
                {currentChainAddress.address.slice(0, 8)}...{currentChainAddress.address.slice(-6)}
              </span>
            </div>
          )}
        </div>

        {/* Asset selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('destroyPage.assetLabel', '销毁资产')}
          </label>
          <AssetSelector
            selectedAsset={selectedToken}
            assets={destroyableTokens}
            onSelect={handleAssetSelect}
            disabled={assetLocked}
            excludeAssets={chainConfig ? [chainConfig.symbol] : []}
            testId="destroy-asset-selector"
          />
          {destroyableTokens.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {t('destroyPage.noDestroyableAssets', '暂无可销毁的资产')}
            </p>
          )}
        </div>

        {/* Amount input */}
        {state.asset && (
          <AmountInput
            label={t('destroyPage.amountLabel', '销毁数量')}
            value={state.amount ?? undefined}
            onChange={setAmount}
            balance={balance ?? undefined}
            symbol={symbol}
            error={state.amountError ?? undefined}
          />
        )}

        {/* Warning */}
        <Alert variant="warning">
          {t('destroyPage.warning', '销毁操作不可撤销，请仔细核对销毁数量。')}
        </Alert>

        {/* Fee info */}
        {state.feeAmount && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('sendPage.fee', '手续费')}</span>
              <span className="font-medium">
                {state.feeAmount.toFormatted()} {state.feeSymbol}
              </span>
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="pt-4">
          <GradientButton 
            variant="mint" 
            className="w-full" 
            data-testid="destroy-continue-button" 
            disabled={!canProceed || destroyableTokens.length === 0} 
            onClick={handleProceed}
          >
            <IconFlame className="-ml-4 mr-2 size-4" />
            {t('destroyPage.confirm', '确认销毁')}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}

export default DestroyPage
