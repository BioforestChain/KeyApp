import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/common/skeleton';
import { AmountDisplay, formatAmount } from '@/components/common/amount-display';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';

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

/**
 * Fee display component showing transaction fees with optional fiat equivalent
 * Uses AmountDisplay for consistent amount formatting
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
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)} aria-busy="true" aria-label={t('a11y.loadingFee')}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  const fiatNum = fiatValue !== undefined ? (typeof fiatValue === 'string' ? parseFloat(fiatValue) : fiatValue) : null;
  const isHighFee = fiatNum !== null && highFeeThreshold !== undefined && fiatNum >= highFeeThreshold;
  const fiatFormatted = fiatNum !== null ? formatAmount(fiatNum, 2, false).formatted : null;

  return (
    <div className={cn('space-y-0.5', className)}>
      <div className="flex items-center gap-1.5">
        <AmountDisplay
          value={amount}
          symbol={symbol}
          size="sm"
          decimals={8}
          animated={false}
        />
        {isHighFee && <AlertTriangle className="text-warning size-4" aria-label={t('a11y.highFeeWarning')} />}
      </div>
      {fiatFormatted !== null && (
        <p className={cn('text-muted-foreground text-xs', isHighFee && 'text-warning')}>
          ≈ {fiatSymbol}
          {fiatFormatted}
        </p>
      )}
    </div>
  );
}
