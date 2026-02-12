import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BioErrorCodes } from '../types';

describe('handleCreateTransaction amount semantics', () => {
  const context = {
    appId: 'test-miniapp',
    appName: 'Test Miniapp',
    origin: 'https://test.app',
    permissions: ['bio_createTransaction'],
  };

  let handleCreateTransaction: typeof import('../handlers/transaction').handleCreateTransaction;
  let buildTransactionMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    buildTransactionMock = vi.fn(async (intent: { type: string; amount: { toRawString: () => string } }) => ({
      chainId: 'bfmeta',
      intentType: intent.type,
      data: {
        amountRaw: intent.amount.toRawString(),
      },
    }));

    vi.doMock('@/stores', () => ({
      chainConfigActions: {
        initialize: vi.fn(async () => undefined),
      },
      chainConfigSelectors: {
        getChainById: vi.fn((_: unknown, chainId: string) => ({
          id: chainId,
          symbol: 'BFM',
          decimals: 8,
          chainKind: 'bioforest',
        })),
      },
      chainConfigStore: {
        state: {
          snapshot: {},
        },
      },
      walletStore: {
        state: {
          wallets: [
            {
              id: 'wallet-1',
              chainAddresses: [
                {
                  chain: 'bfmeta',
                  address: 'b_sender',
                },
              ],
            },
          ],
        },
      },
    }));

    vi.doMock('@/services/chain-adapter/providers', () => ({
      getChainProvider: vi.fn(() => ({
        supportsBuildTransaction: true,
        buildTransaction: buildTransactionMock,
      })),
      createChainProvider: vi.fn(() => ({
        supportsBuildTransaction: true,
        buildTransaction: buildTransactionMock,
      })),
    }));

    const module = await import('../handlers/transaction');
    handleCreateTransaction = module.handleCreateTransaction;
  });

  afterEach(() => {
    vi.doUnmock('@/stores');
    vi.doUnmock('@/services/chain-adapter/providers');
  });

  it('rejects formatted amount', async () => {
    await expect(
      handleCreateTransaction(
        {
          from: 'b_sender',
          to: 'b_receiver',
          amount: '10.00000000',
          chain: 'bfmeta',
          asset: 'BFM',
        },
        context,
      ),
    ).rejects.toMatchObject({
      code: BioErrorCodes.INVALID_PARAMS,
      message: 'Invalid amount: expected raw integer string',
    });
  });

  it('accepts raw amount and keeps raw semantics', async () => {
    const result = await handleCreateTransaction(
      {
        from: 'b_sender',
        to: 'b_receiver',
        amount: '1000000000',
        chain: 'bfmeta',
        asset: 'BFM',
      },
      context,
    );

    expect(buildTransactionMock).toHaveBeenCalledTimes(1);
    const intent = buildTransactionMock.mock.calls[0]?.[0] as { amount: { toRawString: () => string } };
    expect(intent.amount.toRawString()).toBe('1000000000');
    expect(result).toEqual({
      chainId: 'bfmeta',
      intentType: 'transfer',
      data: {
        amountRaw: '1000000000',
      },
    });
  });
});
