import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BiowalletProvider } from '../biowallet-provider';
import type { ParsedApiEntry } from '@/services/chain-config';

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BIW',
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

describe('BiowalletProvider (BIWMeta real fixtures)', () => {
  const entry: ParsedApiEntry = {
    type: 'biowallet-v1',
    endpoint: 'https://walletapi.bfmeta.info/wallet/biwmeta',
  };

  const lastblock = readFixture<any>('biwmeta-lastblock.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts transferAsset (AST-02) to transfer + native asset', async () => {
    const query = readFixture<any>('biwmeta-ast-02-transferAsset.json');
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

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.getTransactionHistory(tx.recipientId, 10);

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

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.getTransactionHistory(tx.senderId, 10);

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

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.getTransactionHistory(tx.senderId, 10);

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

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.getTransactionHistory(tx.senderId, 10);

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

    const provider = new BiowalletProvider(entry, 'biwmeta');
    const txs = await provider.getTransactionHistory(tx.senderId, 10);

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
