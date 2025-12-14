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
  it('parses and contains 8 default chains', async () => {
    const filePath = path.join(process.cwd(), 'public/configs/default-chains.json')
    const raw = await fs.readFile(filePath, 'utf8')

    const parsedJson: unknown = JSON.parse(raw)
    const chains = ChainConfigListSchema.parse(parsedJson)

    expect(chains).toHaveLength(8)

    const ids = chains.map(c => c.id).sort()
    expect(ids).toEqual(
      [
        'bfchainv2',
        'bfmeta',
        'biwmeta',
        'btgmeta',
        'ccchain',
        'ethmeta',
        'malibu',
        'pmchain',
      ].sort()
    )
  })
})

