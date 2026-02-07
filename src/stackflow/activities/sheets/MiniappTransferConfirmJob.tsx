/**
 * MiniappTransferConfirmJob - 小程序转账确认对话框
 * 用于小程序请求发送转账时显示
 */

import { useState, useCallback, useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconArrowDown, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob'
import { walletStore } from '@/stores'
import { AddressDisplay } from '@/components/wallet/address-display'
import { AmountDisplay } from '@/components/common/amount-display'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { ChainBadge } from '@/components/wallet/chain-icon'
import { getChainProvider } from '@/services/chain-adapter/providers'
import { Amount } from '@/types/amount'
import { signUnsignedTransaction } from '@/services/ecosystem/handlers'
import { chainConfigService } from '@/services/chain-config/service'
import { findMiniappWalletIdByAddress, resolveMiniappChainId } from './miniapp-wallet'

type MiniappTransferConfirmJobParams = {
  /** 来源小程序名称 */
  appName: string
  /** 来源小程序图标 */
  appIcon?: string
  /** 发送地址 */
  from: string
  /** 接收地址 */
  to: string
  /** 金额 */
  amount: string
  /** 链 ID */
  chain: string
  /** 代币 (可选) */
  asset?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function MiniappTransferConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const params = useActivityParams<MiniappTransferConfirmJobParams>()
  const { appName, appIcon, from, to, amount, chain, asset } = params

  const [isConfirming, setIsConfirming] = useState(false)

  const resolvedChainId = useMemo(() => resolveMiniappChainId(chain), [chain])
  const walletId = useMemo(() => findMiniappWalletIdByAddress(resolvedChainId, from), [resolvedChainId, from])
  const targetWallet = walletStore.state.wallets.find((wallet) => wallet.id === walletId)
  const walletName = targetWallet?.name || t('unknownWallet')
  const lockDescription = `${appName || t('unknownDApp')} ${t('requestsTransfer')}`

  const displayAsset = useMemo(() => {
    if (asset) return asset
    const chainSymbol = chainConfigService.getSymbol(resolvedChainId)
    return chainSymbol || resolvedChainId.toUpperCase()
  }, [asset, resolvedChainId])

  const handleConfirm = useCallback(() => {
    if (isConfirming || !walletId) return

    setWalletLockConfirmCallback(async (password: string) => {
      setIsConfirming(true)

      try {
        const provider = getChainProvider(resolvedChainId)
        if (!provider.supportsFullTransaction || !provider.buildTransaction || !provider.signTransaction || !provider.broadcastTransaction) {
          throw new Error(`Chain ${resolvedChainId} does not support transaction pipeline`)
        }

        const decimals = chainConfigService.getDecimals(resolvedChainId)
        const chainSymbol = chainConfigService.getSymbol(resolvedChainId)
        const symbol = (asset ?? chainSymbol) || resolvedChainId.toUpperCase()
        const valueAmount = Amount.parse(amount, decimals, symbol)

        const unsignedTx = await provider.buildTransaction({
          type: 'transfer',
          from,
          to,
          amount: valueAmount,
          ...(asset ? { bioAssetType: asset } : {}),
        })

        const signedTx = await signUnsignedTransaction({
          walletId,
          password,
          from,
          chainId: resolvedChainId,
          unsignedTx,
        })

        const txHash = await provider.broadcastTransaction(signedTx)
        const transaction = isRecord(signedTx.data) ? signedTx.data : { data: signedTx.data }

        const event = new CustomEvent('miniapp-transfer-confirm', {
          detail: {
            confirmed: true,
            txHash,
            txId: txHash,
            transaction,
          },
        })
        window.dispatchEvent(event)

        pop()
        return true
      } catch (error) {
        console.error('[miniapp-transfer]', error)
        throw error instanceof Error ? error : new Error('Transfer failed')
      } finally {
        setIsConfirming(false)
      }
    })

    push('WalletLockConfirmJob', {
      title: t('confirmTransfer'),
      description: lockDescription,
      miniappName: appName,
      miniappIcon: appIcon,
      walletName,
      walletAddress: from,
      walletChainId: resolvedChainId,
    })
  }, [isConfirming, walletId, resolvedChainId, from, to, amount, asset, pop, push, t, lockDescription, appName, appIcon, walletName])

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-transfer-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }, [pop])

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <MiniappSheetHeader
          title={t('confirmTransfer')}
          description={lockDescription}
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address: from,
            chainId: resolvedChainId,
          }}
        />

        <div className="space-y-4 p-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <AmountDisplay
              value={amount}
              symbol={displayAsset}
              size="xl"
              weight="bold"
              decimals={8}
              fixedDecimals={true}
            />
          </div>

          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('from')}</span>
              <AddressDisplay address={from} copyable className="flex-1 text-sm" />
            </div>

            <div className="flex justify-center">
              <IconArrowDown className="text-muted-foreground size-4" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('to')}</span>
              <AddressDisplay address={to} copyable className="flex-1 text-sm" />
            </div>
          </div>

          {!walletId && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {t('signingAddressNotFound')}
            </div>
          )}

          <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
            <span className="text-muted-foreground text-sm"> {t('network')}</span>
            <ChainBadge chainId={resolvedChainId} />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{t('transferWarning')}</p>
          </div>
        </div>

        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || !walletId}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'flex items-center justify-center gap-2 disabled:opacity-50',
            )}
          >
            {isConfirming ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('confirming')}
              </>
            ) : (
              t('confirm')
            )}
          </button>
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const MiniappTransferConfirmJob: ActivityComponentType<MiniappTransferConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappTransferConfirmJobContent />
    </ActivityParamsProvider>
  )
}
