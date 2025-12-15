import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

interface MnemonicDisplayProps {
  words: string[];
  hidden?: boolean;
  onCopy?: () => void;
  className?: string;
}

export function MnemonicDisplay({ words, hidden = false, onCopy, className }: MnemonicDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(words.join(' '));
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy mnemonic');
    }
  };

  return (
    <div data-testid="mnemonic-display" className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 gap-2 @xs:grid-cols-4 @md:gap-3">
        {words.map((word, index) => (
          <div
            key={index}
            className={cn(
              'border-border bg-muted/30 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 @xs:px-3 @xs:py-2',
            )}
          >
            <span className="text-muted w-4 shrink-0 text-xs">{index + 1}</span>
            <span className={cn('truncate text-sm font-medium', hidden && 'blur-sm select-none')}>
              {hidden ? '••••••' : word}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={hidden}
        className={cn(
          'flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium',
          'text-primary hover:text-primary/80 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {copied ? (
          <>
            <Check className="size-4" />
            已复制
          </>
        ) : (
          <>
            <Copy className="size-4" />
            复制助记词
          </>
        )}
      </button>
    </div>
  );
}
