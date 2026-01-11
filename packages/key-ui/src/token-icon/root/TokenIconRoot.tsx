'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'
import { TokenIconRootContext } from './TokenIconRootContext'
import type { KeyUIComponentProps } from '../../utils/types'

export interface TokenIconRootState {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  imageLoaded: boolean
}

export interface TokenIconRootProps
  extends Omit<KeyUIComponentProps<'span', TokenIconRootState>, 'children'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
}

const sizeClasses = {
  xs: 'size-4',
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
  xl: 'size-12',
}

export const TokenIconRoot = React.forwardRef(function TokenIconRoot(
  props: TokenIconRootProps,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { size = 'md', children, className, style, ...elementProps } = props

  const [imageLoaded, setImageLoaded] = React.useState(false)

  const state: TokenIconRootState = React.useMemo(
    () => ({
      size,
      imageLoaded,
    }),
    [size, imageLoaded],
  )

  const contextValue = React.useMemo(
    () => ({
      size,
      imageLoaded,
      setImageLoaded,
    }),
    [size, imageLoaded],
  )

  return (
    <TokenIconRootContext.Provider value={contextValue}>
      <span
        ref={forwardedRef}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-muted',
          sizeClasses[size],
          typeof className === 'function' ? className(state) : className,
        )}
        style={typeof style === 'function' ? style(state) : style}
        {...elementProps}
      >
        {children}
      </span>
    </TokenIconRootContext.Provider>
  )
})

export namespace TokenIconRoot {
  export type State = TokenIconRootState
  export type Props = TokenIconRootProps
}
