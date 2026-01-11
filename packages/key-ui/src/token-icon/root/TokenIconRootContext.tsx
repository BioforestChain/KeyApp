'use client'
import * as React from 'react'

export interface TokenIconRootContextValue {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  imageLoaded: boolean
  setImageLoaded: (loaded: boolean) => void
}

export const TokenIconRootContext = React.createContext<TokenIconRootContextValue | null>(null)

export function useTokenIconRootContext(): TokenIconRootContextValue {
  const context = React.useContext(TokenIconRootContext)
  if (!context) {
    throw new Error('TokenIcon components must be used within a TokenIcon.Root')
  }
  return context
}
