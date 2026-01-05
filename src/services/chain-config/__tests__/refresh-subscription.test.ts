import { beforeEach, describe, expect, it, vi } from 'vitest'
import 'fake-indexeddb/auto'

import { ChainConfigSubscriptionSchema } from '../schema'
import { loadChainConfigs, loadSubscriptionMeta, resetChainConfigStorageForTests, saveSubscriptionMeta, saveDefaultVersion } from '../storage'
import { refreshSubscription } from '../index'

describe('chain-config refreshSubscription', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    await resetChainConfigStorageForTests()
    await saveDefaultVersion('2.0.0')
  })

  it('skips when subscription url is default', async () => {
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url: 'default',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )

    const { result } = await refreshSubscription()
    expect(result.status).toBe('skipped')
  })

  it('forces fetch without If-None-Match even when etag exists', async () => {
    const url = 'https://example.com/chains.json'
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url,
        etag: 'etag-1',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )

    const baseFetch = fetch.bind(globalThis)
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input, init) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (requestUrl.includes('/configs/default-chains.json')) {
        return baseFetch(input, init)
      }

      return new Response(
        JSON.stringify([
          { id: 'remote-one', version: '1.0', chainKind: 'evm', name: 'Remote One', symbol: 'R1', decimals: 8 },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json', ETag: 'etag-2' } }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = await refreshSubscription()
    expect(result.status).toBe('updated')

    const subscriptionCall = fetchMock.mock.calls.find(([input]) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      return requestUrl === url
    })
    expect(subscriptionCall).toBeDefined()

    const init = subscriptionCall?.[1]
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(headers['If-None-Match']).toBeUndefined()

    const storedMeta = await loadSubscriptionMeta()
    expect(storedMeta?.url).toBe(url)
    expect(storedMeta?.etag).toBe('etag-2')
    expect(storedMeta?.lastUpdated).not.toBe('2025-01-01T00:00:00.000Z')

    const storedConfigs = await loadChainConfigs()
    expect(storedConfigs.some((c) => c.source === 'subscription' && c.id === 'remote-one')).toBe(true)
  })
})
