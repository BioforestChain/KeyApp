import { beforeEach, describe, expect, it, vi } from 'vitest'
import 'fake-indexeddb/auto'

import { resetChainConfigStorageForTests } from '@/services/chain-config/storage'

import { chainConfigActions, chainConfigSelectors, chainConfigStore } from './chain-config'

describe('chain-config store', () => {
  beforeEach(async () => {
    await resetChainConfigStorageForTests()
    chainConfigStore.setState(() => ({ snapshot: null, isLoading: false, error: null }))
  })

  it('initializes with default chains', async () => {
    await chainConfigActions.initialize()

    const state = chainConfigStore.state
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()

    const configs = chainConfigSelectors.getConfigs(state)
    expect(configs.some((c) => c.id === 'bfmeta')).toBe(true)
  })

  it('adds manual config and supports enable/disable toggle', async () => {
    await chainConfigActions.initialize()
    await chainConfigActions.addManualConfig({
      id: 'manual-test',
      version: '1.0',
      type: 'bioforest',
      name: 'Manual Test',
      symbol: 'MT',
      decimals: 8,
      prefix: 'c',
    })

    const state1 = chainConfigStore.state
    expect(chainConfigSelectors.getChainById(state1, 'manual-test')?.source).toBe('manual')

    await chainConfigActions.setChainEnabled('manual-test', false)
    const state2 = chainConfigStore.state
    expect(chainConfigSelectors.getChainById(state2, 'manual-test')?.enabled).toBe(false)
    expect(chainConfigSelectors.getEnabledChains(state2).some((c) => c.id === 'manual-test')).toBe(false)
  })

  it('sets subscription url and surfaces invalid url errors', async () => {
    await chainConfigActions.initialize()

    const subscriptionUrl = 'https://example.com/chains.json'
    const baseFetch = fetch.bind(globalThis)
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input, init) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (requestUrl === subscriptionUrl) {
        return new Response(
          JSON.stringify([
            { id: 'remote-one', version: '1.0', type: 'custom', name: 'Remote One', symbol: 'R1', decimals: 8 },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ETag: '"etag-1"' },
          },
        )
      }
      return baseFetch(input, init)
    })
    vi.stubGlobal('fetch', fetchMock)

    await chainConfigActions.setSubscriptionUrl(subscriptionUrl)

    const state1 = chainConfigStore.state
    expect(chainConfigSelectors.getSubscription(state1)?.url).toBe(subscriptionUrl)
    expect(state1.error).toBeNull()
    expect(chainConfigSelectors.getConfigs(state1).some((c) => c.id === 'remote-one' && c.source === 'subscription')).toBe(true)

    await chainConfigActions.setSubscriptionUrl('not-a-url')
    const state2 = chainConfigStore.state
    expect(state2.error).toBe('Invalid subscription URL')
  })

  it('exposes enabled bioforest chain ids from snapshot', async () => {
    await chainConfigActions.initialize()

    const enabled1 = chainConfigSelectors.getEnabledBioforestChainConfigs(chainConfigStore.state).map((c) => c.id)
    expect(enabled1).toContain('bfmeta')
    expect(enabled1).toContain('ccchain')
    expect(enabled1).toContain('pmchain')

    await chainConfigActions.setChainEnabled('bfmeta', false)
    const enabled2 = chainConfigSelectors.getEnabledBioforestChainConfigs(chainConfigStore.state).map((c) => c.id)
    expect(enabled2).not.toContain('bfmeta')

    await chainConfigActions.addManualConfig({
      id: 'custom-bioforest',
      version: '1.0',
      type: 'bioforest',
      name: 'Custom BioForest',
      symbol: 'CBF',
      decimals: 8,
      prefix: 'c',
    })
    const enabled3 = chainConfigSelectors.getEnabledBioforestChainConfigs(chainConfigStore.state).map((c) => c.id)
    expect(enabled3).toContain('custom-bioforest')
  })
})
