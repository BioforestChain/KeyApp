import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode | undefined;
  title: string;
  description?: string | undefined;
  action?: React.ReactNode | undefined;
  className?: string | undefined;
  testId?: string | undefined;
}

export function EmptyState({ icon, title, description, action, className, testId }: EmptyStateProps) {
  return (
    <div
      {...(testId && { 'data-testid': testId })}
      className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}
    >
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-foreground text-base font-medium @xs:text-lg">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-xs text-sm @xs:text-base">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
