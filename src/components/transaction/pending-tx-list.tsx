/**
 * Pending Transaction List Component
 * 
 * 显示未上链的交易列表，支持重试和删除操作
 */

import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/stackflow'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconTrash, IconLoader2, IconAlertCircle, IconClock } from '@tabler/icons-react'
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
    default:
      return IconClock
  }
}

function getStatusColor(status: PendingTxStatus) {
  switch (status) {
    case 'created':
    case 'broadcasting':
      return 'text-blue-500'
    case 'broadcasted':
      return 'text-yellow-500'
    case 'failed':
      return 'text-red-500'
    case 'confirmed':
      return 'text-green-500'
    default:
      return 'text-muted-foreground'
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
  const statusColor = getStatusColor(tx.status)
  const isFailed = tx.status === 'failed'
  const isProcessing = tx.status === 'broadcasting'

  // 获取展示信息
  const displayAmount = tx.meta?.displayAmount ?? ''
  const displaySymbol = tx.meta?.displaySymbol ?? ''
  const displayType = tx.meta?.type ?? 'transfer'
  const displayToAddress = tx.meta?.displayToAddress ?? ''

  const handleClick = () => {
    onClick?.(tx)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div 
      className="bg-card border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Status Icon */}
      <div className={cn('flex size-10 items-center justify-center rounded-full bg-muted', statusColor)}>
        <StatusIcon className={cn('size-5', isProcessing && 'animate-spin')} />
      </div>

      {/* Transaction Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {t(`type.${displayType}`, displayType)}
          </span>
          <span className={cn('text-xs', statusColor)}>
            {t(`pendingTx.${tx.status === 'broadcasting' ? 'broadcasting' : tx.status === 'broadcasted' ? 'broadcasted' : 'failed'}`)}
          </span>
        </div>
        
        {displayAmount && (
          <p className="text-muted-foreground text-xs">
            {displayAmount} {displaySymbol}
            {displayToAddress && (
              <span className="ml-1">
                → {displayToAddress.slice(0, 8)}...{displayToAddress.slice(-6)}
              </span>
            )}
          </p>
        )}

        {isFailed && tx.errorMessage && (
          <p className="text-destructive mt-1 text-xs">
            {tx.errorMessage}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        {isFailed && onRetry && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => handleActionClick(e, () => onRetry(tx))}
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
            onClick={(e) => handleActionClick(e, () => onDelete(tx))}
            title={t('pendingTx.delete')}
          >
            <IconTrash className="size-4" />
          </Button>
        )}
      </div>
    </div>
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
