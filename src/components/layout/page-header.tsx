import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, onBack, rightAction, transparent = false, className, children }: PageHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <header
      className={cn(
        'safe-area-inset-top sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between px-4',
        transparent
          ? 'bg-transparent'
          : 'bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex min-w-[60px] items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hover:bg-muted/50 -ml-2 flex aspect-square w-9 items-center justify-center rounded-full transition-colors"
            aria-label={t('a11y.back')}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {title && (
        <h1 className="absolute left-1/2 max-w-[50%] -translate-x-1/2 truncate text-base font-semibold">{title}</h1>
      )}

      {children && !title && <div className="absolute left-1/2 -translate-x-1/2">{children}</div>}

      <div className="flex min-w-[60px] items-center justify-end gap-2">{rightAction}</div>
    </header>
  );
}
