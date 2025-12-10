import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const variantConfig = {
  info: {
    icon: Info,
    styles: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  success: {
    icon: CheckCircle,
    styles: 'bg-green-500/10 text-green-700 dark:text-green-300',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  },
  error: {
    icon: AlertCircle,
    styles: 'bg-destructive/10 text-destructive',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const { icon: Icon, styles } = variantConfig[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg p-3 text-sm',
        styles,
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  )
}
