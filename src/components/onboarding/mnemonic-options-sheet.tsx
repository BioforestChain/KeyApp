import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { IconCheck as Check } from '@tabler/icons-react';
import type { MnemonicLanguage, MnemonicLength, MnemonicOptions } from './create-wallet-form';

interface MnemonicOptionsSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Close callback */
  onClose: () => void;
  /** Confirm selection callback */
  onConfirm: (options: MnemonicOptions) => void;
  /** Current selected options */
  value: MnemonicOptions;
  /** Additional class name */
  className?: string | undefined;
}

const LANGUAGE_OPTIONS: { value: MnemonicLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'zh-Hans', label: '中文（简体）' },
  { value: 'zh-Hant', label: '中文（繁體）' },
];

const LENGTH_OPTIONS: MnemonicLength[] = [12, 15, 18, 21, 24, 36];

/**
 * Bottom sheet for selecting mnemonic language and length options
 */
export function MnemonicOptionsSheet({ open, onClose, onConfirm, value, className }: MnemonicOptionsSheetProps) {
  const { t } = useTranslation('onboarding');

  const handleLanguageSelect = (language: MnemonicLanguage) => {
    onConfirm({ ...value, language });
  };

  const handleLengthSelect = (length: MnemonicLength) => {
    onConfirm({ ...value, length });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('create.mnemonicOptions.title')} className={className}>
      <div className="space-y-6 p-4">
        {/* Language selection */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">{t('create.mnemonicOptions.language')}</h3>
          <div className="space-y-1" role="radiogroup" aria-label={t('create.mnemonicOptions.selectLanguage')}>
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value.language === option.value}
                onClick={() => handleLanguageSelect(option.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-4 py-3',
                  'hover:bg-muted/50 transition-colors',
                  value.language === option.value && 'bg-muted',
                )}
              >
                <span className="text-sm">{option.label}</span>
                {value.language === option.value && <Check className="text-primary size-5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Length selection */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">{t('create.mnemonicOptions.wordCount')}</h3>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('create.mnemonicOptions.selectWordCount')}>
            {LENGTH_OPTIONS.map((length) => (
              <button
                key={length}
                type="button"
                role="radio"
                aria-checked={value.length === length}
                onClick={() => handleLengthSelect(length)}
                className={cn(
                  'flex items-center justify-center rounded-lg py-3 text-sm font-medium',
                  'transition-colors',
                  value.length === length ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80',
                )}
              >
                {length} {t('create.mnemonicOptions.words')}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'w-full rounded-full py-3 font-medium text-white transition-colors',
            'bg-primary hover:bg-primary/90',
          )}
        >
          {t('create.mnemonicOptions.confirm')}
        </button>
      </div>
    </BottomSheet>
  );
}
