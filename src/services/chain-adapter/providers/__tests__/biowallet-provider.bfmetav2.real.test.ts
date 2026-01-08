import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BiowalletProvider } from '../biowallet-provider';
import type { ParsedApiEntry } from '@/services/chain-config';

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BFM',
    getDecimals: () => 8,
  },
}));

const mockFetch = vi.fn();
const originalFetch = global.fetch;
global.fetch = mockFetch;

afterAll(() => {
  global.fetch = originalFetch;
});

function readFixture<T>(name: string): T {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(dir, 'fixtures/real', name);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

describe('BiowalletProvider (BFMetaV2 real fixtures)', () => {
  const entry: ParsedApiEntry = {
    type: 'biowallet-v1',
    endpoint: 'https://walletapi.bf-meta.org/wallet/bfmetav2',
  };

  const lastblock = readFixture<any>('bfmetav2-lastblock.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses endpoint directly without path concatenation', () => {
    const provider = new BiowalletProvider(entry, 'bfmetav2');
    expect(provider.endpoint).toBe('https://walletapi.bf-meta.org/wallet/bfmetav2');
  });

  it('fetches block height from the correct endpoint', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url === 'https://walletapi.bf-meta.org/wallet/bfmetav2/lastblock') {
        return { ok: true, json: async () => lastblock };
      }
      return { ok: false, status: 404 };
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const height = await provider.getBlockHeight();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://walletapi.bf-meta.org/wallet/bfmetav2/lastblock',
      undefined
    );
    expect(height).toBe(BigInt(45052));
  });

  it('converts transferAsset (AST-02) to transfer + native asset', async () => {
    const query = readFixture<any>('bfmetav2-transactions-query.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/lastblock')) {
        return { ok: true, json: async () => lastblock };
      }
      if (url.endsWith('/transactions/query')) {
        expect(init?.method).toBe('POST');
        return { ok: true, json: async () => query };
      }
      return { ok: false, status: 404 };
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const txs = await provider.getTransactionHistory(tx.recipientId, 10);

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('transfer');
    expect(txs[0].direction).toBe('in');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BFM',
      decimals: 8,
      value: '444',
    });
  });

  it('queries address assets from the correct endpoint', async () => {
    const assetResponse = {
      success: true,
      result: {
        address: 'bPbubZwJGSJBB3feZpsvttMFj8spu1jCm2',
        assets: {
          GAGGQ: {
            BFM: { assetNumber: '1000000000', assetType: 'BFM' },
          },
        },
      },
    };

    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === 'https://walletapi.bf-meta.org/wallet/bfmetav2/address/asset') {
        expect(init?.method).toBe('POST');
        return { ok: true, json: async () => assetResponse };
      }
      return { ok: false, status: 404 };
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const balance = await provider.getNativeBalance('bPbubZwJGSJBB3feZpsvttMFj8spu1jCm2');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://walletapi.bf-meta.org/wallet/bfmetav2/address/asset',
      expect.objectContaining({ method: 'POST' })
    );
    expect(balance.symbol).toBe('BFM');
    expect(balance.amount.toRawString()).toBe('1000000000');
  });
});
