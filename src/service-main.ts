import { chainConfigActions, chainConfigStore, preferencesActions, walletActions } from '@/stores'
import {
  installLegacyAuthorizeHashRewriter,
  rewriteLegacyAuthorizeHashInPlace,
} from '@/services/authorize/deep-link'
import { setupAdapters, getAdapterRegistry } from '@/services/chain-adapter'
import { getEnabledChains } from '@/services/chain-config'

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

  // Initialize preference side effects (i18n + RTL) as early as possible.
  preferencesActions.initialize()

  // Setup chain adapters
  setupAdapters()

  // Start async store initializations (non-blocking).
  void walletActions.initialize()
  void chainConfigActions.initialize().then(() => {
    // Once chain configs are loaded, register them with adapter registry
    const snapshot = chainConfigStore.state.snapshot
    if (snapshot) {
      const enabledConfigs = getEnabledChains(snapshot)
      const registry = getAdapterRegistry()
      registry.setChainConfigs(enabledConfigs)
    }
  })

  // Also handle legacy hashes that may be set after startup (e.g. external runtime).
  const cleanupDeepLink = installLegacyAuthorizeHashRewriter({
    reloadOnRewrite: true,
  })

  return () => {
    cleanupDeepLink()
  }
}
