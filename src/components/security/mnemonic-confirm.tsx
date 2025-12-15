import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, Check, X } from 'lucide-react';

interface MnemonicConfirmProps {
  /** Original mnemonic words in correct order */
  words: string[];
  /** Callback when words are correctly confirmed */
  onComplete: () => void;
  /** Callback when words are reset */
  onReset?: () => void;
  /** Additional class names */
  className?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const swapItem = shuffled[j];
    if (temp !== undefined && swapItem !== undefined) {
      shuffled[i] = swapItem;
      shuffled[j] = temp;
    }
  }
  return shuffled;
}

/**
 * Mnemonic confirmation component for backup verification
 */
export function MnemonicConfirm({ words, onComplete, onReset, className }: MnemonicConfirmProps) {
  const [shuffledWords] = useState(() => shuffleArray(words.map((w, i) => ({ word: w, originalIndex: i }))));
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showError, setShowError] = useState(false);

  const selectedWords = useMemo(
    () =>
      selectedIndices.map((i) => {
        const item = shuffledWords[i];
        if (!item) {
          throw new Error(`Invalid shuffled word index: ${i}`);
        }
        return item.word;
      }),
    [selectedIndices, shuffledWords],
  );

  const isComplete = selectedIndices.length === words.length;
  const isCorrect = useMemo(() => selectedWords.every((w, i) => w === words[i]), [selectedWords, words]);

  const handleWordClick = useCallback(
    (shuffledIndex: number) => {
      if (selectedIndices.includes(shuffledIndex)) {
        return;
      }

      setShowError(false);
      const newSelected = [...selectedIndices, shuffledIndex];
      setSelectedIndices(newSelected);

      // Check if complete
      if (newSelected.length === words.length) {
        const newSelectedWords = newSelected.map((i) => {
          const item = shuffledWords[i];
          if (!item) {
            throw new Error(`Invalid shuffled word index: ${i}`);
          }
          return item.word;
        });
        const correct = newSelectedWords.every((w, i) => w === words[i]);
        if (correct) {
          onComplete();
        } else {
          setShowError(true);
        }
      }
    },
    [selectedIndices, words, shuffledWords, onComplete],
  );

  const handleReset = useCallback(() => {
    setSelectedIndices([]);
    setShowError(false);
    onReset?.();
  }, [onReset]);

  const handleRemoveLast = useCallback(() => {
    setSelectedIndices((prev) => prev.slice(0, -1));
    setShowError(false);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Selected words (answer area) */}
      <div className="border-border bg-muted/30 rounded-xl border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            已选择 {selectedIndices.length}/{words.length}
          </span>
          {selectedIndices.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveLast}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              撤销
            </button>
          )}
        </div>
        <div className="flex min-h-24 flex-wrap gap-2">
          {selectedWords.map((word, index) => (
            <span
              key={index}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium',
                showError && index === selectedIndices.length - 1
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-background',
              )}
            >
              <span className="text-muted-foreground text-xs">{index + 1}</span>
              {word}
            </span>
          ))}
          {selectedIndices.length === 0 && (
            <p className="text-muted-foreground w-full py-4 text-center text-sm">按正确顺序点击下方助记词</p>
          )}
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <X className="size-4" />
          <span>助记词顺序错误，请重试</span>
        </div>
      )}

      {/* Success message */}
      {isComplete && isCorrect && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="size-4" />
          <span>助记词验证成功</span>
        </div>
      )}

      {/* Word pool */}
      <div className="flex flex-wrap gap-2">
        {shuffledWords.map((item, shuffledIndex) => {
          const isSelected = selectedIndices.includes(shuffledIndex);
          return (
            <button
              key={shuffledIndex}
              type="button"
              onClick={() => handleWordClick(shuffledIndex)}
              disabled={isSelected || (isComplete && isCorrect)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-muted text-muted-foreground border-transparent opacity-50'
                  : 'border-border bg-background hover:border-primary hover:bg-primary/5',
                'disabled:cursor-not-allowed',
              )}
            >
              {item.word}
            </button>
          );
        })}
      </div>

      {/* Reset button */}
      {(selectedIndices.length > 0 || showError) && (
        <button
          type="button"
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 py-2 text-sm"
        >
          <RotateCcw className="size-4" />
          重新选择
        </button>
      )}
    </div>
  );
}
