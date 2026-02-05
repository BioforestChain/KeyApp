/**
 * Bio SDK - Client SDK for Bio Ecosystem MiniApps
 *
 * Injects providers for multi-chain dApp support:
 * - `window.bio` - BioChain + KeyApp wallet features
 * - `window.ethereum` - EVM-compatible chains (ETH, BSC)
 * - `window.tronWeb` / `window.tronLink` - Tron chain
 *
 * @example
 * ```typescript
 * import '@biochain/bio-sdk'
 *
 * // BioChain operations
 * const accounts = await window.bio.request({ method: 'bio_requestAccounts' })
 *
 * // EVM operations (ETH, BSC)
 * const ethAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
 *
 * // Tron operations
 * const tronAccounts = await window.tronLink.request({ method: 'tron_requestAccounts' })
 * ```
 */

import { BioProviderImpl } from './provider'
import { EthereumProvider, initEthereumProvider } from './ethereum-provider'
import { TronLinkProvider, TronWebProvider, initTronProvider } from './tron-provider'
import type { BioProvider } from './types'

// Re-export types
export * from './types'
export * from './chain-id'
export * from './miniapp-context'
export { EventEmitter } from './events'
export { BioProviderImpl } from './provider'
export { EthereumProvider, initEthereumProvider } from './ethereum-provider'
export { TronLinkProvider, TronWebProvider, initTronProvider } from './tron-provider'

// Extend Window interface (bio is declared in types.ts already for ethereum/tron)
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
    
    return window.bio
  }

  const provider = new BioProviderImpl(targetOrigin)
  window.bio = provider

  
  return provider
}

/**
 * Initialize all providers (bio, ethereum, tron)
 */
export function initAllProviders(targetOrigin = '*'): {
  bio: BioProvider
  ethereum: EthereumProvider
  tronLink: TronLinkProvider
  tronWeb: TronWebProvider
} {
  const bio = initBioProvider(targetOrigin)
  const ethereum = initEthereumProvider(targetOrigin)
  const { tronLink, tronWeb } = initTronProvider(targetOrigin)

  return { bio, ethereum, tronLink, tronWeb }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  const init = () => {
    initBioProvider()
    initEthereumProvider()
    initTronProvider()
  }

  // Use a slight delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
