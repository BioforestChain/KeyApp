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
    getBiowalletGenesisBlock: () => null,
  },
}));

const mockFetch = vi.fn();
const originalFetch = global.fetch;
Object.assign(global, { fetch: mockFetch });

afterAll(() => {
  Object.assign(global, { fetch: originalFetch });
});

function readFixture<T>(name: string): T {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(dir, 'fixtures/real', name);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

/** 创建模拟 Response 对象 */
function createMockResponse(data: unknown, ok = true, status = 200): Response {
  const jsonData = JSON.stringify(data);
  return new Response(jsonData, {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
    statusText: ok ? 'OK' : 'Not Found',
  });
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
    mockFetch.mockImplementation(async (input: Request | string) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url === 'https://walletapi.bf-meta.org/wallet/bfmetav2/block/lastblock') {
        return createMockResponse(lastblock);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const height = await provider.blockHeight.fetch({});

    expect(mockFetch).toHaveBeenCalled();
    expect(height).toBe(BigInt(45052));
  });

  it('converts transferAsset (AST-02) to transfer + native asset', async () => {
    const query = readFixture<any>('bfmetav2-transactions-query.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = typeof input === 'string' ? undefined : input.method;
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transactions/query')) {
        expect(method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const txs = await provider.transactionHistory.fetch({ address: tx.recipientId, limit: 10 });

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

    mockFetch.mockImplementation(async (input: Request | string) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = typeof input === 'string' ? undefined : input.method;
      if (url === 'https://walletapi.bf-meta.org/wallet/bfmetav2/address/asset') {
        expect(method).toBe('POST');
        return createMockResponse(assetResponse);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'bfmetav2');
    const balance = await provider.nativeBalance.fetch({ address: 'bPbubZwJGSJBB3feZpsvttMFj8spu1jCm2' });

    expect(mockFetch).toHaveBeenCalled();
    expect(balance.symbol).toBe('BFM');
    expect(balance.amount.toRawString()).toBe('1000000000');
  });
});
