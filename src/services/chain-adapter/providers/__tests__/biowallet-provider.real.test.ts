import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BiowalletProvider } from '../biowallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BFM',
    getDecimals: () => 8,
  },
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

function readFixture<T>(name: string): T {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const filePath = path.join(dir, 'fixtures/real', name)
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

describe('BiowalletProvider (real fixtures)', () => {
  const entry: ParsedApiEntry = {
    type: 'biowallet-v1',
    endpoint: 'https://walletapi.bfmeta.info',
    config: { path: 'bfm' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('converts transferAsset transactions from BFMeta API', async () => {
    const address = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'
    const lastblock = readFixture<any>('bfmeta-lastblock.json')
    const query = readFixture<any>('bfmeta-transactions-query.json')

    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/wallet/bfm/lastblock')) {
        return { ok: true, json: async () => lastblock }
      }
      if (url.endsWith('/wallet/bfm/transactions/query')) {
        expect(init?.method).toBe('POST')
        return { ok: true, json: async () => query }
      }
      return { ok: false, status: 404 }
    })

    const provider = new BiowalletProvider(entry, 'bfmeta')
    const txs = await provider.getTransactionHistory(address, 10)

    expect(txs.length).toBeGreaterThan(0)
    expect(txs[0].action).toBe('transfer')
    expect(txs[0].direction).toBe('in')
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BFM',
      decimals: 8,
    })
  })
})
