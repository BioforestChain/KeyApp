import { describe, expect, it } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'

import { ChainConfigListSchema, ChainConfigSchema, VersionedChainConfigFileSchema } from '../schema'

describe('ChainConfigSchema', () => {
  it('fills runtime defaults (enabled/source)', () => {
    const parsed = ChainConfigSchema.parse({
      id: 'bfmeta',
      version: '1.0',
      chainKind: 'bioforest',
      name: 'BFMeta',
      symbol: 'BFT',
      prefix: 'c',
      decimals: 8,
    })

    expect(parsed.enabled).toBe(true)
    expect(parsed.source).toBe('default')
  })

  it('rejects invalid version format', () => {
    expect(() =>
      ChainConfigSchema.parse({
        id: 'bfmeta',
        version: '1',
        chainKind: 'bioforest',
        name: 'BFMeta',
        symbol: 'BFT',
        prefix: 'c',
        decimals: 8,
      })
    ).toThrow()
  })
})

describe('default-chains.json', () => {
  it('parses and contains all default chains', async () => {
    const filePath = path.join(process.cwd(), 'public/configs/default-chains.json')
    const raw = await fs.readFile(filePath, 'utf8')

    const parsedJson: unknown = JSON.parse(raw)
    const versionedFile = VersionedChainConfigFileSchema.parse(parsedJson)
    const chains = versionedFile.chains

    // 8 bioforest + 4 external (ethereum, binance, tron, bitcoin)
    expect(chains).toHaveLength(12)

    const ids = chains.map(c => c.id).sort()
    expect(ids).toEqual([
      'bfchainv2',
      'bfmeta',
      'bfmetav2',
      'binance',
      'bitcoin',
      'biwmeta',
      'btgmeta',
      'ccchain',
      'ethereum',
      'ethmeta',
      'pmchain',
      'tron',
    ])

    // Verify chain types
    const bioforestChains = chains.filter(c => c.chainKind === 'bioforest')
    const evmChains = chains.filter(c => c.chainKind === 'evm')
    const tronChains = chains.filter(c => c.chainKind === 'tron')
    const bip39Chains = chains.filter(c => c.chainKind === 'bitcoin')

    expect(bioforestChains).toHaveLength(8)
    expect(evmChains).toHaveLength(2)
    expect(tronChains).toHaveLength(1)
    expect(bip39Chains).toHaveLength(1)
  })
})

