/**
 * Pending Transaction Detail Page
 * 
 * 显示未上链交易的详情，支持：
 * - 广播中状态展示
 * - 广播失败状态展示 + 重试/删除操作
 * - 等待上链状态展示
 */

import { useCallback, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation, useActivityParams } from '@/stackflow'
import {
  IconLoader2,
  IconAlertCircle,
  IconClock,
  IconCheck,
  IconRefresh,
  IconTrash,
  IconExternalLink,
} from '@tabler/icons-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/common'
import { AddressDisplay } from '@/components/wallet/address-display'
import { pendingTxService, type PendingTx, type PendingTxStatus } from '@/services/transaction'
import { broadcastTransaction } from '@/services/bioforest-sdk'
import { BroadcastError, translateBroadcastError } from '@/services/bioforest-sdk/errors'
import { useChainConfigState, chainConfigSelectors } from '@/stores'
import { cn } from '@/lib/utils'

function getStatusIcon(status: PendingTxStatus) {
  switch (status) {
    case 'created':
    case 'broadcasting':
      return IconLoader2
    case 'broadcasted':
      return IconClock
    case 'failed':
      return IconAlertCircle
    case 'confirmed':
      return IconCheck
    default:
      return IconClock
  }
}

function getStatusColor(status: PendingTxStatus) {
  switch (status) {
    case 'created':
    case 'broadcasting':
      return 'text-blue-500 bg-blue-500/10'
    case 'broadcasted':
      return 'text-amber-500 bg-amber-500/10'
    case 'failed':
      return 'text-red-500 bg-red-500/10'
    case 'confirmed':
      return 'text-green-500 bg-green-500/10'
    default:
      return 'text-muted-foreground bg-muted'
  }
}

export function PendingTxDetailPage() {
  const { t } = useTranslation(['transaction', 'common'])
  const { goBack } = useNavigation()
  const { pendingTxId } = useActivityParams<{ pendingTxId: string }>()
  const chainConfigState = useChainConfigState()

  const [pendingTx, setPendingTx] = useState<PendingTx | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // 计算等待时间（broadcasted 状态下实时更新）
  useEffect(() => {
    if (!pendingTx || pendingTx.status !== 'broadcasted') {
      setElapsedSeconds(0)
      return
    }
    
    // 初始化已等待时间
    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - pendingTx.updatedAt) / 1000)
      setElapsedSeconds(elapsed)
    }
    updateElapsed()
    
    // 每秒更新
    const timer = setInterval(updateElapsed, 1000)
    return () => clearInterval(timer)
  }, [pendingTx?.status, pendingTx?.updatedAt])

  // 加载 pending tx
  useEffect(() => {
    async function load() {
      if (!pendingTxId) {
        setIsLoading(false)
        return
      }
      try {
        const tx = await pendingTxService.getById({ id: pendingTxId })
        setPendingTx(tx)
      } catch (error) {
        console.error('[PendingTxDetail] Failed to load:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [pendingTxId])

  // 获取链配置
  const chainConfig = useMemo(() => {
    if (!pendingTx?.chainId) return null
    return chainConfigSelectors.getChainById(chainConfigState, pendingTx.chainId)
  }, [chainConfigState, pendingTx?.chainId])

  // 构建浏览器 URL
  const explorerTxUrl = useMemo(() => {
    const queryTx = chainConfig?.explorer?.queryTx
    const hash = pendingTx?.txHash
    if (!queryTx || !hash) return null
    return queryTx.replace(':signature', hash)
  }, [chainConfig?.explorer?.queryTx, pendingTx?.txHash])

  // 在浏览器中打开
  const handleOpenInExplorer = useCallback(() => {
    if (explorerTxUrl) {
      window.open(explorerTxUrl, '_blank', 'noopener,noreferrer')
    }
  }, [explorerTxUrl])

  // 重试广播
  const handleRetry = useCallback(async () => {
    if (!pendingTx || !chainConfig) return

    setIsRetrying(true)
    try {
      // 获取 API URL
      const biowallet = chainConfig.apis.find((p) => p.type === 'biowallet-v1')
      const apiUrl = biowallet?.endpoint
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      // 更新状态为 broadcasting
      await pendingTxService.updateStatus({ id: pendingTx.id, status: 'broadcasting' })
      await pendingTxService.incrementRetry({ id: pendingTx.id })
      setPendingTx((prev) => prev ? { ...prev, status: 'broadcasting' } : null)

      // 重新广播
      const broadcastResult = await broadcastTransaction(apiUrl, pendingTx.rawTx as BFChainCore.TransactionJSON)
      
      // 广播成功，如果交易已存在则直接标记为 confirmed
      const newStatus = broadcastResult.alreadyExists ? 'confirmed' : 'broadcasted'
      const updated = await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: newStatus,
        txHash: broadcastResult.txHash,
      })
      setPendingTx(updated)
    } catch (error) {
      console.error('[PendingTxDetail] Retry failed:', error)
      
      // 广播失败
      const errorMessage = error instanceof BroadcastError
        ? translateBroadcastError(error)
        : (error instanceof Error ? error.message : '重试失败')
      const errorCode = error instanceof BroadcastError ? error.code : undefined

      const updated = await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: 'failed',
        errorCode,
        errorMessage,
      })
      setPendingTx(updated)
    } finally {
      setIsRetrying(false)
    }
  }, [pendingTx, chainConfig])

  // 删除交易
  const handleDelete = useCallback(async () => {
    if (!pendingTx) return

    setIsDeleting(true)
    try {
      await pendingTxService.delete({ id: pendingTx.id })
      goBack()
    } catch (error) {
      console.error('[PendingTxDetail] Delete failed:', error)
      setIsDeleting(false)
    }
  }, [pendingTx, goBack])

  // 返回
  const handleBack = useCallback(() => {
    goBack()
  }, [goBack])

  // 加载中
  if (isLoading) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('pendingTx.title')} onBack={handleBack} />
        <div className="flex-1 space-y-4 p-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    )
  }

  // 未找到
  if (!pendingTx) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('pendingTx.title')} onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(pendingTx.status)
  const statusColor = getStatusColor(pendingTx.status)
  const isProcessing = pendingTx.status === 'broadcasting'
  const isFailed = pendingTx.status === 'failed'
  const isBroadcasted = pendingTx.status === 'broadcasted'

  // 获取展示信息
  const displayAmount = pendingTx.meta?.displayAmount ?? ''
  const displaySymbol = pendingTx.meta?.displaySymbol ?? ''
  const displayType = pendingTx.meta?.type ?? 'transfer'
  const displayToAddress = pendingTx.meta?.displayToAddress ?? ''

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('pendingTx.title')} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
          <div className={cn('flex size-16 items-center justify-center rounded-full', statusColor)}>
            <StatusIcon className={cn('size-8', isProcessing && 'animate-spin')} />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {t(`type.${displayType}`, displayType)}
            </p>
            {displayAmount && (
              <p className="text-2xl font-semibold">
                {displayAmount} {displaySymbol}
              </p>
            )}
          </div>

          {/* 状态标签 */}
          <div className={cn('rounded-full px-3 py-1 text-sm font-medium', statusColor)}>
            {t(`txStatus.${pendingTx.status}`)}
          </div>

          {/* 状态描述 */}
          <p className="text-muted-foreground text-center text-sm">
            {t(`txStatus.${pendingTx.status}Desc`)}
          </p>

          {/* 等待时间（broadcasted 状态下显示） */}
          {isBroadcasted && elapsedSeconds > 0 && (
            <p className="text-muted-foreground text-center text-xs">
              {t('pendingTx.waitingFor', { seconds: elapsedSeconds })}
            </p>
          )}
        </div>

        {/* 错误信息 */}
        {isFailed && pendingTx.errorMessage && (
          <div className="bg-destructive/10 border-destructive/20 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="text-destructive mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-destructive text-sm font-medium">{t('pendingTx.failed')}</p>
                <p className="text-destructive/80 mt-1 text-sm">{pendingTx.errorMessage}</p>
                {pendingTx.errorCode && (
                  <p className="text-destructive/60 mt-1 text-xs">
                    {t('detail.errorCode')}: {pendingTx.errorCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 详细信息 */}
        <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">{t('detail.info')}</h3>

          {/* 发送地址 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.fromAddress')}</span>
            <AddressDisplay address={pendingTx.fromAddress} copyable className="max-w-[180px]" />
          </div>

          {/* 接收地址 */}
          {displayToAddress && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.toAddress')}</span>
              <AddressDisplay address={displayToAddress} copyable className="max-w-[180px]" />
            </div>
          )}

          {/* 链 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.chain')}</span>
            <span className="text-sm">{chainConfig?.name ?? pendingTx.chainId}</span>
          </div>

          {/* 交易哈希 */}
          {pendingTx.txHash && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.hash')}</span>
              <span className="text-muted-foreground max-w-[180px] truncate text-xs font-mono">
                {pendingTx.txHash.slice(0, 16)}...{pendingTx.txHash.slice(-8)}
              </span>
            </div>
          )}

          {/* 重试次数 */}
          {pendingTx.retryCount > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('pendingTx.retryCount')}</span>
              <span className="text-sm">{pendingTx.retryCount}</span>
            </div>
          )}

          {/* 确认区块高度 */}
          {pendingTx.confirmedBlockHeight && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.confirmedBlockHeight')}</span>
              <span className="text-sm font-mono">{pendingTx.confirmedBlockHeight.toLocaleString()}</span>
            </div>
          )}

          {/* 确认时间 */}
          {pendingTx.confirmedAt && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.confirmedAt')}</span>
              <span className="text-sm">
                {new Date(pendingTx.confirmedAt).toLocaleString()}
              </span>
            </div>
          )}

          {/* 创建时间 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.time')}</span>
            <span className="text-sm">
              {new Date(pendingTx.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {/* 在浏览器中查看 */}
          {isBroadcasted && explorerTxUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOpenInExplorer}
            >
              <IconExternalLink className="mr-2 size-4" />
              {t('detail.openInExplorer')}
            </Button>
          )}

          {/* 重试按钮 */}
          {isFailed && (
            <Button
              className="w-full"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconRefresh className="mr-2 size-4" />
              )}
              {isRetrying ? t('common:loading') : t('pendingTx.retry')}
            </Button>
          )}

          {/* 删除按钮 */}
          {(isFailed || pendingTx.status === 'created') && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconTrash className="mr-2 size-4" />
              )}
              {isDeleting ? t('common:loading') : t('pendingTx.delete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
