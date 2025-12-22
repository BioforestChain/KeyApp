import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { validateMnemonic, isValidWord } from '@/lib/crypto/mnemonic';
import { IconCheck as Check, IconAlertCircle as AlertCircle, IconLoader2 as Loader2, IconX } from '@tabler/icons-react';
import { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';

/** Valid mnemonic word counts */
export type MnemonicWordCount = 12 | 15 | 18 | 21 | 24 | 36;

/** Validation result for mnemonic */
export interface MnemonicValidationResult {
  /** Whether the mnemonic is valid BIP39 */
  isValid: boolean;
  /** Current word count */
  wordCount: number;
  /** Expected word count (nearest valid) */
  expectedWordCount: MnemonicWordCount | null;
  /** Invalid words (not in BIP39 wordlist) */
  invalidWords: string[];
  /** Whether validation is in progress */
  isValidating: boolean;
}

/** Form data for wallet recovery */
export interface RecoverWalletFormData {
  mnemonic: string[];
  wordCount: MnemonicWordCount;
}

interface RecoverWalletFormProps {
  /** Form submit callback with validated mnemonic */
  onSubmit: (data: RecoverWalletFormData) => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Additional class name */
  className?: string;
}

const VALID_WORD_COUNTS: MnemonicWordCount[] = [12, 15, 18, 21, 24, 36];

/**
 * Get the nearest valid word count
 */
function getNearestWordCount(count: number): MnemonicWordCount | null {
  if (count <= 0) return null;
  // Find the smallest valid count that's >= current count
  for (const valid of VALID_WORD_COUNTS) {
    if (count <= valid) return valid;
  }
  return 36; // Max
}

/**
 * Validates mnemonic input and returns detailed result
 */
export function validateMnemonicInput(input: string): MnemonicValidationResult {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      expectedWordCount: null,
      invalidWords: [],
      isValidating: false,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const expectedWordCount = getNearestWordCount(wordCount);

  // Check for invalid words (not in BIP39 wordlist)
  const invalidWords = words.filter((word) => !isValidWord(word));

  // Only validate BIP39 if word count is valid and no invalid words
  const isValidCount = VALID_WORD_COUNTS.includes(wordCount as MnemonicWordCount);
  const isValid = isValidCount && invalidWords.length === 0 && validateMnemonic(words);

  return {
    isValid,
    wordCount,
    expectedWordCount,
    invalidWords,
    isValidating: false,
  };
}

/**
 * Recover wallet form component
 * Provides textarea input with real-time BIP39 validation
 */
export function RecoverWalletForm({ onSubmit, isSubmitting = false, className }: RecoverWalletFormProps) {
  const { t } = useTranslation('onboarding');
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<MnemonicValidationResult>({
    isValid: false,
    wordCount: 0,
    expectedWordCount: null,
    invalidWords: [],
    isValidating: false,
  });

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidation(validateMnemonicInput(input));
    }, 150);
    return () => clearTimeout(timer);
  }, [input]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validation.isValid || isSubmitting) return;

      const words = input.trim().toLowerCase().split(/\s+/).filter(Boolean);
      onSubmit({
        mnemonic: words,
        wordCount: words.length as MnemonicWordCount,
      });
    },
    [input, validation.isValid, isSubmitting, onSubmit],
  );

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  // Auto-resize textarea
  const handleTextareaResize = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }, []);

  // Status message
  const statusMessage = useMemo(() => {
    const { isValid, wordCount, expectedWordCount, invalidWords } = validation;

    if (wordCount === 0) {
      return { type: 'hint' as const, text: t('recover.form.hint') };
    }

    if (invalidWords.length > 0) {
      const first = invalidWords[0];
      return {
        type: 'error' as const,
        text: t('recover.form.invalidWord', { word: first }),
      };
    }

    if (!VALID_WORD_COUNTS.includes(wordCount as MnemonicWordCount)) {
      return {
        type: 'warning' as const,
        text: t('recover.form.wordCountHint', { current: wordCount, expected: expectedWordCount }),
      };
    }

    if (isValid) {
      return {
        type: 'success' as const,
        text: t('recover.form.validMnemonic'),
      };
    }

    return {
      type: 'error' as const,
      text: t('recover.form.checksumFailed'),
    };
  }, [validation, t]);

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Input header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{t('recover.form.enterMnemonic')}</label>
        {validation.wordCount > 0 && (
          <span className="text-muted-foreground text-xs">
            {t('recover.form.wordCount', { count: validation.wordCount })}
          </span>
        )}
      </div>

      {/* Textarea with clear button */}
      <InputGroup
        className={cn(
          'h-auto',
          validation.isValid && 'border-green-500/50',
          statusMessage.type === 'error' && 'border-destructive/50',
        )}
      >
        <InputGroupTextarea
          value={input}
          onChange={(e) => {
            handleInputChange(e);
            handleTextareaResize(e);
          }}
          placeholder={t('recover.form.placeholder')}
          disabled={isSubmitting}
          rows={4}
          className="min-h-24"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {input && !isSubmitting && (
          <InputGroupAddon align="inline-end" className="self-start pt-2">
            <InputGroupButton
              size="icon-xs"
              onClick={handleClear}
              aria-label={t('recover.form.clear')}
            >
              <IconX className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Validation status */}
      <div
        className={cn(
          'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
          statusMessage.type === 'hint' && 'bg-muted/50 text-muted-foreground',
          statusMessage.type === 'success' && 'bg-green-500/10 text-green-600',
          statusMessage.type === 'warning' && 'bg-yellow-500/10 text-yellow-600',
          statusMessage.type === 'error' && 'bg-destructive/10 text-destructive',
        )}
      >
        {statusMessage.type === 'success' && <Check className="mt-0.5 size-4 shrink-0" />}
        {statusMessage.type === 'error' && <AlertCircle className="mt-0.5 size-4 shrink-0" />}
        {statusMessage.type === 'warning' && <AlertCircle className="mt-0.5 size-4 shrink-0" />}
        <span>{statusMessage.text}</span>
      </div>

      {/* Security notice */}
      <div className="bg-muted/30 text-muted-foreground rounded-lg px-3 py-2 text-xs">
        <p>{t('recover.form.securityNotice')}</p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!validation.isValid || isSubmitting}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium text-white transition-colors',
          'bg-primary hover:bg-primary/90',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? t('recover.form.verifying') : t('recover.form.continue')}
      </button>
    </form>
  );
}
