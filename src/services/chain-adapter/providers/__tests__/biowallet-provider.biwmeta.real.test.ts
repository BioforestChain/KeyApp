import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BiowalletProvider } from '../biowallet-provider';
import type { ParsedApiEntry } from '@/services/chain-config';
import { keyFetch } from '@biochain/key-fetch';

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BIW',
    getDecimals: () => 8,
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

function createMockResponse<T>(data: T, ok = true, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('BiowalletProvider (BIWMeta real fixtures)', () => {
  const entry: ParsedApiEntry = {
    type: 'biowallet-v1',
    endpoint: 'https://walletapi.bfmeta.info/wallet/biwmeta',
  };

  const lastblock = readFixture<any>('biwmeta-lastblock.json');

  beforeEach(() => {
    vi.clearAllMocks();
    keyFetch.clear();
  });

  it('converts transferAsset (AST-02) to transfer + native asset', async () => {
    const query = readFixture<any>('biwmeta-ast-02-transferAsset.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? init?.method : input.method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.transactionHistory.fetch({ address: tx.recipientId, limit: 10 });

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('transfer');
    expect(txs[0].direction).toBe('in');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BIW',
      decimals: 8,
      value: '5000',
    });
  });

  it('converts destroyAsset (AST-03) to destroyAsset + native asset', async () => {
    const query = readFixture<any>('biwmeta-ast-03-destroyAsset.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? init?.method : input.method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.transactionHistory.fetch({ address: tx.senderId, limit: 10 });

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('destroyAsset');
    expect(txs[0].direction).toBe('out');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'AMGT',
      decimals: 8,
      value: '58636952548',
    });
  });

  it('converts issueEntity (ETY-02) to issueEntity + placeholder native asset', async () => {
    const query = readFixture<any>('biwmeta-ety-02-issueEntity.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? init?.method : input.method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.transactionHistory.fetch({ address: tx.senderId, limit: 10 });

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('issueEntity');
    expect(txs[0].direction).toBe('self');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BIW',
      decimals: 8,
      value: '0',
    });
  });

  it('converts issueEntityFactory (ETY-01) to issueEntity + placeholder native asset', async () => {
    const query = readFixture<any>('biwmeta-ety-01-issueEntityFactory.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? init?.method : input.method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.transactionHistory.fetch({ address: tx.senderId, limit: 10 });

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('issueEntity');
    expect(txs[0].direction).toBe('self');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BIW',
      decimals: 8,
      value: '0',
    });
  });

  it('converts signature (BSE-01) to signature + placeholder native asset', async () => {
    const query = readFixture<any>('biwmeta-bse-01-signature.json');
    const tx = query.result.trs[0].transaction;

    mockFetch.mockImplementation(async (input: Request | string, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.endsWith('/block/lastblock')) {
        return createMockResponse(lastblock);
      }
      if (url.endsWith('/transaction/list')) {
        expect(typeof input === 'string' ? init?.method : input.method).toBe('POST');
        return createMockResponse(query);
      }
      return createMockResponse({ error: 'Not found' }, false, 404);
    });

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.transactionHistory.fetch({ address: tx.senderId, limit: 10 });

    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].action).toBe('signature');
    expect(txs[0].direction).toBe('out');
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BIW',
      decimals: 8,
      value: '0',
    });
  });
});
