import { useState, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  symbol?: string | undefined;
  balance?: string | undefined;
  fiatValue?: string | undefined;
  fiatSymbol?: string | undefined;
  max?: string | undefined;
  error?: string | undefined;
  label?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
}

function formatInputValue(value: string): string {
  // Remove non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places to 8
  if (parts.length === 2 && parts[1]!.length > 8) {
    cleaned = parts[0] + '.' + parts[1]!.slice(0, 8);
  }

  return cleaned;
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      value = '',
      onChange,
      symbol = '',
      balance,
      fiatValue,
      fiatSymbol = '$',
      max,
      error,
      label,
      className,
      disabled = false,
    },
    ref,
  ) => {
    const { t } = useTranslation('common');
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);

    const currentValue = value || internalValue;
    const numValue = parseFloat(currentValue) || 0;
    const numMax = max ? parseFloat(max) : Infinity;
    const isOverMax = numValue > numMax;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatInputValue(e.target.value);
      setInternalValue(formatted);
      onChange?.(formatted);
    };

    const handleMax = () => {
      if (max) {
        setInternalValue(max);
        onChange?.(max);
      } else if (balance) {
        setInternalValue(balance);
        onChange?.(balance);
      }
    };

    return (
      <div className={cn('@container space-y-2', className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">{label}</label>
            {balance && (
              <span className="text-muted-foreground text-xs">
                {t('balance')}: {balance} {symbol}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'bg-background relative rounded-xl border p-4 transition-colors',
            focused ? 'border-primary ring-primary/20 ring-2' : 'border-input',
            (error || isOverMax) && 'border-destructive ring-destructive/20 ring-2',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="flex items-center gap-2">
            <input
              ref={ref}
              type="text"
              inputMode="decimal"
              value={currentValue}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={cn(
                'placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none @xs:text-3xl',
                disabled && 'cursor-not-allowed',
              )}
              placeholder="0"
              disabled={disabled}
              autoComplete="off"
            />

            <div className="flex items-center gap-2">
              {(balance || max) && !disabled && (
                <button
                  type="button"
                  onClick={handleMax}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                >
                  MAX
                </button>
              )}
              {symbol && <span className="text-muted-foreground text-lg font-medium">{symbol}</span>}
            </div>
          </div>

          {fiatValue && currentValue && (
            <p className="text-muted-foreground mt-1 text-sm">
              ≈ {fiatSymbol}
              {fiatValue}
            </p>
          )}
        </div>

        {(error || isOverMax) && <p className="text-destructive -mt-0.5 text-xs">{error || t('exceedsBalance')}</p>}
      </div>
    );
  },
);
AmountInput.displayName = 'AmountInput';

export { AmountInput, formatInputValue };
