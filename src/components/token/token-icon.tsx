import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TokenIconProps {
  /** Token symbol for fallback display */
  symbol: string;
  /** Token image URL */
  imageUrl?: string | null;
  /** Icon size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

/**
 * Token icon component with image support and graceful fallback to first letter
 */
export function TokenIcon({ symbol, imageUrl, size = 'md', className }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const showFallback = !imageUrl || imageError;
  const firstLetter = symbol.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        showFallback && 'bg-muted font-bold text-muted-foreground',
        sizeClasses[size],
        className,
      )}
      aria-label={symbol}
    >
      {showFallback ? (
        firstLetter
      ) : (
        <img
          src={imageUrl}
          alt={symbol}
          className="size-full object-cover"
          onError={handleImageError}
        />
      )}
    </div>
  );
}
