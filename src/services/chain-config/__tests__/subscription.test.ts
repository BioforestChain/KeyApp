import { beforeEach, describe, expect, it, vi } from 'vitest'
import 'fake-indexeddb/auto'

import { ChainConfigSchema, ChainConfigSubscriptionSchema } from '../schema'
import { loadChainConfigs, loadSubscriptionMeta, resetChainConfigStorageForTests, saveChainConfigs, saveSubscriptionMeta } from '../storage'
import { fetchSubscription, parseAndValidate } from '../subscription'

describe('chain-config subscription', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    await resetChainConfigStorageForTests()
  })

  it('parses both object and array payloads', () => {
    const single = parseAndValidate({
      id: 'one',
      version: '1.0',
      type: 'custom',
      name: 'One',
      symbol: 'ONE',
      decimals: 8,
    })
    expect(single).toHaveLength(1)
    expect(single[0]?.source).toBe('subscription')

    const list = parseAndValidate([
      {
        id: 'two',
        version: '1.0',
        type: 'custom',
        name: 'Two',
        symbol: 'TWO',
        decimals: 8,
      },
    ])
    expect(list).toHaveLength(1)
    expect(list[0]?.id).toBe('two')
  })

  it('sends If-None-Match and uses cached configs on 304', async () => {
    const url = 'https://example.com/chains.json'
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url,
        etag: 'etag-1',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )

    const cached = [
      ChainConfigSchema.parse({
        id: 'cached',
        version: '1.0',
        type: 'custom',
        name: 'Cached',
        symbol: 'C',
        decimals: 8,
        source: 'subscription',
      }),
    ]
    await saveChainConfigs({ source: 'subscription', configs: cached })

    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => {
      return new Response(null, { status: 304 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchSubscription(url)

    expect(result.status).toBe('not_modified')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const init = fetchMock.mock.calls[0]?.[1]
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(headers['If-None-Match']).toBe('etag-1')

    expect(result.configs).toHaveLength(1)
    expect(result.configs[0]?.id).toBe('cached')
  })

  it('updates cache and meta on 200', async () => {
    const url = 'https://example.com/chains.json'
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => {
      return new Response(
        JSON.stringify([
          { id: 'new', version: '1.0', type: 'custom', name: 'New', symbol: 'NEW', decimals: 8 },
        ]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ETag: 'etag-2' },
        }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchSubscription(url)
    expect(result.status).toBe('updated')
    expect(result.configs[0]?.id).toBe('new')

    const meta = await loadSubscriptionMeta()
    expect(meta?.url).toBe(url)
    expect(meta?.etag).toBe('etag-2')

    const all = await loadChainConfigs()
    expect(all.some((c) => c.source === 'subscription' && c.id === 'new')).toBe(true)
  })

  it('returns cached configs on error', async () => {
    const url = 'https://example.com/chains.json'
    const cached = [
      ChainConfigSchema.parse({
        id: 'cached',
        version: '1.0',
        type: 'custom',
        name: 'Cached',
        symbol: 'C',
        decimals: 8,
        source: 'subscription',
      }),
    ]
    await saveChainConfigs({ source: 'subscription', configs: cached })

    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => {
      return new Response('', { status: 500, statusText: 'Boom' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchSubscription(url)
    expect(result.status).toBe('error')
    expect(result.configs).toHaveLength(1)
    expect(result.configs[0]?.id).toBe('cached')
  })
})
