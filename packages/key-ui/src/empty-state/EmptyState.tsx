'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  testId?: string
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
  )
}

export namespace EmptyState {
  export type Props = EmptyStateProps
}
