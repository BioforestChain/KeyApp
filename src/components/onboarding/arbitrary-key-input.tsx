import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArbitraryKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ArbitraryKeyInput({ value, onChange, disabled = false, className }: ArbitraryKeyInputProps) {
  const { t } = useTranslation(['onboarding', 'common']);
  const [isHidden, setIsHidden] = useState(true);
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleLabel = useMemo(
    () => (isHidden ? t('common:a11y.showPassword') : t('common:a11y.hidePassword')),
    [isHidden, t],
  );

  const canReset = value.trim() !== '' && !disabled;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={textareaId} className="text-sm font-medium">
          {t('onboarding:keyType.arbitrary')}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{value.length}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsHidden((prev) => !prev)}
            disabled={disabled}
            aria-label={toggleLabel}
          >
            {isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              onChange('');
              textareaRef.current?.focus();
            }}
            disabled={!canReset}
            aria-label={t('common:reset')}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <textarea
        id={textareaId}
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('onboarding:arbitraryKey.placeholder')}
        disabled={disabled}
        rows={4}
        className={cn(
          'bg-background w-full resize-none rounded-lg border px-3 py-3 text-sm',
          'placeholder:text-muted-foreground',
          'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isHidden ? '[-webkit-text-security:disc]' : '[-webkit-text-security:none]',
        )}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="text-muted-foreground text-xs">{t('onboarding:arbitraryKey.hint')}</div>
    </div>
  );
}
