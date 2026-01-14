import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BiowalletProvider } from '../biowallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BFM',
    getDecimals: () => 8,
  },
}))

const mockFetch = vi.fn()
const originalFetch = global.fetch
Object.assign(global, { fetch: mockFetch });

afterAll(() => {
  Object.assign(global, { fetch: originalFetch });
});

function readFixture<T>(name: string): T {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const filePath = path.join(dir, 'fixtures/real', name)
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function createMockResponse<T>(data: T, ok = true, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('BiowalletProvider (real fixtures)', () => {
  const entry: ParsedApiEntry = {
    type: 'biowallet-v1',
    endpoint: 'https://walletapi.bfmeta.info/wallet/bfm',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  it('converts transferAsset transactions from BFMeta API', async () => {
    const address = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'
    const lastblock = readFixture<any>('bfmeta-lastblock.json')
    const query = readFixture<any>('bfmeta-transactions-query.json')

    mockFetch.mockImplementation(async (input: Request | string) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock)
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? 'POST' : input.method).toBe('POST')
        return createMockResponse(query)
      }
      return createMockResponse({ error: 'Not found' }, false, 404)
    })

    const provider = new BiowalletProvider(entry, 'bfmeta')
    const txs = await provider.transactionHistory.fetch({ address, limit: 10 })

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
