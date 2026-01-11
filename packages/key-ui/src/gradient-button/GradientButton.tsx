'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export type GradientButtonVariant = 'blue' | 'purple' | 'red' | 'mint'
export type GradientButtonSize = 'sm' | 'md' | 'lg'

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GradientButtonVariant
  size?: GradientButtonSize
  fullWidth?: boolean
  loading?: boolean
  loadingIcon?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<GradientButtonVariant, string> = {
  blue: 'bg-gradient-blue hover:opacity-90',
  purple: 'bg-gradient-purple hover:opacity-90',
  red: 'bg-gradient-red hover:opacity-90',
  mint: 'bg-gradient-mint hover:opacity-90',
}

const sizeStyles: Record<GradientButtonSize, string> = {
  sm: 'h-9 px-4 text-sm has-[svg]:ps-3 @xs:h-10 @xs:px-5 @xs:has-[svg]:ps-4',
  md: 'h-11 px-6 text-base has-[svg]:ps-4 @xs:h-12 @xs:px-8 @xs:has-[svg]:ps-5',
  lg: 'h-12 px-8 text-lg has-[svg]:ps-5 @xs:h-14 @xs:px-10 @xs:has-[svg]:ps-6',
}

const DefaultLoadingIcon = () => (
  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
)

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      variant = 'purple',
      size = 'md',
      fullWidth = false,
      loading = false,
      loadingIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const LoadingIconComponent = loadingIcon ?? <DefaultLoadingIcon />

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full text-white font-medium transition-opacity',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && LoadingIconComponent}
        {children}
      </button>
    )
  },
)

GradientButton.displayName = 'GradientButton'

export namespace GradientButton {
  export type Props = GradientButtonProps
  export type Variant = GradientButtonVariant
  export type Size = GradientButtonSize
}
