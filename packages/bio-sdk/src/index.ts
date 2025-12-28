/**
 * Bio SDK - Client SDK for Bio Ecosystem MiniApps
 *
 * Injects `window.bio` provider similar to `window.ethereum` in Web3 DApps.
 *
 * @example
 * ```typescript
 * import '@biochain/bio-sdk'
 *
 * // Now window.bio is available
 * const accounts = await window.bio.request({ method: 'bio_requestAccounts' })
 * ```
 */

import { BioProviderImpl } from './provider'
import type { BioProvider } from './types'

// Re-export types
export * from './types'
export { EventEmitter } from './events'
export { BioProviderImpl } from './provider'

// Extend Window interface
declare global {
  interface Window {
    bio?: BioProvider
  }
}

/**
 * Initialize and inject the Bio provider into window.bio
 */
export function initBioProvider(targetOrigin = '*'): BioProvider {
  if (typeof window === 'undefined') {
    throw new Error('[BioSDK] Cannot initialize: window is not defined')
  }

  if (window.bio) {
    console.warn('[BioSDK] Provider already exists, returning existing instance')
    return window.bio
  }

  const provider = new BioProviderImpl(targetOrigin)
  window.bio = provider

  console.log('[BioSDK] Provider initialized')
  return provider
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  // Use a slight delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initBioProvider())
  } else {
    initBioProvider()
  }
}
