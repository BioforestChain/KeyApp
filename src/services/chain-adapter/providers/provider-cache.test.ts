import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'

import { resetChainConfigStorageForTests } from '@/services/chain-config/storage'
import { chainConfigActions, chainConfigStore } from '@/stores/chain-config'

import { clearProviderCache, getChainProvider } from './index'

describe('getChainProvider cache safety', () => {
  beforeEach(async () => {
    await resetChainConfigStorageForTests()
    clearProviderCache()
    chainConfigStore.setState(() => ({
      snapshot: null,
      isLoading: false,
      error: null,
      migrationRequired: false,
    }))
  })

  it('does not cache an empty provider before chain configs initialize', async () => {
    const provider1 = getChainProvider('bfmetav2')
    const provider2 = getChainProvider('bfmetav2')

    expect(provider1).not.toBe(provider2)
    expect(provider1.supportsFullTransaction).toBe(false)

    await chainConfigActions.initialize()

    const provider3 = getChainProvider('bfmetav2')
    const provider4 = getChainProvider('bfmetav2')

    expect(provider3).toBe(provider4)
    expect(provider3).not.toBe(provider1)
    expect(provider3.supportsFullTransaction).toBe(true)
  })

  it('rebuilds the cached provider when api entries change', async () => {
    await chainConfigActions.initialize()

    const originalSnapshot = chainConfigStore.state.snapshot
    expect(originalSnapshot).not.toBeNull()
    if (!originalSnapshot) return

    const originalConfig = originalSnapshot.configs.find((config) => config.id === 'bfmetav2')
    expect(originalConfig).toBeTruthy()
    if (!originalConfig) return

    chainConfigStore.setState((state) => {
      const snapshot = state.snapshot
      if (!snapshot) return state

      return {
        ...state,
        snapshot: {
          ...snapshot,
          configs: snapshot.configs.map((config) =>
            config.id === originalConfig.id
              ? {
                  ...config,
                  apis: [],
                }
              : config,
          ),
        },
      }
    })

    clearProviderCache()

    const provider1 = getChainProvider('bfmetav2')
    expect(provider1.supportsFullTransaction).toBe(false)

    chainConfigStore.setState((state) => {
      const snapshot = state.snapshot
      if (!snapshot) return state

      return {
        ...state,
        snapshot: {
          ...snapshot,
          configs: snapshot.configs.map((config) =>
            config.id === originalConfig.id ? originalConfig : config,
          ),
        },
      }
    })

    const provider2 = getChainProvider('bfmetav2')
    expect(provider2).not.toBe(provider1)
    expect(provider2.supportsFullTransaction).toBe(true)
  })
})

