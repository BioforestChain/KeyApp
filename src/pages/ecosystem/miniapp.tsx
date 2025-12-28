/**
 * MiniApp Container Page
 *
 * Runs a miniapp in an iframe with Bio SDK integration
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAppById, getBridge, initBioProvider } from '@/services/ecosystem'
import type { MiniappManifest, BioAccount, TransferParams } from '@/services/ecosystem'
import {
  setAccountPicker,
  setWalletPicker,
  setGetAccounts,
} from '@/services/ecosystem/handlers/wallet'
import { setSigningDialog } from '@/services/ecosystem/handlers/signing'
import { setTransferDialog } from '@/services/ecosystem/handlers/transfer'
import { walletStore, walletSelectors, type ChainAddress } from '@/stores'
import { useFlow } from '@/stackflow/stackflow'
import { IconX, IconDots } from '@tabler/icons-react'

interface MiniappPageProps {
  appId: string
  onClose?: () => void
}

export function MiniappPage({ appId, onClose }: MiniappPageProps) {
  const { t } = useTranslation('common')
  const { push } = useFlow()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [app, setApp] = useState<MiniappManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const manifest = getAppById(appId)
    if (!manifest) {
      setError('小程序不存在')
      setLoading(false)
      return
    }
    setApp(manifest)
  }, [appId, t])

  // 账户选择器
  const showAccountPicker = useCallback(
    (opts?: { chain?: string }): Promise<BioAccount | null> => {
      return new Promise((resolve) => {
        const handleSelect = (e: Event) => {
          const detail = (e as CustomEvent).detail
          window.removeEventListener('account-picker-select', handleSelect)
          window.removeEventListener('account-picker-cancel', handleCancel)
          resolve({
            address: detail.address,
            chain: detail.chain,
            name: detail.name,
          })
        }

        const handleCancel = () => {
          window.removeEventListener('account-picker-select', handleSelect)
          window.removeEventListener('account-picker-cancel', handleCancel)
          resolve(null)
        }

        window.addEventListener('account-picker-select', handleSelect)
        window.addEventListener('account-picker-cancel', handleCancel)

        const params: Record<string, string> = {}
        if (opts?.chain) params.chain = opts.chain
        if (app?.name) params.appName = app.name
        push('AccountPickerJob', params)
      })
    },
    [push, app?.name]
  )

  // 获取已连接账户
  const getConnectedAccounts = useCallback((): BioAccount[] => {
    const state = walletStore.state
    const wallet = walletSelectors.getCurrentWallet(state)
    if (!wallet) return []

    return wallet.chainAddresses.map((ca: ChainAddress) => ({
      address: ca.address,
      chain: ca.chain,
      name: wallet.name,
    }))
  }, [])

  // 签名对话框
  // TODO: 集成实际签名服务，需要：
  // 1. 根据 address 找到对应的钱包和链
  // 2. 解锁钱包获取私钥
  // 3. 调用 chain-adapter 的 signMessage 方法
  // 4. 返回实际签名
  const showSigningDialog = useCallback(
    (params: { message: string; address: string; appName: string }): Promise<string | null> => {
      return new Promise((resolve) => {
        const handleConfirm = (e: Event) => {
          const detail = (e as CustomEvent).detail
          window.removeEventListener('signing-confirm', handleConfirm)
          if (detail.confirmed) {
            // 暂时返回模拟签名，后续需要集成实际签名服务
            // 模拟签名格式：0x + 130 个 0
            const mockSignature = `0x${Array(130).fill('0').join('')}`
            console.log('[MiniappPage] Signing confirmed, returning mock signature')
            resolve(mockSignature)
          } else {
            resolve(null)
          }
        }

        window.addEventListener('signing-confirm', handleConfirm)

        push('SigningConfirmJob', {
          message: params.message,
          address: params.address,
          appName: params.appName,
        })
      })
    },
    [push]
  )

  // 转账对话框
  const showTransferDialog = useCallback(
    (params: TransferParams & { appName: string }): Promise<{ txHash: string } | null> => {
      return new Promise((resolve) => {
        const handleResult = (e: Event) => {
          const detail = (e as CustomEvent).detail
          window.removeEventListener('miniapp-transfer-confirm', handleResult)
          if (detail.confirmed) {
            resolve({ txHash: detail.txHash })
          } else {
            resolve(null)
          }
        }

        window.addEventListener('miniapp-transfer-confirm', handleResult)

        push('MiniappTransferConfirmJob', {
          appName: params.appName,
          from: params.from,
          to: params.to,
          amount: params.amount,
          chain: params.chain,
          ...(params.asset ? { asset: params.asset } : {}),
        })
      })
    },
    [push]
  )

  // 权限请求对话框
  const requestPermission = useCallback(
    (_appId: string, appName: string, permissions: string[]): Promise<boolean> => {
      return new Promise((resolve) => {
        const handleResult = (e: Event) => {
          const detail = (e as CustomEvent).detail
          window.removeEventListener('permission-request', handleResult)
          resolve(detail.approved === true)
        }

        window.addEventListener('permission-request', handleResult)

        push('PermissionRequestJob', {
          appName,
          permissions: JSON.stringify(permissions),
        })
      })
    },
    [push]
  )

  // 注册回调
  useEffect(() => {
    setAccountPicker(showAccountPicker)
    setWalletPicker(showAccountPicker) // 复用账户选择器
    setGetAccounts(getConnectedAccounts)
    setSigningDialog(showSigningDialog)
    setTransferDialog(showTransferDialog)

    return () => {
      setAccountPicker(null)
      setWalletPicker(null)
      setGetAccounts(null)
      setSigningDialog(null)
      setTransferDialog(null)
    }
  }, [showAccountPicker, getConnectedAccounts, showSigningDialog, showTransferDialog])

  useEffect(() => {
    // Initialize provider on mount
    initBioProvider()
  }, [])

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || !app) return

    // Attach bridge to iframe
    const bridge = getBridge()
    bridge.setPermissionRequestCallback(requestPermission)
    bridge.attach(iframeRef.current, app.id, app.name, app.permissions ?? [])

    setLoading(false)

    // Emit connect event
    bridge.emit('connect', { chainId: 'bfmeta' })
  }, [app, requestPermission])

  useEffect(() => {
    return () => {
      // Detach bridge on unmount
      getBridge().detach()
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          {t('back', '返回')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t('close', '关闭')}
        >
          <IconX className="size-5" stroke={1.5} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{app?.name ?? '加载中...'}</h1>
          {app?.author && (
            <p className="text-xs text-muted-foreground truncate">{app.author}</p>
          )}
        </div>

        <button
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t('more', '更多')}
        >
          <IconDots className="size-5" stroke={1.5} />
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 top-14 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {/* Iframe container */}
      {app && (
        <iframe
          ref={iframeRef}
          src={app.url}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts allow-forms allow-same-origin"
          onLoad={handleIframeLoad}
          title={app.name}
        />
      )}
    </div>
  )
}

export default MiniappPage
