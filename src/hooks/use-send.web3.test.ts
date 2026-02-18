import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainConfig } from '@/services/chain-config';
import { Amount } from '@/types/amount';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';
import i18n from '@/i18n';

const { mockGetMnemonic, mockGetChainProvider } = vi.hoisted(() => ({
  mockGetMnemonic: vi.fn(),
  mockGetChainProvider: vi.fn(),
}));

vi.mock('@/services/wallet-storage', async () => {
  const actual = await vi.importActual<typeof import('@/services/wallet-storage')>('@/services/wallet-storage');
  return {
    ...actual,
    walletStorageService: {
      ...actual.walletStorageService,
      getMnemonic: mockGetMnemonic,
    },
  };
});

vi.mock('@/services/chain-adapter/providers', async () => {
  const actual = await vi.importActual<typeof import('@/services/chain-adapter/providers')>(
    '@/services/chain-adapter/providers',
  );
  return {
    ...actual,
    getChainProvider: mockGetChainProvider,
  };
});

import { fetchWeb3Fee, submitWeb3Transfer } from './use-send.web3';

type MockChainProvider = {
  supportsFullTransaction: boolean;
  supportsBuildTransaction?: boolean;
  supportsFeeEstimate?: boolean;
  buildTransaction: (intent: unknown) => Promise<unknown>;
  signTransaction: (unsignedTx: unknown, options: { privateKey: Uint8Array }) => Promise<unknown>;
  broadcastTransaction: (signedTx: unknown) => Promise<string>;
  estimateFee?: (unsignedTx: unknown) => Promise<{ standard: { amount: Amount } }>;
};

function createChainConfig(): ChainConfig {
  return {
    id: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    chainKind: 'tron',
  } as ChainConfig;
}

function createMockProvider(overrides?: Partial<MockChainProvider>): MockChainProvider {
  const buildTransaction = vi.fn(async () => ({ data: { txID: 'mock-tx' } }));
  const signTransaction = vi.fn(async () => ({ data: { txID: 'mock-tx', signature: ['sig'] } }));
  const broadcastTransaction = vi.fn(async () => 'mock-hash');

  return {
    supportsFullTransaction: true,
    buildTransaction,
    signTransaction,
    broadcastTransaction,
    ...overrides,
  };
}

describe('submitWeb3Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMnemonic.mockResolvedValue(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    );
  });

  it('maps tx build self-transfer error to localized copy', async () => {
    const provider = createMockProvider({
      buildTransaction: vi.fn(async () => {
        throw new ChainServiceError(
          ChainErrorCodes.TX_BUILD_FAILED,
          'Failed to create Tron transaction: Cannot transfer TRX to yourself.',
          { reason: 'Cannot transfer TRX to yourself.' },
        );
      }),
    });
    mockGetChainProvider.mockReturnValue(provider);

    const result = await submitWeb3Transfer({
      chainConfig: createChainConfig(),
      walletId: 'wallet-1',
      password: 'pwd',
      fromAddress: 'TFromAddress',
      toAddress: 'TFromAddress',
      amount: Amount.fromRaw('1000000', 6, 'TRX'),
    });

    expect(result).toEqual({
      status: 'error',
      message: i18n.t('error:validation.cannotTransferToSelf'),
    });
  });

  it('returns tx build reason for non-self-transfer errors', async () => {
    const reason = 'account does not exist';
    const provider = createMockProvider({
      buildTransaction: vi.fn(async () => {
        throw new ChainServiceError(
          ChainErrorCodes.TX_BUILD_FAILED,
          `Failed to create Tron transaction: ${reason}`,
          { reason },
        );
      }),
    });
    mockGetChainProvider.mockReturnValue(provider);

    const result = await submitWeb3Transfer({
      chainConfig: createChainConfig(),
      walletId: 'wallet-1',
      password: 'pwd',
      fromAddress: 'TFromAddress',
      toAddress: 'TAnotherAddress',
      amount: Amount.fromRaw('1000000', 6, 'TRX'),
    });

    expect(result).toEqual({
      status: 'error',
      message: reason,
    });
  });

  it('uses 32-byte private key for tron signing', async () => {
    const signTransaction = vi.fn(async (_unsignedTx: unknown, options: { privateKey: Uint8Array }) => {
      expect(options.privateKey).toBeInstanceOf(Uint8Array);
      expect(options.privateKey.length).toBe(32);
      return { data: { txID: 'signed-tx', signature: ['sig'] } };
    });

    const provider = createMockProvider({
      buildTransaction: vi.fn(async () => ({ data: { txID: 'mock-tx' } })),
      signTransaction,
      broadcastTransaction: vi.fn(async () => 'tx-hash'),
    });
    mockGetChainProvider.mockReturnValue(provider);

    const result = await submitWeb3Transfer({
      chainConfig: createChainConfig(),
      walletId: 'wallet-1',
      password: 'pwd',
      fromAddress: 'TFromAddress',
      toAddress: 'TToAddress',
      amount: Amount.fromRaw('1000000', 6, 'TRX'),
    });

    expect(result).toEqual({ status: 'ok', txHash: 'tx-hash' });
  });

  it('passes tokenAddress to buildTransaction', async () => {
    const provider = createMockProvider();
    mockGetChainProvider.mockReturnValue(provider);

    await submitWeb3Transfer({
      chainConfig: createChainConfig(),
      walletId: 'wallet-1',
      password: 'pwd',
      fromAddress: 'TFromAddress',
      toAddress: 'TToAddress',
      amount: Amount.fromRaw('1000000', 6, 'USDT'),
      tokenAddress: 'TTokenContract',
    });

    expect(provider.buildTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenAddress: 'TTokenContract',
      }),
    );
  });
});

describe('fetchWeb3Fee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes tokenAddress to buildTransaction', async () => {
    const provider: MockChainProvider = createMockProvider({
      supportsFullTransaction: true,
      supportsFeeEstimate: true,
      supportsBuildTransaction: true,
      buildTransaction: vi.fn(async () => ({ data: { txID: 'mock-tx' } })),
      estimateFee: vi.fn(async () => ({
        standard: { amount: Amount.fromRaw('1000', 6, 'TRX') },
      })),
    });

    mockGetChainProvider.mockReturnValue(provider);

    const result = await fetchWeb3Fee({
      chainConfig: createChainConfig(),
      fromAddress: 'TFromAddress',
      toAddress: 'TToAddress',
      amount: Amount.fromRaw('1000000', 6, 'USDT'),
      tokenAddress: 'TTokenContract',
    });

    expect(provider.buildTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenAddress: 'TTokenContract',
      }),
    );
    expect(result.amount.toRawString()).toBe('1000');
  });
});
