import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'

import { ChainConfigSchema } from '../schema'
import {
  loadChainConfigs,
  loadUserPreferences,
  resetChainConfigStorageForTests,
  saveChainConfigs,
  saveUserPreferences,
} from '../storage'

describe('chain-config storage', () => {
  beforeEach(async () => {
    await resetChainConfigStorageForTests()
  })

  it('saves and loads configs by source', async () => {
    const manualConfigs = [
      ChainConfigSchema.parse({
        id: 'bfmeta',
        version: '1.0',
        chainKind: 'bioforest',
        name: 'BFMeta',
        symbol: 'BFT',
        prefix: 'c',
        decimals: 8,
      }),
      ChainConfigSchema.parse({
        id: 'custom-1',
        version: '1.0',
        chainKind: 'custom',
        name: 'Custom',
        symbol: 'CST',
        decimals: 8,
      }),
    ]

    await saveChainConfigs({ source: 'manual', configs: manualConfigs })

    const loaded = await loadChainConfigs()
    expect(loaded).toHaveLength(2)
    expect(loaded.map((c) => c.source)).toEqual(['manual', 'manual'])
    expect(loaded.every((c) => c.enabled === true)).toBe(true)
  })

  it('replaces existing configs under the same source', async () => {
    const first = [
      ChainConfigSchema.parse({
        id: 'first',
        version: '1.0',
        chainKind: 'custom',
        name: 'First',
        symbol: 'FST',
        decimals: 8,
      }),
    ]
    await saveChainConfigs({ source: 'manual', configs: first })

    const second = [
      ChainConfigSchema.parse({
        id: 'second',
        version: '1.0',
        chainKind: 'custom',
        name: 'Second',
        symbol: 'SND',
        decimals: 8,
      }),
    ]
    await saveChainConfigs({ source: 'manual', configs: second })

    const loaded = await loadChainConfigs()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe('second')
  })

  it('stores user enable/disable preferences', async () => {
    await saveUserPreferences({ bfmeta: false, ccchain: true })
    const loaded = await loadUserPreferences()

    expect(loaded.bfmeta).toBe(false)
    expect(loaded.ccchain).toBe(true)
  })
})

