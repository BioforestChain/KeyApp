import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';

export interface BalanceWarningProps {
  /** Current balance (formatted string) */
  balance: string;
  /** Required amount for transaction + fee (formatted string) */
  required: string;
  /** Token symbol */
  symbol: string;
  /** Additional class name */
  className?: string;
}

/**
 * Warning component displayed when balance is insufficient for a transaction
 */
export function BalanceWarning({ balance, required, symbol, className }: BalanceWarningProps) {
  const { t } = useTranslation('authorize');

  return (
    <div role="alert" className={cn('bg-warning/10 flex items-start gap-3 rounded-xl p-4', className)}>
      <AlertTriangle className="text-warning size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-warning text-sm font-medium">{t('error.insufficientBalance')}</p>
        <div className="text-muted-foreground space-y-0.5 text-sm">
          <p>
            {t('signature.balanceWarning.need', {
              amount: required,
              symbol,
              defaultValue: `Need: ${required} ${symbol}`,
            })}
          </p>
          <p>
            {t('signature.balanceWarning.have', {
              amount: balance,
              symbol,
              defaultValue: `Have: ${balance} ${symbol}`,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
