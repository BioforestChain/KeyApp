import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { IconEye as Eye, IconEyeOff as EyeOff } from '@tabler/icons-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
  'data-testid'?: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

function calculateStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

const strengthConfig = {
  weak: { label: '弱', color: 'bg-destructive', width: 'w-1/3' }, // i18n-ignore: visual indicator
  medium: { label: '中', color: 'bg-yellow-500', width: 'w-2/3' }, // i18n-ignore: visual indicator
  strong: { label: '强', color: 'bg-secondary', width: 'w-full' }, // i18n-ignore: visual indicator
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, onStrengthChange, onChange, value, 'data-testid': testId, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [strength, setStrength] = useState<PasswordStrength>('weak');
    const [hasValue, setHasValue] = useState(!!value);
    const { t } = useTranslation('common');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setHasValue(!!inputValue);
      if (showStrength) {
        const newStrength = calculateStrength(inputValue);
        setStrength(newStrength);
        onStrengthChange?.(newStrength);
      }
      onChange?.(e);
    };

    const config = strengthConfig[strength];

    return (
      <div className="@container space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            data-testid={testId}
            className={cn(
              'border-input bg-background flex h-11 w-full rounded-lg border px-3 py-2 pr-10 text-base',
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            value={value}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
            tabIndex={-1}
            aria-label={visible ? t('a11y.hidePassword') : t('a11y.showPassword')}
          >
            {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        {showStrength && hasValue && (
          <div className="space-y-1" aria-live="polite" aria-atomic="true">
            <div
              className="bg-muted h-1 w-full overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={cn('h-full transition-all duration-300', config.color, config.width)} />
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="sr-only">{t('a11y.passwordStrength', { strength: config.label })}</span>
              <span aria-hidden="true">
                {t('passwordStrength')}：
                <span
                  className={cn(
                    strength === 'weak' && 'text-destructive',
                    strength === 'medium' && 'text-yellow-500',
                    strength === 'strong' && 'text-green-500',
                  )}
                >
                  {config.label}
                </span>
              </span>
            </p>
          </div>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput, calculateStrength };
