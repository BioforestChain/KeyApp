import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title?: string
  onBack?: () => void
  rightAction?: React.ReactNode
  transparent?: boolean
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  onBack,
  rightAction,
  transparent = false,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between px-4 safe-area-inset-top',
        transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-[60px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-9 aspect-square -ml-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="返回"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold truncate max-w-[50%]">
          {title}
        </h1>
      )}
      
      {children && !title && (
        <div className="absolute left-1/2 -translate-x-1/2">
          {children}
        </div>
      )}

      <div className="flex items-center gap-2 min-w-[60px] justify-end">
        {rightAction}
      </div>
    </header>
  )
}
