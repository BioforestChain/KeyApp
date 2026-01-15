import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { AddressDisplay } from '@/components/wallet/address-display'
import type { PendingTx, PendingTxStatus } from '@/services/transaction'
import { cn } from '@/lib/utils'

const meta = {
  title: 'Pages/PendingTx/DetailPage',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

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

interface MockDetailPageProps {
  initialStatus: PendingTxStatus
  errorMessage?: string
  txHash?: string
}

function MockDetailPage({ initialStatus, errorMessage, txHash }: MockDetailPageProps) {
  const { t } = useTranslation(['transaction', 'common'])
  const [status, setStatus] = useState<PendingTxStatus>(initialStatus)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const mockTx: PendingTx = {
    id: 'mock-pending-tx-id',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'bXXX1234567890abcdef',
    status,
    txHash,
    errorCode: status === 'failed' ? '001-11028' : undefined,
    errorMessage: status === 'failed' ? errorMessage : undefined,
    retryCount: status === 'failed' ? 2 : 0,
    createdAt: Date.now() - 300000,
    updatedAt: Date.now() - 60000,
    rawTx: { signature: 'mock-sig' },
    meta: {
      type: 'transfer',
      displayAmount: '100.5',
      displaySymbol: 'BFM',
      displayToAddress: 'bYYY0987654321fedcba',
    },
  }

  const StatusIcon = getStatusIcon(status)
  const statusColor = getStatusColor(status)
  const isProcessing = status === 'broadcasting'
  const isFailed = status === 'failed'
  const isBroadcasted = status === 'broadcasted'

  const handleRetry = () => {
    setIsRetrying(true)
    setStatus('broadcasting')
    setTimeout(() => {
      setIsRetrying(false)
      setStatus('broadcasted')
    }, 1500)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      alert('Transaction deleted')
    }, 500)
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('pendingTx.title')} onBack={() => {}} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
          <div className={cn('flex size-16 items-center justify-center rounded-full', statusColor)}>
            <StatusIcon className={cn('size-8', isProcessing && 'animate-spin')} />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {t(`type.${mockTx.meta?.type ?? 'transfer'}`, mockTx.meta?.type ?? 'transfer')}
            </p>
            <p className="text-2xl font-semibold">
              {mockTx.meta?.displayAmount} {mockTx.meta?.displaySymbol}
            </p>
          </div>

          <div className={cn('rounded-full px-3 py-1 text-sm font-medium', statusColor)}>
            {t(`txStatus.${status}`)}
          </div>

          <p className="text-muted-foreground text-center text-sm">
            {t(`txStatus.${status}Desc`)}
          </p>
        </div>

        {/* 错误信息 */}
        {isFailed && mockTx.errorMessage && (
          <div className="bg-destructive/10 border-destructive/20 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="text-destructive mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-destructive text-sm font-medium">{t('pendingTx.failed')}</p>
                <p className="text-destructive/80 mt-1 text-sm">{mockTx.errorMessage}</p>
                {mockTx.errorCode && (
                  <p className="text-destructive/60 mt-1 text-xs">
                    {t('detail.errorCode')}: {mockTx.errorCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 详细信息 */}
        <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">{t('detail.info')}</h3>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.fromAddress')}</span>
            <AddressDisplay address={mockTx.fromAddress} copyable className="max-w-[180px]" />
          </div>

          {mockTx.meta?.displayToAddress && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.toAddress')}</span>
              <AddressDisplay address={mockTx.meta.displayToAddress} copyable className="max-w-[180px]" />
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.chain')}</span>
            <span className="text-sm">BioForest Mainnet</span>
          </div>

          {mockTx.txHash && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.hash')}</span>
              <span className="text-muted-foreground max-w-[180px] truncate text-xs font-mono">
                {mockTx.txHash.slice(0, 16)}...{mockTx.txHash.slice(-8)}
              </span>
            </div>
          )}

          {mockTx.retryCount > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('pendingTx.retryCount')}</span>
              <span className="text-sm">{mockTx.retryCount}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.time')}</span>
            <span className="text-sm">
              {new Date(mockTx.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {isBroadcasted && (
            <Button variant="outline" className="w-full">
              <IconExternalLink className="mr-2 size-4" />
              {t('detail.openInExplorer')}
            </Button>
          )}

          {isFailed && (
            <Button
              className="w-full"
              onClick={handleRetry}
              disabled={isRetrying}
              data-testid="retry-button"
            >
              {isRetrying ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconRefresh className="mr-2 size-4" />
              )}
              {isRetrying ? t('common:loading') : t('pendingTx.retry')}
            </Button>
          )}

          {(isFailed || status === 'created') && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={isDeleting}
              data-testid="delete-button"
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

/**
 * 广播中状态
 */
export const Broadcasting: Story = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <MockDetailPage initialStatus="broadcasting" />
    </div>
  ),
}

/**
 * 等待上链状态
 */
export const Broadcasted: Story = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <MockDetailPage 
        initialStatus="broadcasted" 
        txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      />
    </div>
  ),
}

/**
 * 广播失败状态
 */
export const Failed: Story = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <MockDetailPage 
        initialStatus="failed" 
        errorMessage="资产余额不足"
      />
    </div>
  ),
}

/**
 * 已确认状态
 */
export const Confirmed: Story = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <MockDetailPage 
        initialStatus="confirmed" 
        txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      />
    </div>
  ),
}

/**
 * 交互测试 - 重试和删除
 */
export const InteractiveTest: Story = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <MockDetailPage 
        initialStatus="failed" 
        errorMessage="手续费不足"
      />
    </div>
  ),
}
