import { useTranslation, Trans } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  IconCircleCheck as CheckCircle,
  IconChevronRight as ArrowRight,
} from '@tabler/icons-react';

interface ImportWalletSuccessProps {
  /** Wallet name */
  walletName: string;
  /** Callback when user chooses to enter wallet */
  onEnterWallet: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Success screen shown after wallet import
 */
export function ImportWalletSuccess({
  walletName,
  onEnterWallet,
  className,
}: ImportWalletSuccessProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className={cn('flex min-h-screen flex-col items-center justify-center px-6 py-8', className)}>
      {/* Success icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
      </div>

      {/* Success message */}
      <h1 className="mb-2 text-2xl font-bold">{t('import.success.title')}</h1>
      <p className="text-muted-foreground mb-8 text-center">
        <Trans
          i18nKey="import.success.description"
          ns="onboarding"
          values={{ name: walletName }}
          components={{ bold: <span className="text-foreground font-medium" /> }}
        />
      </p>

      {/* Enter wallet button */}
      <div className="w-full max-w-xs">
        <button
          type="button"
          onClick={onEnterWallet}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors',
            'bg-primary hover:bg-primary/90 text-white',
          )}
        >
          <span>{t('import.success.enterWallet')}</span>
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
