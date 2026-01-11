'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'
import { useTokenIconRootContext } from '../root/TokenIconRootContext'

export interface TokenIconImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void
}

export const TokenIconImage = React.forwardRef(function TokenIconImage(
  props: TokenIconImageProps,
  forwardedRef: React.ForwardedRef<HTMLImageElement>,
) {
  const { src, alt = '', className, onLoadingStatusChange, onLoad, onError, ...elementProps } = props
  const context = useTokenIconRootContext()

  const handleLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      context.setImageLoaded(true)
      onLoadingStatusChange?.('loaded')
      onLoad?.(event)
    },
    [context, onLoadingStatusChange, onLoad],
  )

  const handleError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      context.setImageLoaded(false)
      onLoadingStatusChange?.('error')
      onError?.(event)
    },
    [context, onLoadingStatusChange, onError],
  )

  React.useEffect(() => {
    if (src) {
      onLoadingStatusChange?.('loading')
      context.setImageLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (!src) {
    return null
  }

  return (
    <img
      ref={forwardedRef}
      src={src}
      alt={alt}
      className={cn('absolute inset-0 size-full object-cover', className)}
      onLoad={handleLoad}
      onError={handleError}
      {...elementProps}
    />
  )
})

export namespace TokenIconImage {
  export type Props = TokenIconImageProps
}
