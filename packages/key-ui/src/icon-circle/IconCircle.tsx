'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export type IconCircleVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type IconCircleSize = 'sm' | 'md' | 'lg'

export interface IconCircleProps {
  icon: React.ReactNode
  variant?: IconCircleVariant
  size?: IconCircleSize
  className?: string
}

const variantStyles: Record<IconCircleVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  error: 'bg-destructive/10 text-destructive',
}

const sizeStyles: Record<IconCircleSize, { container: string; icon: string }> = {
  sm: { container: 'size-10', icon: 'size-5' },
  md: { container: 'size-14', icon: 'size-7' },
  lg: { container: 'size-16', icon: 'size-8' },
}

export function IconCircle({ icon, variant = 'primary', size = 'lg', className }: IconCircleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        variantStyles[variant],
        sizeStyles[size].container,
        className,
      )}
    >
      <div className={sizeStyles[size].icon}>{icon}</div>
    </div>
  )
}

export namespace IconCircle {
  export type Props = IconCircleProps
  export type Variant = IconCircleVariant
  export type Size = IconCircleSize
}
