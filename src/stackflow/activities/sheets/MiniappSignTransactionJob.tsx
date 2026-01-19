/**
 * MiniappSignTransactionJob - 小程序交易签名确认对话框
 * 用于小程序请求 `bio_signTransaction` 时显示
 */

import { useState, useCallback, useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob'
import { walletStore } from '@/stores'
import type { UnsignedTransaction } from '@/services/ecosystem'
import { signUnsignedTransaction } from '@/services/ecosystem/handlers'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { ChainBadge } from '@/components/wallet/chain-icon'
import { ChainAddressDisplay } from '@/components/wallet/chain-address-display'

type MiniappSignTransactionJobParams = {
  /** 来源小程序名称 */
  appName: string
  /** 来源小程序图标 */
  appIcon?: string
  /** 签名地址 */
  from: string
  /** 链 ID */
  chain: string
  /** 未签名交易（JSON 字符串） */
  unsignedTx: string
}

function findWalletIdByAddress(chainId: string, address: string): string | null {
  const isHexLike = address.startsWith('0x')
  const normalized = isHexLike ? address.toLowerCase() : address

  for (const wallet of walletStore.state.wallets) {
    const match = wallet.chainAddresses.find((ca) => {
      if (ca.chain !== chainId) return false
      if (isHexLike || ca.address.startsWith('0x')) return ca.address.toLowerCase() === normalized
      return ca.address === normalized
    })
    if (match) return wallet.id
  }
  return null
}

function MiniappSignTransactionJobContent() {
  const { t } = useTranslation('common')
  const { pop, push } = useFlow()
  const params = useActivityParams<MiniappSignTransactionJobParams>()
  const { appName, appIcon, from, chain, unsignedTx: unsignedTxJson } = params

  const [isSubmitting, setIsSubmitting] = useState(false)

  const unsignedTx = useMemo((): UnsignedTransaction | null => {
    try {
      return JSON.parse(unsignedTxJson) as UnsignedTransaction
    } catch {
      return null
    }
  }, [unsignedTxJson])

  const walletId = useMemo(() => {
    return findWalletIdByAddress(chain, from)
  }, [chain, from])

  const handleConfirm = useCallback(() => {
    if (isSubmitting) return
    if (!unsignedTx) return
    if (!walletId) return

    setWalletLockConfirmCallback(async (password: string) => {
      setIsSubmitting(true)
      try {
        const signedTx = await signUnsignedTransaction({
          walletId,
          password,
          from,
          chainId: chain,
          unsignedTx,
        })

        const event = new CustomEvent('miniapp-sign-transaction-confirm', {
          detail: {
            confirmed: true,
            signedTx,
          },
        })
        window.dispatchEvent(event)

        pop()
        return true
      } catch (error) {

        return false
      } finally {
        setIsSubmitting(false)
      }
    })

    push('WalletLockConfirmJob', {
      title: t('signTransaction', '签名交易'),
    })
  }, [chain, from, isSubmitting, pop, push, t, unsignedTx, walletId])

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-sign-transaction-confirm', {
      detail: { confirmed: false },
    })
    window.dispatchEvent(event)
    pop()
  }, [pop])

  const rawPreview = useMemo(() => {
    if (!unsignedTx) return ''
    try {
      return JSON.stringify(unsignedTx.data, null, 2)
    } catch {
      return String(unsignedTx.data)
    }
  }, [unsignedTx])

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <MiniappSheetHeader
          title={t('signTransaction', '签名交易')}
          description={appName || t('unknownDApp', '未知 DApp')}
          appName={appName}
          appIcon={appIcon}
          chainId={chain}
        />

        <div className="space-y-4 p-4">
          {!unsignedTx && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {t('invalidTransaction', '无效的交易数据')}
            </div>
          )}

          {unsignedTx && !walletId && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {t('signingAddressNotFound', '找不到对应的钱包地址，无法签名')}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('network', '网络')}</p>
            <ChainBadge chainId={chain} />
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('signingAddress', '签名地址')}</p>
            <ChainAddressDisplay chainId={chain} address={from} copyable={false} size="sm" />
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('transaction', '交易内容')}</p>
            <div className="max-h-44 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-all font-mono text-xs">{rawPreview}</pre>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <IconAlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('signTxWarning', '请确认您信任此应用，并仔细核对交易内容。')}
            </p>
          </div>
        </div>

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
            disabled={isSubmitting || !unsignedTx || !walletId}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 flex items-center justify-center gap-2',
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

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const MiniappSignTransactionJob: ActivityComponentType<MiniappSignTransactionJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappSignTransactionJobContent />
    </ActivityParamsProvider>
  )
}
