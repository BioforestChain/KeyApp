import { IconCheck as Check } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type WalletKeyType = 'mnemonic' | 'arbitrary';

interface KeyTypeSelectorProps {
  value: WalletKeyType;
  onChange: (value: WalletKeyType) => void;
  disabled?: boolean;
  className?: string;
}

const OPTIONS: Array<{
  value: WalletKeyType;
  titleKey: string;
  descKey: string;
  tags: string[];
}> = [
  {
    value: 'mnemonic',
    titleKey: 'keyType.mnemonic',
    descKey: 'keyType.mnemonicDesc',
    tags: ['BIP39', 'BIP44', 'Bioforest'],
  },
  {
    value: 'arbitrary',
    titleKey: 'keyType.arbitrary',
    descKey: 'keyType.arbitraryDesc',
    tags: ['Bioforest'],
  },
];

export function KeyTypeSelector({ value, onChange, disabled = false, className }: KeyTypeSelectorProps) {
  const { t } = useTranslation(['onboarding', 'common']);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-sm font-medium">{t('onboarding:keyType.title')}</div>

      <div role="radiogroup" aria-label={t('onboarding:keyType.title')} className="grid gap-3">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'w-full rounded-xl border p-4 text-start transition-colors',
                'hover:bg-muted/30 focus-visible:ring-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
                isSelected && 'border-primary/50 bg-primary/5',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{t(`onboarding:${option.titleKey}`)}</div>
                  <div className="text-muted-foreground mt-1 text-xs">{t(`onboarding:${option.descKey}`)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-medium',
                          'bg-muted text-muted-foreground',
                          isSelected && 'bg-primary/10 text-primary',
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={cn(
                    'border-input mt-0.5 flex size-5 items-center justify-center rounded border',
                    'transition-colors',
                    isSelected && 'border-primary bg-primary text-primary-foreground',
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="size-3.5" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
