/**
 * PermissionRequestJob - 权限请求对话框
 * 用于小程序首次请求权限时显示
 */

import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  IconWallet,
  IconSignature,
  IconCurrencyDollar,
  IconShieldCheck,
  IconApps,
} from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

type PermissionRequestJobParams = {
  /** 小程序名称 */
  appName: string
  /** 小程序图标 */
  appIcon?: string
  /** 请求的权限列表 */
  permissions: string[]
}

const PERMISSION_INFO: Record<string, { icon: typeof IconWallet; label: string; description: string }> = {
  bio_requestAccounts: {
    icon: IconWallet,
    label: '查看账户',
    description: '查看您的钱包地址',
  },
  bio_signMessage: {
    icon: IconSignature,
    label: '签名消息',
    description: '请求签名消息（需要您确认）',
  },
  bio_signTypedData: {
    icon: IconSignature,
    label: '签名数据',
    description: '请求签名结构化数据（需要您确认）',
  },
  bio_sendTransaction: {
    icon: IconCurrencyDollar,
    label: '发送交易',
    description: '请求发送转账（需要您确认）',
  },
}

function PermissionRequestJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { appName, appIcon, permissions } = useActivityParams<PermissionRequestJobParams>()

  const handleApprove = () => {
    const event = new CustomEvent('permission-request', {
      detail: { approved: true, permissions },
    })
    window.dispatchEvent(event)
    pop()
  }

  const handleReject = () => {
    const event = new CustomEvent('permission-request', {
      detail: { approved: false },
    })
    window.dispatchEvent(event)
    pop()
  }

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="border-border border-b px-4 pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            {appIcon ? (
              <img src={appIcon} alt={appName} className="size-10 rounded-xl" />
            ) : (
              <IconApps className="text-primary size-8" />
            )}
          </div>
          <h2 className="text-center text-lg font-semibold">{appName}</h2>
          <p className="text-muted-foreground mt-1 text-center text-sm">
            {t('requestsPermissions', '请求以下权限')}
          </p>
        </div>

        {/* Permissions List */}
        <div className="p-4">
          <div className="space-y-3">
            {permissions.map((permission) => {
              const info = PERMISSION_INFO[permission]
              if (!info) return null

              const Icon = info.icon
              return (
                <div
                  key={permission}
                  className="bg-muted/50 flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{info.label}</p>
                    <p className="text-muted-foreground text-sm">{info.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <IconShieldCheck className="size-4" />
            <span>{t('permissionNote', '敏感操作需要您的确认')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleReject}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('reject', '拒绝')}
          </button>
          <button
            onClick={handleApprove}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {t('approve', '允许')}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const PermissionRequestJob: ActivityComponentType<PermissionRequestJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <PermissionRequestJobContent />
    </ActivityParamsProvider>
  )
}
