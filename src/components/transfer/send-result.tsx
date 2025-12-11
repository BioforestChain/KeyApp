import { cn } from '@/lib/utils'
import { IconCircle } from '@/components/common/icon-circle'
import { TransactionStatus } from '@/components/transaction/transaction-status'
import { Check, X, ExternalLink, Copy, ArrowLeft } from 'lucide-react'
import { useState, useCallback } from 'react'

type SendResultStatus = 'success' | 'failed' | 'pending'

interface SendResultProps {
  /** Result status: 'success', 'failed', or 'pending' */
  status: SendResultStatus
  /** Transaction hash for explorer link */
  txHash?: string | undefined
  /** Amount transferred */
  amount: string
  /** Token symbol */
  symbol: string
  /** Recipient address */
  toAddress: string
  /** Error message if failed */
  errorMessage?: string | undefined
  /** Callback to view transaction in explorer */
  onViewExplorer?: (() => void) | undefined
  /** Callback to return home */
  onDone?: (() => void) | undefined
  /** Callback to retry transfer (only shown on failure) */
  onRetry?: (() => void) | undefined
  /** Additional class name */
  className?: string | undefined
}

function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

/**
 * Send result page showing transaction success/failure
 */
export function SendResult({
  status,
  txHash,
  amount,
  symbol,
  toAddress,
  errorMessage,
  onViewExplorer,
  onDone,
  onRetry,
  className,
}: SendResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyHash = useCallback(async () => {
    if (!txHash) return
    try {
      await navigator.clipboard.writeText(txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy hash')
    }
  }, [txHash])

  const isSuccess = status === 'success'
  const isFailed = status === 'failed'
  const isPending = status === 'pending'

  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center px-6 py-8', className)}>
      {/* Status Icon */}
      <div className="mb-6">
        {isSuccess && (
          <IconCircle
            icon={Check}
            size="lg"
            variant="success"
            className="size-20 animate-in zoom-in duration-300"
          />
        )}
        {isFailed && (
          <IconCircle
            icon={X}
            size="lg"
            variant="error"
            className="size-20 animate-in zoom-in duration-300"
          />
        )}
        {isPending && (
          <div className="size-20 animate-pulse rounded-full bg-muted" />
        )}
      </div>

      {/* Status Title */}
      <h2 className="mb-2 text-xl font-semibold">
        {isSuccess && '转账成功'}
        {isFailed && '转账失败'}
        {isPending && '处理中...'}
      </h2>

      {/* Amount */}
      <p className="mb-1 text-3xl font-bold">
        {amount} {symbol}
      </p>

      {/* Recipient */}
      <p className="mb-6 text-sm text-muted-foreground">
        发送至 {truncateAddress(toAddress)}
      </p>

      {/* Error Message */}
      {isFailed && errorMessage && (
        <div className="mb-6 w-full max-w-sm rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Transaction Hash */}
      {txHash && isSuccess && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span>交易哈希:</span>
          <button
            type="button"
            onClick={handleCopyHash}
            className="font-mono hover:text-foreground"
          >
            {truncateHash(txHash)}
          </button>
          {copied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4 cursor-pointer hover:text-foreground" onClick={handleCopyHash} />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {/* View Explorer (success only) */}
        {isSuccess && onViewExplorer && (
          <button
            type="button"
            onClick={onViewExplorer}
            className="flex items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-4" />
            在浏览器中查看
          </button>
        )}

        {/* Retry (failed only) */}
        {isFailed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            重试
          </button>
        )}

        {/* Done / Back */}
        <button
          type="button"
          onClick={onDone}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors',
            isSuccess || isPending
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'border border-border hover:bg-muted'
          )}
        >
          {isFailed ? (
            <>
              <ArrowLeft className="size-4" />
              返回
            </>
          ) : (
            '完成'
          )}
        </button>
      </div>

      {/* Pending Status */}
      {isPending && (
        <div className="mt-6">
          <TransactionStatus status="pending" showLabel />
        </div>
      )}
    </div>
  )
}
