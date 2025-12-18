import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheck as Check, IconX as X, IconHelpCircle as HelpCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { VerificationSlot } from '@/hooks/use-mnemonic-verification';

interface MnemonicConfirmBackupProps {
  /** Verification slots with positions to fill */
  slots: VerificationSlot[];
  /** Shuffled candidate words */
  candidates: string[];
  /** Words that have been used */
  usedWords: Set<string>;
  /** Index of next slot to fill (-1 if all filled) */
  nextEmptySlotIndex: number;
  /** Whether all slots are correctly filled */
  isComplete: boolean;
  /** Callback when user selects a word */
  onSelectWord: (word: string) => void;
  /** Callback when user clicks a slot to deselect */
  onDeselectSlot: (index: number) => void;
  /** Callback when verification is complete */
  onComplete: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Mnemonic backup verification UI
 * Users must select correct words in correct positions
 */
export function MnemonicConfirmBackup({
  slots,
  candidates,
  usedWords,
  nextEmptySlotIndex,
  isComplete,
  onSelectWord,
  onDeselectSlot,
  onComplete,
  className,
}: MnemonicConfirmBackupProps) {
  const { t } = useTranslation('onboarding');

  // Group candidates into rows of 3
  const candidateRows = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < candidates.length; i += 3) {
      rows.push(candidates.slice(i, i + 3));
    }
    return rows;
  }, [candidates]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">{t('create.confirm.title')}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t('create.confirm.description')}</p>
      </div>

      {/* Verification slots */}
      <div className="mb-8 space-y-3">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-3 transition-colors',
              slot.selectedWord === null && index === nextEmptySlotIndex
                ? 'border-primary bg-primary/5'
                : slot.selectedWord === null
                  ? 'border-muted-foreground/30 bg-muted/30 border-dashed'
                  : slot.isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20',
            )}
            onClick={() => {
              if (slot.selectedWord !== null && slot.isCorrect === false) {
                onDeselectSlot(index);
              }
            }}
            role={slot.isCorrect === false ? 'button' : undefined}
            tabIndex={slot.isCorrect === false ? 0 : undefined}
          >
            {/* Position number */}
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                slot.selectedWord === null
                  ? 'bg-muted text-muted-foreground'
                  : slot.isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white',
              )}
            >
              {slot.position + 1}
            </div>

            {/* Word or placeholder */}
            <div className="flex-1">
              {slot.selectedWord ? (
                <span
                  className={cn(
                    'font-medium',
                    slot.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300',
                  )}
                >
                  {slot.selectedWord}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {index === nextEmptySlotIndex ? t('create.confirm.selectWord', { position: slot.position + 1 }) : '...'}
                </span>
              )}
            </div>

            {/* Status icon */}
            <div className="shrink-0">
              {slot.selectedWord === null ? (
                <HelpCircle className="text-muted-foreground/50 size-5" />
              ) : slot.isCorrect ? (
                <Check className="size-5 text-green-500" />
              ) : (
                <X className="size-5 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Candidate words grid */}
      <div className="mb-6">
        <p className="text-muted-foreground mb-3 text-center text-sm">{t('create.confirm.selectFromBelow')}</p>
        <div className="space-y-2">
          {candidateRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-2">
              {row.map((word) => {
                const isUsed = usedWords.has(word);
                return (
                  <button
                    key={word}
                    type="button"
                    disabled={isUsed || nextEmptySlotIndex === -1}
                    onClick={() => onSelectWord(word)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      isUsed
                        ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed border-transparent'
                        : 'border-border bg-background hover:border-primary hover:bg-primary/5',
                    )}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Complete message */}
      {isComplete && (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
          <p className="font-medium text-green-700 dark:text-green-300">{t('create.confirm.verifySuccess')}</p>
        </div>
      )}

      {/* Action button */}
      <Button onClick={onComplete} disabled={!isComplete} size="lg" className="w-full">
        {isComplete ? t('create.confirm.completeBackup') : t('create.confirm.pleaseComplete')}
      </Button>

      {/* Hint for wrong selections */}
      {slots.some((s) => s.isCorrect === false) && (
        <p className="text-muted-foreground mt-3 text-center text-sm">{t('create.confirm.clickToReselect')}</p>
      )}
    </div>
  );
}
