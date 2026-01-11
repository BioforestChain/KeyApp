'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
}

export function Alert({ variant = 'info', title, children, className, icon }: AlertProps) {
  return (
    <div role="alert" className={cn('flex gap-3 rounded-lg p-3 text-sm', variantStyles[variant], className)}>
      {icon && <div className="mt-0.5 size-4 shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  )
}

export namespace Alert {
  export type Props = AlertProps
  export type Variant = AlertVariant
}
