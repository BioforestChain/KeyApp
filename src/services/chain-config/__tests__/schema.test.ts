import { describe, expect, it } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'

import { ChainConfigListSchema, ChainConfigSchema } from '../schema'

describe('ChainConfigSchema', () => {
  it('fills runtime defaults (enabled/source)', () => {
    const parsed = ChainConfigSchema.parse({
      id: 'bfmeta',
      version: '1.0',
      type: 'bioforest',
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
        type: 'bioforest',
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
    const chains = ChainConfigListSchema.parse(parsedJson)

    // 7 bioforest + 4 external (ethereum, binance, tron, bitcoin)
    expect(chains).toHaveLength(11)

    const ids = chains.map(c => c.id).sort()
    expect(ids).toEqual([
      'bfchainv2',
      'bfmeta',
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
    const bioforestChains = chains.filter(c => c.type === 'bioforest')
    const evmChains = chains.filter(c => c.type === 'evm')
    const bip39Chains = chains.filter(c => c.type === 'bip39')

    expect(bioforestChains).toHaveLength(7)
    expect(evmChains).toHaveLength(2)
    expect(bip39Chains).toHaveLength(2)
  })
})

