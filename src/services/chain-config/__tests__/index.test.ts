import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'

import { ChainConfigSchema, ChainConfigSubscriptionSchema } from '../schema'
import { resetChainConfigStorageForTests, saveChainConfigs, saveSubscriptionMeta, saveUserPreferences } from '../storage'
import { addManualConfig, getChainById, getEnabledChains, initialize, setChainEnabled } from '../index'

describe('chain-config service', () => {
  beforeEach(async () => {
    await resetChainConfigStorageForTests()
  })

  it('merges sources with precedence manual > subscription > default', async () => {
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url: 'https://example.com/chains.json',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )

    await saveChainConfigs({
      source: 'subscription',
      configs: [
        ChainConfigSchema.parse({
          id: 'bfmeta',
          version: '1.0',
          chainKind: 'bioforest',
          name: 'BFMeta (sub)',
          symbol: 'BFT',
          decimals: 8,
          prefix: 'c',
          source: 'subscription',
        }),
      ],
    })

    await saveChainConfigs({
      source: 'manual',
      configs: [
        ChainConfigSchema.parse({
          id: 'bfmeta',
          version: '1.0',
          chainKind: 'bioforest',
          name: 'BFMeta (manual)',
          symbol: 'BFT',
          decimals: 8,
          prefix: 'c',
          source: 'manual',
        }),
      ],
    })

    const snapshot = await initialize()
    const chain = getChainById(snapshot, 'bfmeta')
    expect(chain?.source).toBe('manual')
    expect(chain?.name).toBe('BFMeta (manual)')

    const enabled = getEnabledChains(snapshot)
    expect(enabled.some((c) => c.id === 'bfmeta')).toBe(true)
  })

  it('ignores cached subscription configs when subscription url is default', async () => {
    await saveSubscriptionMeta(
      ChainConfigSubscriptionSchema.parse({
        url: 'default',
        lastUpdated: '2025-01-01T00:00:00.000Z',
      })
    )

    await saveChainConfigs({
      source: 'subscription',
      configs: [
        ChainConfigSchema.parse({
          id: 'bfmeta',
          version: '1.0',
          chainKind: 'bioforest',
          name: 'BFMeta (sub)',
          symbol: 'BFT',
          decimals: 8,
          prefix: 'c',
          source: 'subscription',
        }),
      ],
    })

    const snapshot = await initialize()
    const chain = getChainById(snapshot, 'bfmeta')
    expect(chain?.source).toBe('default')
  })

  it('applies enabledMap to configs and enabled list', async () => {
    await saveUserPreferences({ bfmeta: false })

    const snapshot = await initialize()
    const chain = getChainById(snapshot, 'bfmeta')
    expect(chain?.enabled).toBe(false)

    const enabled = getEnabledChains(snapshot)
    expect(enabled.some((c) => c.id === 'bfmeta')).toBe(false)
  })

  it('warns and hides incompatible major versions from enabled chains', async () => {
    await saveChainConfigs({
      source: 'manual',
      configs: [
        ChainConfigSchema.parse({
          id: 'future',
          version: '2.0',
          chainKind: 'bioforest',
          name: 'Future',
          symbol: 'FUT',
          decimals: 8,
          prefix: 'c',
          source: 'manual',
        }),
      ],
    })

    const snapshot = await initialize()
    expect(snapshot.configs.some((c) => c.id === 'future')).toBe(true)
    expect(snapshot.warnings.some((w) => w.id === 'future' && w.kind === 'incompatible_major')).toBe(true)

    const enabled = getEnabledChains(snapshot)
    expect(enabled.some((c) => c.id === 'future')).toBe(false)
  })

  it('adds manual config from object or array and keeps existing manual configs', async () => {
    await addManualConfig({
      id: 'manual-one',
      version: '1.0',
      chainKind: 'bioforest',
      name: 'Manual One',
      symbol: 'M1',
      decimals: 8,
      prefix: 'c',
    })

    await addManualConfig([
      {
        id: 'manual-two',
        version: '1.0',
        chainKind: 'bioforest',
        name: 'Manual Two',
        symbol: 'M2',
        decimals: 8,
        prefix: 'c',
      },
    ])

    const snapshot = await initialize()
    expect(getChainById(snapshot, 'manual-one')?.source).toBe('manual')
    expect(getChainById(snapshot, 'manual-two')?.source).toBe('manual')
  })

  it('normalizes unknown type to custom when adding manual config', async () => {
    const snapshot = await addManualConfig({
      id: 'manual-unknown',
      version: '1.0',
      type: 'unknown-type',
      name: 'Manual Unknown',
      symbol: 'MU',
      decimals: 8,
    })

    const chain = getChainById(snapshot, 'manual-unknown')
    expect(chain?.type).toBe('custom')
    expect(chain?.source).toBe('manual')
  })

  it('persists enabled/disabled preference via setChainEnabled', async () => {
    const snapshot1 = await setChainEnabled('bfmeta', false)
    expect(getChainById(snapshot1, 'bfmeta')?.enabled).toBe(false)
    expect(snapshot1.enabledMap['bfmeta']).toBe(false)

    const enabled1 = getEnabledChains(snapshot1)
    expect(enabled1.some((c) => c.id === 'bfmeta')).toBe(false)

    const snapshot2 = await setChainEnabled('bfmeta', true)
    expect(getChainById(snapshot2, 'bfmeta')?.enabled).toBe(true)
    expect(snapshot2.enabledMap['bfmeta']).toBe(true)
  })
})
