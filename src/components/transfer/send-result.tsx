import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconCircle } from '@/components/common/icon-circle';
import { TransactionStatus } from '@/components/transaction/transaction-status';
import { AddressDisplay } from '@/components/wallet/address-display';
import { IconCheck as Check, IconX as X, IconExternalLink as ExternalLink, IconCopy as Copy, IconArrowLeft as ArrowLeft } from '@tabler/icons-react';
import { useState, useCallback } from 'react';
import { clipboardService } from '@/services/clipboard';

type SendResultStatus = 'success' | 'failed' | 'pending';

interface SendResultProps {
  /** Result status: 'success', 'failed', or 'pending' */
  status: SendResultStatus;
  /** Transaction hash for explorer link */
  txHash?: string | undefined;
  /** Amount transferred */
  amount: string;
  /** Token symbol */
  symbol: string;
  /** Recipient address */
  toAddress: string;
  /** Error message if failed */
  errorMessage?: string | undefined;
  /** Callback to view transaction in explorer */
  onViewExplorer?: (() => void) | undefined;
  /** Callback to return home */
  onDone?: (() => void) | undefined;
  /** Callback to retry transfer (only shown on failure) */
  onRetry?: (() => void) | undefined;
  /** Additional class name */
  className?: string | undefined;
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
  const { t } = useTranslation('transaction');
  const [copied, setCopied] = useState(false);

  const handleCopyHash = useCallback(async () => {
    if (!txHash) return;
    try {
      await clipboardService.write({ text: txHash });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy hash');
    }
  }, [txHash]);

  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isPending = status === 'pending';

  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center px-6 py-8', className)}>
      {/* Status Icon */}
      <div className="mb-6">
        {isSuccess && (
          <IconCircle icon={Check} size="lg" variant="success" className="animate-in zoom-in size-20 duration-300" />
        )}
        {isFailed && (
          <IconCircle icon={X} size="lg" variant="error" className="animate-in zoom-in size-20 duration-300" />
        )}
        {isPending && <div className="bg-muted size-20 animate-pulse rounded-full" />}
      </div>

      {/* Status Title */}
      <h2 className="mb-2 text-xl font-semibold">
        {isSuccess && t('sendResult.success')}
        {isFailed && t('sendResult.failed')}
        {isPending && t('sendResult.pending')}
      </h2>

      {/* Amount */}
      <p className="mb-1 text-3xl font-bold">
        {amount} {symbol}
      </p>

      {/* Recipient */}
      <p className="text-muted-foreground mb-6 flex items-center justify-center gap-1 text-sm">
        <span>{t('sendResult.sentTo', { address: '' })}</span>
        <AddressDisplay address={toAddress} startChars={8} endChars={6} copyable={false} />
      </p>

      {/* Error Message */}
      {isFailed && errorMessage && (
        <div className="bg-destructive/10 text-destructive mb-6 w-full max-w-sm rounded-lg p-3 text-center text-sm">
          {errorMessage}
        </div>
      )}

      {/* Transaction Hash */}
      {txHash && isSuccess && (
        <div className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
          <span>{t('sendResult.txHash')}</span>
          <AddressDisplay
            address={txHash}
            startChars={10}
            endChars={8}
            copyable
            onCopy={handleCopyHash}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {/* View Explorer (success only) */}
        {isSuccess && onViewExplorer && (
          <button
            type="button"
            onClick={onViewExplorer}
            className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-full border py-3 font-medium transition-colors"
          >
            <ExternalLink className="size-4" />
            {t('sendResult.viewInBrowser')}
          </button>
        )}

        {/* Retry (failed only) */}
        {isFailed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary hover:bg-primary/90 rounded-full py-3 font-medium text-primary-foreground transition-colors"
          >
            {t('sendResult.retry')}
          </button>
        )}

        {/* Done / Back */}
        <button
          type="button"
          onClick={onDone}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors',
            isSuccess || isPending
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'border-border hover:bg-muted border',
          )}
        >
          {isFailed ? (
            <>
              <ArrowLeft className="size-4" />
              {t('sendResult.back')}
            </>
          ) : (
            t('sendResult.done')
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
  );
}
