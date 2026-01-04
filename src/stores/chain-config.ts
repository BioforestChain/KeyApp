import { Store, useStore } from '@tanstack/react-store'
import {
  addManualConfig,
  getChainById as getChainByIdFromSnapshot,
  getEnabledChains as getEnabledChainsFromSnapshot,
  initialize as initializeService,
  refreshSubscription,
  setChainEnabled,
  setSubscriptionUrl,
  ChainConfigMigrationError,
  type ChainConfig,
  type ChainConfigSnapshot,
  type ChainConfigSubscription,
  type ChainConfigWarning,
} from '@/services/chain-config'

export interface ChainConfigState {
  snapshot: ChainConfigSnapshot | null
  isLoading: boolean
  error: string | null
  /** 需要迁移数据库 */
  migrationRequired: boolean
}

const initialState: ChainConfigState = {
  snapshot: null,
  isLoading: false,
  error: null,
  migrationRequired: false,
}

export const chainConfigStore = new Store<ChainConfigState>(initialState)

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

async function runAndUpdate(action: () => Promise<ChainConfigSnapshot>): Promise<void> {
  chainConfigStore.setState((state) => ({ ...state, isLoading: true, error: null, migrationRequired: false }))

  try {
    const snapshot = await action()
    chainConfigStore.setState((state) => ({ ...state, snapshot, isLoading: false, error: null }))
  } catch (error) {
    if (error instanceof ChainConfigMigrationError) {
      chainConfigStore.setState((state) => ({
        ...state,
        isLoading: false,
        error: error.message,
        migrationRequired: true,
      }))
    } else {
      chainConfigStore.setState((state) => ({ ...state, isLoading: false, error: toErrorMessage(error) }))
    }
  }
}

export const chainConfigActions = {
  initialize: async (): Promise<void> => {
    const currentState = chainConfigStore.state
    if (currentState.isLoading || currentState.snapshot) return

    await runAndUpdate(async () => initializeService())
  },

  setSubscriptionUrl: async (url: string): Promise<void> => {
    chainConfigStore.setState((state) => ({ ...state, isLoading: true, error: null }))

    try {
      const snapshot = await setSubscriptionUrl(url)
      const nextUrl = snapshot.subscription?.url ?? 'default'

      if (nextUrl === 'default') {
        chainConfigStore.setState((state) => ({ ...state, snapshot, isLoading: false, error: null }))
        return
      }

      const { result, snapshot: refreshedSnapshot } = await refreshSubscription()
      const error = result.status === 'error' ? result.error : null
      chainConfigStore.setState((state) => ({ ...state, snapshot: refreshedSnapshot, isLoading: false, error }))
    } catch (error) {
      chainConfigStore.setState((state) => ({ ...state, isLoading: false, error: toErrorMessage(error) }))
    }
  },

  refreshSubscription: async (): Promise<void> => {
    chainConfigStore.setState((state) => ({ ...state, isLoading: true, error: null }))

    try {
      const { result, snapshot } = await refreshSubscription()
      const error = result.status === 'error' ? result.error : null
      chainConfigStore.setState((state) => ({ ...state, snapshot, isLoading: false, error }))
    } catch (error) {
      chainConfigStore.setState((state) => ({ ...state, isLoading: false, error: toErrorMessage(error) }))
    }
  },

  addManualConfig: async (input: unknown): Promise<void> => {
    await runAndUpdate(async () => addManualConfig(input))
  },

  setChainEnabled: async (id: string, enabled: boolean): Promise<void> => {
    await runAndUpdate(async () => setChainEnabled(id, enabled))
  },

  enableChain: async (id: string): Promise<void> => {
    await runAndUpdate(async () => setChainEnabled(id, true))
  },

  disableChain: async (id: string): Promise<void> => {
    await runAndUpdate(async () => setChainEnabled(id, false))
  },

  clearError: (): void => {
    chainConfigStore.setState((state) => ({ ...state, error: null }))
  },
}

export const chainConfigSelectors = {
  getSnapshot: (state: ChainConfigState): ChainConfigSnapshot | null => state.snapshot,

  getConfigs: (state: ChainConfigState): ChainConfig[] => state.snapshot?.configs ?? [],

  getSubscription: (state: ChainConfigState): ChainConfigSubscription | null => state.snapshot?.subscription ?? null,

  getWarnings: (state: ChainConfigState): ChainConfigWarning[] => state.snapshot?.warnings ?? [],

  getEnabledChains: (state: ChainConfigState): ChainConfig[] => {
    if (!state.snapshot) return []
    return getEnabledChainsFromSnapshot(state.snapshot)
  },

  getEnabledBioforestChainConfigs: (state: ChainConfigState): ChainConfig[] => {
    if (!state.snapshot) return []

    return getEnabledChainsFromSnapshot(state.snapshot)
      .filter((config) => config.chainKind === 'bioforest')
  },

  getChainById: (state: ChainConfigState, id: string): ChainConfig | null => {
    if (!state.snapshot) return null
    return getChainByIdFromSnapshot(state.snapshot, id)
  },
}

export function useChainConfigState(): ChainConfigState {
  return useStore(chainConfigStore)
}

export function useChainConfigs(): ChainConfig[] {
  return useStore(chainConfigStore, (state) => chainConfigSelectors.getConfigs(state))
}

export function useEnabledChains(): ChainConfig[] {
  return useStore(chainConfigStore, (state) => chainConfigSelectors.getEnabledChains(state))
}

export function useEnabledBioforestChainConfigs(): ChainConfig[] {
  return useStore(chainConfigStore, (state) => chainConfigSelectors.getEnabledBioforestChainConfigs(state))
}

export function useChainConfigSubscription(): ChainConfigSubscription | null {
  return useStore(chainConfigStore, (state) => chainConfigSelectors.getSubscription(state))
}

export function useChainConfigWarnings(): ChainConfigWarning[] {
  return useStore(chainConfigStore, (state) => chainConfigSelectors.getWarnings(state))
}

export function useChainConfigLoading(): boolean {
  return useStore(chainConfigStore, (state) => state.isLoading)
}

export function useChainConfigError(): string | null {
  return useStore(chainConfigStore, (state) => state.error)
}

export function useChainConfigMigrationRequired(): boolean {
  return useStore(chainConfigStore, (state) => state.migrationRequired)
}
