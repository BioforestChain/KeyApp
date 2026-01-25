import { IconAlertTriangle } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface ProviderFallbackWarningProps {
  feature: string
  reason?: string
  className?: string
}

export function ProviderFallbackWarning({ feature, reason, className }: ProviderFallbackWarningProps) {
  const { t } = useTranslation('error')
  return (
    <div
      className={cn(
        "rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20 px-4 py-3",
        className
      )}
      data-testid="provider-fallback-warning"
    >
      <div className="flex items-start gap-3">
        <IconAlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {t('providerFallback.title', { feature })}
          </p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300/80">
            {t('providerFallback.description')}
          </p>
          {reason && (
            <details className="mt-2">
              <summary className="text-xs text-yellow-600 dark:text-yellow-400 cursor-pointer hover:underline">
                {t('providerFallback.details')}
              </summary>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 font-mono break-all">
                {reason}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
