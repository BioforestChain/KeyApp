import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export interface BalanceWarningProps {
  /** Current balance (formatted string) */
  balance: string
  /** Required amount for transaction + fee (formatted string) */
  required: string
  /** Token symbol */
  symbol: string
  /** Additional class name */
  className?: string
}

/**
 * Warning component displayed when balance is insufficient for a transaction
 */
export function BalanceWarning({
  balance,
  required,
  symbol,
  className,
}: BalanceWarningProps) {
  const { t } = useTranslation('authorize')

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl bg-warning/10 p-4',
        className
      )}
    >
      <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-warning">
          {t('error.insufficientBalance')}
        </p>
        <div className="space-y-0.5 text-sm text-muted-foreground">
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
  )
}
