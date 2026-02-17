import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Amount } from '@/types/amount';
import type { AssetInfo } from '@/types/asset';
import type { ChainConfig } from '@/services/chain-config';

const { mockSubmitWeb3Transfer, mockFetchWeb3Fee } = vi.hoisted(() => ({
  mockSubmitWeb3Transfer: vi.fn(),
  mockFetchWeb3Fee: vi.fn(),
}));

vi.mock('./use-send.web3', async () => {
  const actual = await vi.importActual<typeof import('./use-send.web3')>('./use-send.web3');
  return {
    ...actual,
    fetchWeb3Fee: mockFetchWeb3Fee,
    submitWeb3Transfer: mockSubmitWeb3Transfer,
    validateWeb3Address: vi.fn(() => null),
  };
});

import { useSend } from './use-send';

const mockAsset: AssetInfo = {
  assetType: 'TRX',
  name: 'Tron',
  amount: Amount.fromRaw('100000000', 6, 'TRX'),
  decimals: 6,
};

const mockChainConfig = {
  id: 'tron',
  name: 'Tron',
  symbol: 'TRX',
  decimals: 6,
  chainKind: 'tron',
} as ChainConfig;

describe('useSend submit message propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchWeb3Fee.mockResolvedValue({
      amount: Amount.fromRaw('1000', 6, 'TRX'),
      symbol: 'TRX',
    });
  });

  it('returns and stores detailed submit error message for web3 transfer', async () => {
    const detailedMessage = 'Broadcast failed: SIGERROR';
    mockSubmitWeb3Transfer.mockResolvedValue({
      status: 'error',
      message: detailedMessage,
    });

    const { result } = renderHook(() =>
      useSend({
        initialAsset: mockAsset,
        useMock: false,
        walletId: 'wallet-1',
        fromAddress: 'TFromAddress',
        chainConfig: mockChainConfig,
      }),
    );

    act(() => {
      result.current.setToAddress('TToAddress');
      result.current.setAmount(Amount.fromRaw('100000', 6, 'TRX'));
    });

    let submitResult: Awaited<ReturnType<typeof result.current.submit>>;
    await act(async () => {
      submitResult = await result.current.submit('wallet-lock');
    });

    expect(submitResult).toEqual({
      status: 'error',
      message: detailedMessage,
    });
    await waitFor(() => {
      expect(result.current.state.errorMessage).toBe(detailedMessage);
    });
  });
});
