/**
 * Pending Transaction List Component
 * 
 * 显示未上链的交易列表，支持重试和删除操作
 * 使用 @biochain/key-ui 组件库
 */

import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/stackflow'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconCircle, AddressDisplay, Alert } from '@biochain/key-ui'
import { IconRefresh, IconTrash, IconLoader2, IconAlertCircle, IconClock, IconCheck } from '@tabler/icons-react'
import type { PendingTx, PendingTxStatus } from '@/services/transaction'

interface PendingTxListProps {
  transactions: PendingTx[]
  onRetry?: (tx: PendingTx) => void
  onDelete?: (tx: PendingTx) => void
  className?: string
}

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

function getStatusVariant(status: PendingTxStatus): 'primary' | 'warning' | 'error' | 'success' {
  switch (status) {
    case 'created':
    case 'broadcasting':
      return 'primary'
    case 'broadcasted':
      return 'warning'
    case 'failed':
      return 'error'
    case 'confirmed':
      return 'success'
    default:
      return 'primary'
  }
}

function PendingTxItem({ 
  tx, 
  onRetry, 
  onDelete,
  onClick,
}: { 
  tx: PendingTx
  onRetry?: (tx: PendingTx) => void
  onDelete?: (tx: PendingTx) => void
  onClick?: (tx: PendingTx) => void
}) {
  const { t } = useTranslation('transaction')
  const StatusIcon = getStatusIcon(tx.status)
  const statusVariant = getStatusVariant(tx.status)
  const isFailed = tx.status === 'failed'
  const isProcessing = tx.status === 'broadcasting'
  const isBroadcasted = tx.status === 'broadcasted'

  // 获取展示信息
  const displayAmount = tx.meta?.displayAmount ?? ''
  const displaySymbol = tx.meta?.displaySymbol ?? ''
  const displayType = tx.meta?.type ?? 'transfer'
  const displayToAddress = tx.meta?.displayToAddress ?? ''

  const handleClick = () => {
    onClick?.(tx)
  }

  return (
    <button 
      type="button"
      className="bg-card border-border flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
      onClick={handleClick}
    >
      {/* Status Icon - 使用 IconCircle */}
      <div className="relative">
        <IconCircle
          icon={<StatusIcon className={cn(isProcessing && 'animate-spin')} />}
          variant={statusVariant}
          size="sm"
        />
        {/* Pulse animation for broadcasting/broadcasted */}
        {(isProcessing || isBroadcasted) && (
          <span className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-30',
            isProcessing ? 'bg-primary' : 'bg-warning'
          )} />
        )}
      </div>

      {/* Transaction Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {t(`type.${displayType}`, displayType)}
          </span>
          <span className={cn(
            'text-xs',
            statusVariant === 'primary' && 'text-primary',
            statusVariant === 'warning' && 'text-warning',
            statusVariant === 'error' && 'text-destructive',
            statusVariant === 'success' && 'text-success',
          )}>
            {t(`pendingTx.${tx.status}`)}
          </span>
        </div>
        
        {displayAmount && (
          <p className="text-muted-foreground text-xs">
            {displayAmount} {displaySymbol}
            {displayToAddress && (
              <span className="ml-1">
                → <AddressDisplay 
                    address={displayToAddress} 
                    mode="fixed" 
                    startChars={6} 
                    endChars={4}
                    copyable={false}
                    className="inline text-xs"
                  />
              </span>
            )}
          </p>
        )}

        {isFailed && tx.errorMessage && (
          <Alert variant="error" className="mt-2 p-2">
            <pre className="text-xs overflow-auto whitespace-break-spaces">
              {tx.errorMessage}
            </pre>
          </Alert>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-1">
        {isFailed && onRetry && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => { e.stopPropagation(); onRetry(tx) }}
            title={t('pendingTx.retry')}
          >
            <IconRefresh className="size-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={(e) => { e.stopPropagation(); onDelete(tx) }}
            title={t('pendingTx.delete')}
          >
            <IconTrash className="size-4" />
          </Button>
        )}
      </div>
    </button>
  )
}

export function PendingTxList({ 
  transactions, 
  onRetry, 
  onDelete, 
  className 
}: PendingTxListProps) {
  const { t } = useTranslation('transaction')
  const { navigate } = useNavigation()

  const handleClick = (tx: PendingTx) => {
    navigate({ to: `/pending-tx/${tx.id}` })
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wider">
        {t('pendingTx.title')}
      </h3>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <PendingTxItem
            key={tx.id}
            tx={tx}
            onRetry={onRetry}
            onDelete={onDelete}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  )
}
