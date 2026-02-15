import { chainConfigActions, preferencesActions, walletActions } from '@/stores'
import {
  installLegacyAuthorizeHashRewriter,
  rewriteLegacyAuthorizeHashInPlace,
} from '@/services/authorize/deep-link'
import { startDwebKeyboardOverlay } from '@/lib/dweb-keyboard-overlay'

export type ServiceMainCleanup = () => void

/**
 * Service main (bootstrap) for KeyApp.
 *
 * This runs independently from React rendering (still in main thread for now),
 * and owns side-effectful startup logic such as store initialization and
 * legacy deep-link normalization.
 */
export function startServiceMain(): ServiceMainCleanup {
  // Normalize legacy mpay-style authorize deep links before Stackflow reads URL.
  rewriteLegacyAuthorizeHashInPlace()

  // DWEB: keep viewport stable when soft keyboard appears.
  const cleanupKeyboardOverlay = startDwebKeyboardOverlay()

  // Initialize preference side effects (i18n + RTL) as early as possible.
  preferencesActions.initialize()

  // Start async store initializations (non-blocking).
  // ChainProvider uses lazy initialization, no explicit setup needed.
  // KeyFetch instances are created on-demand in chain-adapter/bioforest/fetch.ts
  void walletActions.initialize()
  void chainConfigActions.initialize()

  // Also handle legacy hashes that may be set after startup (e.g. external runtime).
  const cleanupDeepLink = installLegacyAuthorizeHashRewriter({
    reloadOnRewrite: true,
  })

  return () => {
    cleanupDeepLink()
    cleanupKeyboardOverlay()
  }
}
