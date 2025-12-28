/**
 * MiniappTransferConfirmJob - 小程序转账确认对话框
 * 用于小程序请求发送转账时显示
 */

import { useState, useCallback } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconArrowRight, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob'
import { useCurrentWallet } from '@/stores'
import { SignatureAuthService, plaocAdapter } from '@/services/authorize'
import { AddressDisplay } from '@/components/wallet/address-display'
import { AmountDisplay } from '@/components/common/amount-display'

type MiniappTransferConfirmJobParams = {
  /** 来源小程序名称 */
  appName: string
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

function MiniappTransferConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const params = useActivityParams<MiniappTransferConfirmJobParams>()
  const { appName, from, to, amount, chain, asset } = params
  const currentWallet = useCurrentWallet()

  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = useCallback(() => {
    if (isConfirming) return

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsConfirming(true)
      
      try {
        const encryptedSecret = currentWallet?.encryptedMnemonic
        if (!encryptedSecret) {
          console.error('[MiniappTransferConfirmJob] No encrypted mnemonic found')
          return false
        }

        // 创建签名服务
        const eventId = `miniapp_transfer_${Date.now()}`
        const authService = new SignatureAuthService(plaocAdapter, eventId)

        // 执行转账签名
        const transferPayload: {
          chainName: string
          senderAddress: string
          receiveAddress: string
          balance: string
          assetType?: string
        } = {
          chainName: chain,
          senderAddress: from,
          receiveAddress: to,
          balance: amount,
        }
        if (asset) {
          transferPayload.assetType = asset
        }
        
        const signature = await authService.handleTransferSign(
          transferPayload,
          encryptedSecret,
          password
        )

        // TODO: 广播交易到链上 (需要调用 chain adapter 的 broadcastTransaction)
        // 目前先返回签名作为 txHash 的占位符
        const txHash = signature

        // 发送成功事件
        const event = new CustomEvent('miniapp-transfer-confirm', {
          detail: {
            confirmed: true,
            txHash,
          },
        })
        window.dispatchEvent(event)
        
        pop()
        return true
      } catch (error) {
        console.error('[MiniappTransferConfirmJob] Transfer failed:', error)
        return false
      } finally {
        setIsConfirming(false)
      }
    })

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('confirmTransfer', '确认转账'),
    })
  }, [isConfirming, currentWallet, chain, from, to, amount, asset, pop, push, t])

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-transfer-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }, [pop])

  const displayAsset = asset || chain.toUpperCase()

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="border-border border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">
            {t('confirmTransfer', '确认转账')}
          </h2>
          <p className="text-muted-foreground mt-1 text-center text-sm">
            {appName} {t('requestsTransfer', '请求发送转账')}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Amount */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <AmountDisplay 
              value={amount} 
              symbol={displayAsset} 
              size="xl" 
              weight="bold"
              decimals={8}
            />
          </div>

          {/* From -> To */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              {/* From */}
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs mb-1">
                  {t('from', '来自')}
                </p>
                <AddressDisplay address={from} copyable={false} className="text-sm" />
              </div>

              {/* Arrow */}
              <IconArrowRight className="size-5 text-muted-foreground shrink-0" />

              {/* To */}
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs mb-1 text-right">
                  {t('to', '接收')}
                </p>
                <AddressDisplay address={to} copyable={false} className="text-sm" />
              </div>
            </div>
          </div>

          {/* Chain */}
          <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('network', '网络')}
            </span>
            <span className="text-sm font-medium">{chain}</span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <IconAlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('transferWarning', '请仔细核对收款地址和金额，转账后无法撤回。')}
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
            {t('cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 flex items-center justify-center gap-2'
            )}
          >
            {isConfirming ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('confirming', '确认中...')}
              </>
            ) : (
              t('confirm', '确认')
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const MiniappTransferConfirmJob: ActivityComponentType<MiniappTransferConfirmJobParams> = ({
  params,
}) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappTransferConfirmJobContent />
    </ActivityParamsProvider>
  )
}
