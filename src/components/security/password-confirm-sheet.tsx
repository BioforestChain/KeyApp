import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { PasswordInput } from './password-input';
import { IconFingerprint as Fingerprint, IconAlertCircle as AlertCircle } from '@tabler/icons-react';

export interface PasswordConfirmSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Close callback */
  onClose: () => void;
  /** Verify callback with password */
  onVerify: (password: string) => void;
  /** Title text */
  title?: string | undefined;
  /** Description text */
  description?: string | undefined;
  /** Error message to display */
  error?: string | undefined;
  /** Whether biometric is available */
  biometricAvailable?: boolean | undefined;
  /** Biometric auth callback */
  onBiometric?: (() => void) | undefined;
  /** Whether verification is in progress */
  isVerifying?: boolean | undefined;
  /** Additional class name */
  className?: string | undefined;
}

/**
 * Password confirmation sheet for secure operations
 */
export function PasswordConfirmSheet({
  open,
  onClose,
  onVerify,
  title,
  description,
  error,
  biometricAvailable,
  onBiometric,
  isVerifying,
  className,
}: PasswordConfirmSheetProps) {
  const { t } = useTranslation('security');
  const [password, setPassword] = useState('');
  const displayTitle = title ?? t('passwordConfirm.defaultTitle');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password.trim()) {
        onVerify(password);
      }
    },
    [password, onVerify],
  );

  const handleClose = useCallback(() => {
    setPassword('');
    onClose();
  }, [onClose]);

  const canSubmit = password.trim().length > 0 && !isVerifying;

  return (
    <BottomSheet open={open} onClose={handleClose} title={displayTitle} className={className}>
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        {description && <p className="text-muted-foreground text-center">{description}</p>}

        {/* Password input */}
        <div className="space-y-2">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordConfirm.placeholder')}
            autoFocus
            disabled={isVerifying}
            aria-describedby={error ? 'password-error' : undefined}
          />
          {error && (
            <div id="password-error" className="text-destructive flex items-center gap-1.5 text-sm">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'w-full rounded-full py-3 font-medium text-white transition-colors',
              'bg-primary hover:bg-primary/90',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isVerifying ? t('passwordConfirm.verifying') : t('passwordConfirm.confirm')}
          </button>

          {biometricAvailable && onBiometric && (
            <button
              type="button"
              onClick={onBiometric}
              disabled={isVerifying}
              className={cn(
                'border-border flex w-full items-center justify-center gap-2 rounded-full border py-3 font-medium transition-colors',
                'hover:bg-muted',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <Fingerprint className="size-5" />
              <span>{t('passwordConfirm.biometric')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            disabled={isVerifying}
            className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm"
          >
            {t('passwordConfirm.cancel')}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
