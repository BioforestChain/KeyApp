import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MnemonicInputProps {
  wordCount?: 12 | 24;
  onComplete?: (words: string[]) => void;
  onChange?: (words: string[], isComplete: boolean) => void;
  className?: string;
}

export function MnemonicInput({ wordCount = 12, onComplete, onChange, className }: MnemonicInputProps) {
  const { t } = useTranslation('security');
  const [words, setWords] = useState<string[]>(Array(wordCount).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // 当 wordCount 变化时重置 words 数组
  useEffect(() => {
    setWords(Array(wordCount).fill(''));
    onChange?.(Array(wordCount).fill(''), false);
  }, [wordCount]); // 故意不包含 onChange 以避免无限循环

  const handleWordChange = useCallback(
    (index: number, value: string) => {
      const trimmedValue = value.trim().toLowerCase();

      // Handle paste of multiple words
      if (trimmedValue.includes(' ')) {
        const pastedWords = trimmedValue.split(/\s+/).filter(Boolean);
        const newWords = [...words];
        pastedWords.forEach((word, i) => {
          if (index + i < wordCount) {
            newWords[index + i] = word;
          }
        });
        setWords(newWords);
        const filledWords = newWords.filter(Boolean);
        const isComplete = filledWords.length === wordCount;
        onChange?.(newWords, isComplete);
        if (isComplete) onComplete?.(newWords);
        return;
      }

      const newWords = [...words];
      newWords[index] = trimmedValue;
      setWords(newWords);

      const filledWords = newWords.filter(Boolean);
      const isComplete = filledWords.length === wordCount;
      onChange?.(newWords, isComplete);
      if (isComplete) onComplete?.(newWords);
    },
    [words, wordCount, onChange, onComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Tab') {
        if (e.key === ' ') e.preventDefault();
        // Move to next input
        const nextInput = document.querySelector(`[data-word-index="${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (e.key === 'Backspace' && !words[index] && index > 0) {
        // Move to previous input on backspace if empty
        const prevInput = document.querySelector(`[data-word-index="${index - 1}"]`) as HTMLInputElement;
        prevInput?.focus();
      }
    },
    [words],
  );

  const clearAll = useCallback(() => {
    const emptyWords = Array(wordCount).fill('');
    setWords(emptyWords);
    onChange?.(emptyWords, false);
  }, [wordCount, onChange]);

  const filledCount = words.filter(Boolean).length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {t('mnemonicInput.entered', { filled: filledCount, total: wordCount })}
        </span>
        {filledCount > 0 && (
          <button type="button" onClick={clearAll} className="text-primary hover:text-primary/80 text-sm">
            {t('mnemonicInput.clear')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 @xs:grid-cols-4 @md:gap-3">
        {words.map((word, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors @xs:px-3 @xs:py-2',
              focusedIndex === index ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
              word && 'border-secondary/50 bg-secondary/5',
            )}
          >
            <span className="text-muted-foreground w-4 shrink-0 text-xs">{index + 1}</span>
            <input
              type="text"
              value={word}
              data-word-index={index}
              onChange={(e) => handleWordChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm font-medium outline-none"
              placeholder="..."
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
