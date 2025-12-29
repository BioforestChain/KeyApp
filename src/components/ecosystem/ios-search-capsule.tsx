import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface IOSSearchCapsuleProps {
  onClick: () => void;
  className?: string;
}

export function IOSSearchCapsule({ onClick, className }: IOSSearchCapsuleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2',
        'bg-muted/50 backdrop-blur-sm',
        'h-9 w-full max-w-[200px] rounded-full',
        'text-muted-foreground text-sm font-medium',
        'transition-all duration-200',
        'active:scale-95 active:bg-muted/70',
        className,
      )}
    >
      <IconSearch className="size-4" stroke={2} />
      <span>搜索</span>
    </button>
  );
}
