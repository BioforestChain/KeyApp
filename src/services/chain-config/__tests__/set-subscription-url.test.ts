import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'

import { ChainConfigSchema, ChainConfigSubscriptionSchema } from '../schema'
import {
  loadChainConfigs,
  loadSubscriptionMeta,
  resetChainConfigStorageForTests,
  saveChainConfigs,
  saveSubscriptionMeta,
  saveDefaultVersion,
} from '../storage'
import { setSubscriptionUrl } from '../index'

describe('chain-config setSubscriptionUrl', () => {
  beforeEach(async () => {
    await resetChainConfigStorageForTests()
    await saveDefaultVersion('2.0.0')
  })

  it('accepts empty string as default and clears cached subscription configs', async () => {
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url: 'https://example.com/old.json',
        etag: 'etag-1',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )
    await saveChainConfigs({
      source: 'subscription',
      configs: [
        ChainConfigSchema.parse({
          id: 'cached',
          version: '1.0',
          chainKind: 'custom',
          name: 'Cached',
          symbol: 'C',
          decimals: 8,
          source: 'subscription',
        }),
      ],
    })

    await setSubscriptionUrl('')

    const meta = await loadSubscriptionMeta()
    expect(meta?.url).toBe('default')
    expect(meta?.etag).toBeUndefined()

    const configs = await loadChainConfigs()
    expect(configs.some((c) => c.source === 'subscription')).toBe(false)
  })

  it('clears cache when subscription url changes', async () => {
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url: 'https://example.com/old.json',
        etag: 'etag-1',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )
    await saveChainConfigs({
      source: 'subscription',
      configs: [
        ChainConfigSchema.parse({
          id: 'cached',
          version: '1.0',
          chainKind: 'custom',
          name: 'Cached',
          symbol: 'C',
          decimals: 8,
          source: 'subscription',
        }),
      ],
    })

    await setSubscriptionUrl('https://example.com/new.json')

    const meta = await loadSubscriptionMeta()
    expect(meta?.url).toBe('https://example.com/new.json')
    expect(meta?.etag).toBeUndefined()

    const configs = await loadChainConfigs()
    expect(configs.some((c) => c.source === 'subscription')).toBe(false)
  })

  it('rejects invalid url', async () => {
    await expect(setSubscriptionUrl('not-a-url')).rejects.toThrow('Invalid subscription URL')
    await expect(setSubscriptionUrl('file:///tmp/chains.json')).rejects.toThrow('Subscription URL must use http(s)')
  })
})

