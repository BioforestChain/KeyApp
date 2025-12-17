import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { IconChevronDown as ChevronDown, IconChevronUp as ChevronUp, IconCopy as Copy, IconCheck as Check } from '@tabler/icons-react';

export interface TransferConfirmSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Close callback */
  onClose: () => void;
  /** Confirm callback */
  onConfirm: () => void;
  /** Transfer amount */
  amount: string;
  /** Token symbol */
  symbol: string;
  /** Fiat equivalent */
  fiatValue?: string | undefined;
  /** Recipient address */
  toAddress: string;
  /** Fee amount in native token */
  feeAmount: string | number;
  /** Fee token symbol */
  feeSymbol: string;
  /** Fee fiat value */
  feeFiatValue?: string | number | undefined;
  /** Fee loading state */
  feeLoading?: boolean | undefined;
  /** High fee threshold */
  highFeeThreshold?: number | undefined;
  /** Confirming state */
  isConfirming?: boolean | undefined;
  /** Additional class name */
  className?: string | undefined;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

/**
 * Transfer confirmation sheet showing transfer details before execution
 */
export function TransferConfirmSheet({
  open,
  onClose,
  onConfirm,
  amount,
  symbol,
  fiatValue,
  toAddress,
  feeAmount,
  feeSymbol,
  feeFiatValue,
  feeLoading,
  highFeeThreshold,
  isConfirming,
  className,
}: TransferConfirmSheetProps) {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy address');
    }
  }, [toAddress]);

  const toggleAddress = useCallback(() => {
    setShowFullAddress((prev) => !prev);
  }, []);

  return (
    <BottomSheet open={open} onClose={onClose} title="确认转账" className={className}>
      <div className="space-y-6 p-4">
        {/* Amount */}
        <div className="text-center">
          <p className="text-3xl font-bold">
            {amount} {symbol}
          </p>
          {fiatValue && <p className="text-muted-foreground mt-1">≈ ${fiatValue}</p>}
        </div>

        {/* Details */}
        <div className="bg-muted/30 space-y-4 rounded-xl p-4">
          {/* Recipient */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">收款地址</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAddress}
                className="hover:text-primary flex min-w-0 flex-1 items-center gap-1 text-left font-mono text-sm"
              >
                <span className={cn('min-w-0', showFullAddress ? 'break-all' : 'truncate')}>
                  {showFullAddress ? toAddress : truncateAddress(toAddress)}
                </span>
                {showFullAddress ? (
                  <ChevronUp className="size-4 shrink-0" />
                ) : (
                  <ChevronDown className="size-4 shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                aria-label={copied ? '已复制' : '复制地址'}
              >
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          {/* Fee */}
          <div className="flex items-start justify-between">
            <p className="text-muted-foreground text-sm">网络费用</p>
            <FeeDisplay
              amount={feeAmount}
              symbol={feeSymbol}
              {...(feeFiatValue !== undefined && { fiatValue: feeFiatValue })}
              {...(feeLoading !== undefined && { isLoading: feeLoading })}
              {...(highFeeThreshold !== undefined && { highFeeThreshold })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border-border hover:bg-muted flex-1 rounded-full border py-3 font-medium transition-colors"
            disabled={isConfirming}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming || feeLoading}
            className={cn(
              'flex-1 rounded-full py-3 font-medium text-white transition-colors',
              'bg-primary hover:bg-primary/90',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isConfirming ? '确认中...' : '确认转账'}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
