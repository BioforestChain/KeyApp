/**
 * SigningConfirmJob - 签名确认对话框
 * 用于小程序请求用户签名消息
 */

import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconSignature, IconAlertTriangle } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

type SigningConfirmJobParams = {
  /** 要签名的消息 */
  message: string
  /** 签名地址 */
  address: string
  /** 请求来源小程序名称 */
  appName?: string
}

function truncateAddress(address: string, startChars = 8, endChars = 6): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

function SigningConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { message, address, appName } = useActivityParams<SigningConfirmJobParams>()

  const handleConfirm = () => {
    const event = new CustomEvent('signing-confirm', {
      detail: { confirmed: true },
    })
    window.dispatchEvent(event)
    pop()
  }

  const handleCancel = () => {
    const event = new CustomEvent('signing-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }

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
        <div className="border-border border-b px-4 pb-4">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100">
            <IconSignature className="size-6 text-amber-600" />
          </div>
          <h2 className="text-center text-lg font-semibold">
            {t('signMessage', '签名请求')}
          </h2>
          {appName && (
            <p className="text-muted-foreground mt-1 text-center text-sm">
              {appName}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Address */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {t('signingAddress', '签名地址')}
            </p>
            <p className="font-mono text-sm">{truncateAddress(address)}</p>
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
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {t('sign', '签名')}
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
