/**
 * MiniappDestroyConfirmJob - 小程序销毁资产确认对话框
 * 用于小程序请求销毁资产时显示
 */

import { useState, useCallback } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconFlame, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob'
import { useCurrentWallet, useChainConfigState, chainConfigSelectors } from '@/stores'
import { submitBioforestBurn } from '@/hooks/use-burn.bioforest'
import { Amount } from '@/types/amount'
import { AddressDisplay } from '@/components/wallet/address-display'
import { AmountDisplay } from '@/components/common/amount-display'
import { MiniappSheetHeader } from '@/components/ecosystem'

type MiniappDestroyConfirmJobParams = {
  /** 来源小程序名称 */
  appName: string
  /** 来源小程序图标 */
  appIcon?: string
  /** 发送地址 */
  from: string
  /** 金额 */
  amount: string
  /** 链 ID */
  chain: string
  /** 资产类型 */
  asset: string
}

function MiniappDestroyConfirmJobContent() {
  const { t } = useTranslation(['common', 'transaction'])
  const { pop, push } = useFlow()
  const params = useActivityParams<MiniappDestroyConfirmJobParams>()
  const { appName, appIcon, from, amount, chain, asset } = params
  const currentWallet = useCurrentWallet()
  const chainConfigState = useChainConfigState()

  const chainConfig = chainConfigState.snapshot
    ? chainConfigSelectors.getChainById(chainConfigState, chain as 'bfmeta')
    : null

  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = useCallback(() => {
    if (isConfirming) return

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsConfirming(true)

      try {
        if (!currentWallet?.id || !chainConfig) {

          return false
        }

        // 获取 applyAddress
        const { fetchAssetApplyAddress } = await import('@/hooks/use-burn.bioforest')
        const applyAddress = await fetchAssetApplyAddress(chainConfig, asset, from)

        if (!applyAddress) {

          return false
        }

        // 执行销毁
        const amountObj = Amount.fromFormatted(amount, chainConfig.decimals, asset)

        const result = await submitBioforestBurn({
          chainConfig,
          walletId: currentWallet.id,
          password,
          fromAddress: from,
          recipientAddress: applyAddress,
          assetType: asset,
          amount: amountObj,
        })

        if (result.status === 'password') {
          return false
        }

        if (result.status === 'error') {

          return false
        }

        // 发送成功事件
        const event = new CustomEvent('miniapp-destroy-confirm', {
          detail: {
            confirmed: true,
            txHash: result.status === 'ok' ? result.txHash : undefined,
          },
        })
        window.dispatchEvent(event)

        pop()
        return true
      } catch (error) {

        return false
      } finally {
        setIsConfirming(false)
      }
    })

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('transaction:destroyPage.title'),
    })
  }, [isConfirming, currentWallet, chainConfig, asset, from, amount, pop, push, t])

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-destroy-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }, [pop])

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <MiniappSheetHeader
          title={t('transaction:destroyPage.title')}
          description={`${appName || t('common:unknownDApp', 'Unknown App')} ${t('common:requestsDestroy', '请求销毁资产')}`}
          appName={appName}
          appIcon={appIcon}
        />

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Amount */}
          <div className="bg-destructive/5 rounded-xl p-4 text-center">
            <AmountDisplay
              value={amount}
              symbol={asset}
              size="xl"
              weight="bold"
              decimals={8}
              fixedDecimals={true}
            />
          </div>

          {/* From address */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs w-10 shrink-0">
                {t('common:from', '来自')}
              </span>
              <AddressDisplay address={from} copyable className="flex-1 text-sm" />
            </div>
          </div>

          {/* Chain & Asset */}
          <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('common:network', '网络')}
            </span>
            <span className="text-sm font-medium">{chain}</span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
            <IconAlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">
              {t('transaction:destroyPage.warning')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="bg-muted hover:bg-muted/80 disabled:opacity-50 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('common:cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              'disabled:opacity-50 flex items-center justify-center gap-2'
            )}
          >
            {isConfirming ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('common:confirming', '确认中...')}
              </>
            ) : (
              <>
                <IconFlame className="size-4" />
                {t('transaction:destroyPage.confirm')}
              </>
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const MiniappDestroyConfirmJob: ActivityComponentType<MiniappDestroyConfirmJobParams> = ({
  params,
}) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappDestroyConfirmJobContent />
    </ActivityParamsProvider>
  )
}
