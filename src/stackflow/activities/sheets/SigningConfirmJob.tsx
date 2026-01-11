/**
 * SigningConfirmJob - 签名确认对话框
 * 用于小程序请求用户签名消息
 */

import { useCallback, useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob'
import { useCurrentWallet } from '@/stores'
import { SignatureAuthService, plaocAdapter } from '@/services/authorize'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { AddressDisplay } from '@/components/wallet/address-display'

type SigningConfirmJobParams = {
  /** 要签名的消息 */
  message: string
  /** 签名地址 */
  address: string
  /** 请求来源小程序名称 */
  appName?: string
  /** 请求来源小程序图标 */
  appIcon?: string
  /** 链名称（用于签名） */
  chainName?: string
}

function SigningConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const { message, address, appName, appIcon, chainName } = useActivityParams<SigningConfirmJobParams>()
  const currentWallet = useCurrentWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(() => {
    if (isSubmitting) return

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsSubmitting(true)
      
      try {
        const encryptedSecret = currentWallet?.encryptedMnemonic
        if (!encryptedSecret) {
          console.error('[SigningConfirmJob] No encrypted mnemonic found')
          return false
        }

        // 创建签名服务 (使用临时 eventId)
        const eventId = `miniapp_sign_${Date.now()}`
        const authService = new SignatureAuthService(plaocAdapter, eventId)

        // 执行真实签名（返回 { signature, publicKey }）
        const signResult = await authService.handleMessageSign(
          {
            chainName: chainName || 'bioforest',
            senderAddress: address,
            message,
          },
          encryptedSecret,
          password
        )

        // 发送成功事件（包含 signature 和 publicKey）
        const event = new CustomEvent('signing-confirm', {
          detail: { 
            confirmed: true, 
            signature: signResult.signature,
            publicKey: signResult.publicKey,
          },
        })
        window.dispatchEvent(event)
        
        pop()
        return true
      } catch (error) {
        console.error('[SigningConfirmJob] Signing failed:', error)
        return false
      } finally {
        setIsSubmitting(false)
      }
    })

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('sign', '签名'),
    })
  }, [isSubmitting, currentWallet, chainName, address, message, pop, push, t])

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('signing-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }, [pop])

  // Check if message looks like hex data (potential risk)
  const isHexData = message.startsWith('0x') && /^0x[0-9a-fA-F]+$/.test(message)

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <MiniappSheetHeader
          title={t('signMessage', '签名请求')}
          description={appName || t('unknownDApp', '未知 DApp')}
          appName={appName}
          appIcon={appIcon}
        />

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Address */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {t('signingAddress', '签名地址')}
            </p>
            <AddressDisplay address={address} copyable={false} className="text-sm" />
          </div>

          {/* Message */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {t('message', '消息内容')}
            </p>
            <div className="max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                {message}
              </pre>
            </div>
          </div>

          {/* Warning for hex data */}
          {isHexData && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <IconAlertTriangle className="size-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t('hexDataWarning', '此消息包含十六进制数据，请确认您信任此应用。')}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-muted hover:bg-muted/80 disabled:opacity-50 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('signing', '签名中...')}
              </>
            ) : (
              t('sign', '签名')
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const SigningConfirmJob: ActivityComponentType<SigningConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <SigningConfirmJobContent />
    </ActivityParamsProvider>
  )
}
