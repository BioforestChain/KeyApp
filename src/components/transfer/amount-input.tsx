import { useState, forwardRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Amount } from '@/types/amount';

interface AmountInputProps {
  /** Amount value (controlled). Pass null or undefined for empty/invalid state */
  value?: Amount | null | undefined;
  /** Called when user input changes. Provides Amount (or null if invalid) */
  onChange?: ((value: Amount | null) => void) | undefined;
  /** Decimals for Amount parsing (required if balance not provided) */
  decimals?: number | undefined;
  /** Symbol to display (falls back to balance.symbol) */
  symbol?: string | undefined;
  /** Available balance as Amount */
  balance?: Amount | undefined;
  /** Max allowed amount (defaults to balance) */
  max?: Amount | undefined;
  /** Disable max button */
  maxDisabled?: boolean | undefined;
  /** Fiat value to display */
  fiatValue?: string | undefined;
  /** Fiat symbol (default: $) */
  fiatSymbol?: string | undefined;
  /** Error message */
  error?: string | undefined;
  /** Label text */
  label?: string | undefined;
  /** Additional class names */
  className?: string | undefined;
  /** Disabled state */
  disabled?: boolean | undefined;
}

function sanitizeInput(value: string): string {
  // Remove non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
}

function limitDecimals(value: string, maxDecimals: number): string {
  const parts = value.split('.');
  if (parts.length === 2 && parts[1]!.length > maxDecimals) {
    return parts[0] + '.' + parts[1]!.slice(0, maxDecimals);
  }
  return value;
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      value,
      onChange,
      decimals: propDecimals,
      symbol: propSymbol,
      balance,
      fiatValue,
      fiatSymbol = '$',
      max,
      maxDisabled = false,
      error,
      label,
      className,
      disabled = false,
    },
    ref,
  ) => {
    const { t } = useTranslation('common');
    const [focused, setFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Derive decimals and symbol from balance or props
    const decimals = propDecimals ?? balance?.decimals ?? 18;
    const symbol = propSymbol ?? balance?.symbol ?? '';
    const effectiveMax = max ?? balance;
    const isMaxDisabled = disabled || maxDisabled;

    // Sync input value when controlled value changes from parent
    useEffect(() => {
      if (value) {
        const formatted = value.toFormatted();
        // Only update if different to avoid cursor jump
        if (formatted !== inputValue && !focused) {
          setInputValue(formatted);
        }
      } else if (value === null && inputValue !== '' && !focused) {
        // Don't clear input while user is typing
      }
    }, [value, focused]); // eslint-disable-line react-hooks/exhaustive-deps

    // Check if current value exceeds max
    const isOverMax = value && effectiveMax ? value.gt(effectiveMax) : false;

    const parseInputToAmount = useCallback((input: string): Amount | null => {
      if (!input || input === '.' || input === '-') {
        return null;
      }
      return Amount.tryFromFormatted(input, decimals, symbol || undefined);
    }, [decimals, symbol]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const sanitized = sanitizeInput(raw);
      const limited = limitDecimals(sanitized, decimals);

      setInputValue(limited);

      const amount = parseInputToAmount(limited);
      onChange?.(amount);
    };

    const handleMax = () => {
      if (effectiveMax) {
        const formatted = effectiveMax.toFormatted();
        setInputValue(formatted);
        onChange?.(effectiveMax);
      }
    };

    const handleBlur = () => {
      setFocused(false);
      // Clean up display value on blur (e.g., "1." -> "1")
      if (value) {
        setInputValue(value.toFormatted());
      } else if (inputValue && !parseInputToAmount(inputValue)) {
        // Invalid input, clear it
        setInputValue('');
      }
    };

    // Format balance for display
    const balanceDisplay = balance?.toFormatted() ?? undefined;

    return (
      <div className={cn('@container space-y-2', className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">{label}</label>
            {balance && (
              <span className="text-muted-foreground text-xs">
                {t('balance')}: {balanceDisplay} {symbol}
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
              data-testid="amount-input"
              value={inputValue}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              className={cn(
                'placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none @xs:text-3xl',
                disabled && 'cursor-not-allowed',
              )}
              placeholder="0"
              disabled={disabled}
              autoComplete="off"
            />

            <div className="flex items-center gap-2">
              {effectiveMax && (
                <button
                  type="button"
                  onClick={handleMax}
                  disabled={isMaxDisabled}
                  className={cn(
                    'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    isMaxDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  MAX
                </button>
              )}
              {symbol && <span className="text-muted-foreground text-lg font-medium">{symbol}</span>}
            </div>
          </div>

          {fiatValue && inputValue && (
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

export { AmountInput, sanitizeInput, limitDecimals };
