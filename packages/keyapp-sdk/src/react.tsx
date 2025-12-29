/**
 * KeyApp SDK React Hooks
 */

import { useSyncExternalStore, useCallback } from 'react'
import { ctx } from './ctx'
import type { KeyAppContextState, ThemeContext, LocaleContext, EnvContext, A11yContext } from './types'

function subscribe(callback: () => void): () => void {
  ctx.on('change', callback as (event: CustomEvent) => void)
  return () => ctx.off('change', callback as (event: CustomEvent) => void)
}

export function useKeyAppContext(): KeyAppContextState {
  return useSyncExternalStore(
    subscribe,
    () => ctx.snapshot(),
    () => ctx.snapshot()
  )
}

export function useKeyAppTheme(): ThemeContext {
  const subscribeTheme = useCallback((callback: () => void) => {
    ctx.on('themechange', callback as (event: CustomEvent) => void)
    return () => ctx.off('themechange', callback as (event: CustomEvent) => void)
  }, [])

  return useSyncExternalStore(
    subscribeTheme,
    () => ctx.theme,
    () => ctx.theme
  )
}

export function useKeyAppLocale(): LocaleContext {
  const subscribeLocale = useCallback((callback: () => void) => {
    ctx.on('localechange', callback as (event: CustomEvent) => void)
    return () => ctx.off('localechange', callback as (event: CustomEvent) => void)
  }, [])

  return useSyncExternalStore(
    subscribeLocale,
    () => ctx.locale,
    () => ctx.locale
  )
}

export function useKeyAppEnv(): EnvContext {
  const subscribeEnv = useCallback((callback: () => void) => {
    ctx.on('envchange', callback as (event: CustomEvent) => void)
    return () => ctx.off('envchange', callback as (event: CustomEvent) => void)
  }, [])

  return useSyncExternalStore(
    subscribeEnv,
    () => ctx.env,
    () => ctx.env
  )
}

export function useKeyAppA11y(): A11yContext {
  const subscribeA11y = useCallback((callback: () => void) => {
    ctx.on('a11ychange', callback as (event: CustomEvent) => void)
    return () => ctx.off('a11ychange', callback as (event: CustomEvent) => void)
  }, [])

  return useSyncExternalStore(
    subscribeA11y,
    () => ctx.a11y,
    () => ctx.a11y
  )
}

export function useColorMode(): 'light' | 'dark' {
  const theme = useKeyAppTheme()
  return theme.colorMode
}

export function usePrimaryHue(): number {
  const theme = useKeyAppTheme()
  return theme.primaryHue
}

// Re-export ctx and types for convenience
export { ctx } from './ctx'
export type {
  KeyAppContextState,
  ThemeContext,
  LocaleContext,
  EnvContext,
  A11yContext,
} from './types'
