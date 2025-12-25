import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconCopy as Copy, IconCheck as Check } from '@tabler/icons-react';
import { clipboardService } from '@/services/clipboard';

interface AddressDisplayProps {
  address: string;
  copyable?: boolean | undefined;
  className?: string | undefined;
  onCopy?: (() => void) | undefined;
}

// 使用 canvas 测量文字宽度（不触发回流）
let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') {
    return text.length * 8;
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCtx = measureCanvas.getContext('2d');
  }

  if (!measureCtx) {
    return text.length * 8;
  }

  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

// 计算最优截断
function truncateAddress(address: string, maxWidth: number, font: string): string {
  const ellipsis = '...';
  const fullWidth = measureText(address, font);

  if (fullWidth <= maxWidth) return address;

  const ellipsisWidth = measureText(ellipsis, font);
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) return ellipsis;

  const charWidth = measureText(address.charAt(0), font);
  const totalCharsAvailable = Math.floor(availableWidth / charWidth);

  let startChars: number;
  let endChars: number;
  const minChars = 4;

  if (totalCharsAvailable < minChars * 2) {
    startChars = Math.max(2, Math.floor(totalCharsAvailable / 2));
    endChars = Math.max(2, totalCharsAvailable - startChars);
  } else {
    startChars = Math.ceil(totalCharsAvailable * 0.55);
    endChars = totalCharsAvailable - startChars;
  }

  const maxStart = address.length - endChars - 1;
  startChars = Math.min(startChars, maxStart);

  if (startChars + endChars >= address.length) return address;

  return `${address.slice(0, startChars)}${ellipsis}${address.slice(-endChars)}`;
}

export function AddressDisplay({ address, copyable = true, className, onCopy }: AddressDisplayProps) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const updateDisplay = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = getComputedStyle(container);
    const font = `${style.fontSize} ${style.fontFamily}`;
    const iconSpace = copyable ? 24 : 0;
    const availableWidth = container.clientWidth - iconSpace;

    if (availableWidth <= 0) {
      setDisplayText(address);
      return;
    }

    const truncated = truncateAddress(address, availableWidth, font);
    setDisplayText(truncated);
  }, [address, copyable]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateDisplay();

    const observer = new ResizeObserver(updateDisplay);
    observer.observe(container);

    return () => observer.disconnect();
  }, [updateDisplay]);

  const handleCopy = async () => {
    try {
      await clipboardService.write({ text: address });
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy address');
    }
  };

  // 绝对定位：文字不参与容器宽度计算
  const isReady = displayText !== null;

  if (!copyable) {
    return (
      <span
        ref={containerRef as React.RefObject<HTMLSpanElement>}
        className={cn('relative block font-mono text-sm', className)}
        title={address}
        aria-label={address}
      >
        {/* 占位：保持行高 */}
        <span className="invisible" aria-hidden="true">
          0
        </span>
        {/* 绝对定位的实际内容 */}
        <span className={cn('absolute inset-0 truncate', !isReady && 'invisible')}>{displayText}</span>
      </span>
    );
  }

  return (
    <button
      ref={containerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={handleCopy}
      className={cn(
        'relative flex w-full items-center gap-1.5 font-mono text-sm transition-colors',
        'hover:text-primary focus-visible:ring-ring rounded focus:outline-none focus-visible:ring-2',
        className,
      )}
      title={address}
      aria-label={copied ? `已复制 ${address}` : `复制 ${address}`}
    >
      {/* 文字容器：flex-1 获取剩余空间 */}
      <span className="relative min-w-0 flex-1">
        <span className="invisible" aria-hidden="true">
          0
        </span>
        <span className={cn('absolute inset-0 truncate', !isReady && 'invisible')} aria-hidden="true">
          {displayText}
        </span>
      </span>
      {copied ? (
        <Check className="text-green-500 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Copy className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t('copiedToClipboard') : ''}
      </span>
    </button>
  );
}
