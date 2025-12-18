import { useTranslation, Trans } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  IconCircleCheck as CheckCircle,
  IconChevronRight as ArrowRight,
  IconShield as Shield,
} from '@tabler/icons-react';

interface CreateWalletSuccessProps {
  /** Wallet name */
  walletName: string;
  /** Callback when user chooses to backup mnemonic */
  onBackup?: () => void;
  /** Callback when user chooses to enter wallet */
  onEnterWallet: () => void;
  /** Whether backup is skipped (skipBackup=true) */
  skipBackup?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Success screen shown after wallet creation
 */
export function CreateWalletSuccess({
  walletName,
  onBackup,
  onEnterWallet,
  skipBackup = true,
  className,
}: CreateWalletSuccessProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className={cn('flex flex-col items-center px-6 py-8', className)}>
      {/* Success icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
      </div>

      {/* Success message */}
      <h1 className="mb-2 text-2xl font-bold">{t('create.success.title')}</h1>
      <p className="text-muted-foreground mb-8 text-center">
        <Trans
          i18nKey="create.success.description"
          ns="onboarding"
          values={{ name: walletName }}
          components={{ bold: <span className="text-foreground font-medium" /> }}
        />
      </p>

      {/* Backup reminder */}
      {skipBackup && onBackup && (
        <div className="mb-8 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">{t('create.success.securityReminder')}</p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {t('create.success.securityReminderDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full space-y-3">
        {skipBackup && onBackup && (
          <button
            type="button"
            onClick={onBackup}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium text-white transition-colors',
              'bg-primary hover:bg-primary/90',
            )}
          >
            <Shield className="size-5" />
            <span>{t('create.success.backupNow')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onEnterWallet}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors',
            skipBackup && onBackup
              ? 'border-border text-foreground hover:bg-muted border'
              : 'bg-primary hover:bg-primary/90 text-white',
          )}
        >
          <span>{skipBackup && onBackup ? t('create.success.backupLater') : t('create.success.enterWallet')}</span>
          <ArrowRight className="size-5" />
        </button>
      </div>

      {/* Skip backup note */}
      {skipBackup && onBackup && (
        <p className="text-muted-foreground mt-4 text-center text-xs">{t('create.success.backupNote')}</p>
      )}
    </div>
  );
}
