'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'
import { useTokenIconRootContext } from '../root/TokenIconRootContext'

export interface TokenIconFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  delayMs?: number
}

const fontSizeClasses = {
  xs: 'text-[8px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

export const TokenIconFallback = React.forwardRef(function TokenIconFallback(
  props: TokenIconFallbackProps,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { children, className, delayMs = 0, ...elementProps } = props
  const context = useTokenIconRootContext()
  const [canRender, setCanRender] = React.useState(delayMs === 0)

  React.useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => setCanRender(true), delayMs)
      return () => clearTimeout(timer)
    }
  }, [delayMs])

  if (context.imageLoaded || !canRender) {
    return null
  }

  return (
    <span
      ref={forwardedRef}
      className={cn(
        'flex items-center justify-center size-full font-medium text-muted-foreground uppercase',
        fontSizeClasses[context.size],
        className,
      )}
      {...elementProps}
    >
      {children}
    </span>
  )
})

export namespace TokenIconFallback {
  export type Props = TokenIconFallbackProps
}
