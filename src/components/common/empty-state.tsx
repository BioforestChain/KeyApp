import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-foreground @xs:text-lg">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted max-w-xs @xs:text-base">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
