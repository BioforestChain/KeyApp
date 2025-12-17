import { useState, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { IconLineScan as ScanLine, IconClipboardCopy as ClipboardPaste } from '@tabler/icons-react';

interface AddressInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onScan?: (() => void) | undefined;
  onPaste?: (() => void) | undefined;
  error?: string | undefined;
  label?: string | undefined;
}

function isValidAddress(address: string): boolean {
  if (!address) return true;
  // Basic validation for common address formats
  if (address.startsWith('0x') && address.length === 42) return true; // ETH
  if (address.startsWith('T') && address.length === 34) return true; // TRON
  if ((address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) && address.length >= 26)
    return true; // BTC
  if (address.length >= 20) return true; // Generic - allow for now
  return false;
}

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  ({ value = '', onChange, onScan, onPaste, error, label, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const { t } = useTranslation();
    const errorId = useId();

    const currentValue = value || internalValue;
    const isValid = isValidAddress(currentValue);
    const hasError = !!(error || (!isValid && currentValue));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.trim();
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();
        setInternalValue(trimmed);
        onChange?.(trimmed);
        onPaste?.();
      } catch {
        console.error('Failed to read clipboard');
      }
    };

    return (
      <div className={cn('@container space-y-2', className)}>
        {label && <label className="block text-sm font-medium">{label}</label>}
        <div
          className={cn(
            'bg-background relative flex items-center gap-1 rounded-xl border p-2 transition-colors @xs:gap-2 @xs:p-3',
            focused ? 'border-primary ring-primary/20 ring-2' : 'border-input',
            hasError && 'border-destructive ring-destructive/20 ring-2',
          )}
        >
          <input
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
            placeholder="输入或粘贴地址"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            {...props}
          />

          <div className="flex items-center">
            {onScan && (
              <button
                type="button"
                onClick={onScan}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-1.5 transition-colors @xs:p-2"
                aria-label={t('a11y.scanQrCode')}
              >
                <ScanLine className="size-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 @xs:text-primary @xs:hover:text-primary/80 rounded-lg p-1.5 transition-colors @xs:px-3 @xs:py-1.5 @xs:text-sm @xs:font-medium @xs:hover:bg-transparent"
              aria-label={t('a11y.paste')}
            >
              <ClipboardPaste className="size-5 @xs:hidden" />
              <span className="hidden @xs:inline">粘贴</span>
            </button>
          </div>
        </div>

        {/* Error message with aria-live for screen readers */}
        {hasError && (
          <p
            id={errorId}
            className="text-destructive -mt-0.5 text-xs"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error || t('a11y.invalidAddress')}
          </p>
        )}
      </div>
    );
  },
);
AddressInput.displayName = 'AddressInput';

export { AddressInput, isValidAddress };
