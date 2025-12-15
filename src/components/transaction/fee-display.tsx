import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/common/skeleton';
import { AlertTriangle } from 'lucide-react';

interface FeeDisplayProps {
  /** Fee amount in native token */
  amount: string | number;
  /** Native token symbol (e.g., ETH, TRX) */
  symbol: string;
  /** Optional fiat equivalent value */
  fiatValue?: string | number | undefined;
  /** Fiat currency symbol */
  fiatSymbol?: string | undefined;
  /** Whether fee is being calculated */
  isLoading?: boolean | undefined;
  /** Threshold for high fee warning (in fiat) */
  highFeeThreshold?: number | undefined;
  /** Additional class names */
  className?: string | undefined;
}

function formatFee(value: string | number, decimals: number = 6): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

function formatFiat(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Fee display component showing transaction fees with optional fiat equivalent
 */
export function FeeDisplay({
  amount,
  symbol,
  fiatValue,
  fiatSymbol = '$',
  isLoading = false,
  highFeeThreshold,
  className,
}: FeeDisplayProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)} aria-busy="true" aria-label="Loading fee">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  const fiatNum = fiatValue !== undefined ? (typeof fiatValue === 'string' ? parseFloat(fiatValue) : fiatValue) : null;
  const isHighFee = fiatNum !== null && highFeeThreshold !== undefined && fiatNum >= highFeeThreshold;

  return (
    <div className={cn('space-y-0.5', className)}>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm" aria-label={`Fee: ${formatFee(amount)} ${symbol}`}>
          {formatFee(amount)} {symbol}
        </span>
        {isHighFee && <AlertTriangle className="text-warning size-4" aria-label="High fee warning" />}
      </div>
      {fiatNum !== null && (
        <p className={cn('text-muted-foreground text-xs', isHighFee && 'text-warning')}>
          ≈ {fiatSymbol}
          {formatFiat(fiatNum)}
        </p>
      )}
    </div>
  );
}
