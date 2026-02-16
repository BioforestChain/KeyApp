import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { walletStore } from '@/stores';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';

const hoisted = vi.hoisted(() => ({
  mockPop: vi.fn(),
  mockToastShow: vi.fn(),
  currentParams: {} as Record<string, unknown>,
}));

vi.mock('../../stackflow', () => ({
  useFlow: () => ({ pop: hoisted.mockPop }),
}));

vi.mock('../../hooks', () => ({
  ActivityParamsProvider: ({ params, children }: { params: Record<string, unknown>; children: ReactNode }) => {
    hoisted.currentParams = params;
    return <>{children}</>;
  },
  useActivityParams: <T extends Record<string, unknown>>() => hoisted.currentParams as T,
}));

vi.mock('@/stackflow/stackflow', () => ({
  useFlow: () => ({ pop: hoisted.mockPop }),
}));

vi.mock('@/stackflow/hooks', () => ({
  ActivityParamsProvider: ({ params, children }: { params: Record<string, unknown>; children: ReactNode }) => {
    hoisted.currentParams = params;
    return <>{children}</>;
  },
  useActivityParams: <T extends Record<string, unknown>>() => hoisted.currentParams as T,
}));

vi.mock('@/stackflow', () => ({
  useFlow: () => ({ pop: hoisted.mockPop }),
  ActivityParamsProvider: ({ params, children }: { params: Record<string, unknown>; children: ReactNode }) => {
    hoisted.currentParams = params;
    return <>{children}</>;
  },
  useActivityParams: <T extends Record<string, unknown>>() => hoisted.currentParams as T,
}));

vi.mock('@/services', () => ({
  useToast: () => ({ show: hoisted.mockToastShow }),
}));

vi.mock('@/components/layout/bottom-sheet', () => ({
  BottomSheet: ({ children }: { children: ReactNode }) => <div data-testid="bottom-sheet">{children}</div>,
}));

vi.mock('@/components/ecosystem', () => ({
  MiniappSheetHeader: ({ appName, title }: { appName: string; title: string }) => (
    <div data-testid="miniapp-sheet-header">
      <span>{title}</span>
      <span>{appName}</span>
    </div>
  ),
}));

vi.mock('@/components/wallet/address-display', () => ({
  AddressDisplay: ({ address }: { address: string }) => <span>{address}</span>,
}));

vi.mock('@/components/common/amount-display', () => ({
  AmountDisplay: ({ value, symbol }: { value: string; symbol: string }) => (
    <span>{`${value}-${symbol}`}</span>
  ),
}));

vi.mock('@/components/wallet/chain-icon', () => ({
  ChainBadge: ({ chainId }: { chainId: string }) => <span>{chainId}</span>,
}));

vi.mock('@/components/wallet/chain-address-display', () => ({
  ChainAddressDisplay: ({ address }: { address: string }) => <span>{address}</span>,
}));

vi.mock('@/components/security/pattern-lock', () => ({
  PatternLock: ({ onComplete }: { onComplete?: (nodes: number[]) => void }) => (
    <button
      type="button"
      data-testid="pattern-lock"
      onClick={() => onComplete?.([1, 2, 3, 4])}
    >
      pattern
    </button>
  ),
  patternToString: (nodes: number[]) => nodes.join(''),
}));

vi.mock('@/services/ecosystem/handlers', () => ({
  signUnsignedTransaction: vi.fn(),
}));

vi.mock('@/services/chain-adapter/providers', () => ({
  getChainProvider: vi.fn(() => ({
    supportsFullTransaction: true,
    buildTransaction: vi.fn(async (intent: unknown) => ({
      chainId: 'bfmetav2',
      intentType: 'transfer',
      data: intent,
    })),
    signTransaction: vi.fn(),
    broadcastTransaction: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'tx-hash';
    }),
  })),
}));

vi.mock('@/components/security/password-input', () => ({
  PasswordInput: ({ value, onChange }: { value: string; onChange: (e: { target: { value: string } }) => void }) => (
    <input
      data-testid="password-input"
      value={value}
      onChange={(event) => onChange({ target: { value: event.target.value } })}
    />
  ),
}));

vi.mock('./miniapp-auth', () => ({
  isMiniappWalletLockError: (error: unknown) => error instanceof Error && error.message.includes('wallet lock'),
  isMiniappTwoStepSecretError: (error: unknown) => error instanceof Error && error.message.includes('pay password'),
  resolveMiniappTwoStepSecretRequired: vi.fn(async () => false),
}));

import { MiniappTransferConfirmJob } from './MiniappTransferConfirmJob';
import { MiniappSignTransactionJob } from './MiniappSignTransactionJob';
import { signUnsignedTransaction } from '@/services/ecosystem/handlers';
import { getChainProvider } from '@/services/chain-adapter/providers';

describe('miniapp confirm jobs regressions', () => {
  beforeEach(() => {
    hoisted.mockPop.mockReset();
    hoisted.mockToastShow.mockReset();
    hoisted.currentParams = {};

    vi.mocked(getChainProvider).mockReset();
    vi.mocked(getChainProvider).mockImplementation(() => ({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'tx-hash';
      }),
    } as unknown as ReturnType<typeof getChainProvider>));

    vi.mocked(signUnsignedTransaction).mockReset();
    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    walletStore.setState(() => ({
      wallets: [
        {
          id: 'wallet-1',
          name: 'Wallet 1',
          address: '0xAbCd000000000000000000000000000000000000',
          chain: 'ethereum',
          chainAddresses: [
            {
              chain: 'ethereum',
              address: '0xAbCd000000000000000000000000000000000000',
              publicKey: '0xpub1',
            },
            {
              chain: 'bfmetav2',
              address: 'b_sender_1',
              publicKey: 'pub-bf-1',
            },
          ],
          createdAt: 1,
          themeHue: 30,
        },
      ],
      currentWalletId: 'wallet-1',
      selectedChain: 'bfmetav2',
      chainPreferences: {},
      isLoading: false,
      isInitialized: true,
      migrationRequired: false,
    }));
  });

  it('renders MiniappTransferConfirmJob without runtime reference errors', () => {
    expect(() =>
      render(
        <MiniappTransferConfirmJob
          params={{
            appName: 'Org App',
            appIcon: '',
            from: 'b_sender_1',
            to: 'b_receiver_1',
            amount: '1000',
            chain: 'BFMetaV2',
            asset: 'BFM',
          }}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByTestId('miniapp-sheet-header')).toBeInTheDocument();
  });

  it('renders MiniappSignTransactionJob without runtime reference errors', () => {
    expect(() =>
      render(
        <MiniappSignTransactionJob
          params={{
            appName: 'Org App',
            appIcon: '',
            from: 'b_sender_1',
            chain: 'BFMetaV2',
            unsignedTx: 'invalid-superjson',
          }}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByTestId('miniapp-sheet-header')).toBeInTheDocument();
  });

  it('does not pass raw amount directly to display layer', () => {
    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000000000',
          chain: 'BFMetaV2',
          asset: 'USDT',
        }}
      />,
    );

    const amountDisplayNode = screen.getByText((content) => content.endsWith('-USDT'));
    expect(amountDisplayNode).toBeInTheDocument();
    expect(amountDisplayNode.textContent).not.toBe('1000000000-USDT');
  });

  it('keeps confirm button disabled for non-raw amount input', async () => {
    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '10.00000000',
          chain: 'BFMetaV2',
          asset: 'USDT',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
  });

  it('shows building transaction copy in wallet-lock step while generating tx', async () => {
    vi.mocked(signUnsignedTransaction).mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });
          }, 200);
        }),
    );

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    expect(await screen.findByTestId('miniapp-transfer-building-status')).toBeInTheDocument();
  });

  it('builds transfer transaction with raw-equivalent amount', async () => {
    const buildTransaction = vi.fn(async (intent: unknown) => ({
      chainId: 'bfmetav2',
      intentType: 'transfer',
      data: intent,
    }));

    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction,
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => 'tx-hash'),
    } as unknown as ReturnType<typeof getChainProvider>);

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000000000',
          chain: 'BFMetaV2',
          asset: 'USDT',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    await waitFor(() => {
      expect(buildTransaction).toHaveBeenCalledTimes(1);
    });

    const intent = buildTransaction.mock.calls[0]?.[0] as { amount: { toRawString: () => string } };
    expect(intent.amount.toRawString()).toBe('1000000000');
  });

  it('passes remark into transaction intent and keeps it in emitted transaction', async () => {
    const buildTransaction = vi.fn(async (intent: unknown) => ({
      chainId: 'bfmetav2',
      intentType: 'transfer',
      data: intent,
    }));

    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction,
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => 'tx-hash'),
    } as unknown as ReturnType<typeof getChainProvider>);

    vi.mocked(signUnsignedTransaction).mockImplementation(async (params) => ({
      chainId: 'bfmetav2',
      data: params.unsignedTx.data,
      signature: 'sig',
    }));

    const eventPromise = new Promise<CustomEvent<{ confirmed?: boolean; transaction?: Record<string, unknown> }>>((resolve) => {
      const handleEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{ confirmed?: boolean; transaction?: Record<string, unknown> }>;
        if (customEvent.detail?.confirmed !== true) {
          return;
        }
        window.removeEventListener('miniapp-transfer-confirm', handleEvent);
        resolve(customEvent);
      };

      window.addEventListener('miniapp-transfer-confirm', handleEvent);
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
          remark: {
            ex_type: 'exchange.purchase',
            ex_id: 'exchange-001',
          },
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    expect(screen.getByTestId('miniapp-transfer-remark')).toBeInTheDocument();
    expect(screen.getByText('ex_type')).toBeInTheDocument();
    expect(screen.getByText('exchange.purchase')).toBeInTheDocument();
    expect(screen.getByText('ex_id')).toBeInTheDocument();
    expect(screen.getByText('exchange-001')).toBeInTheDocument();

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    await waitFor(() => {
      expect(buildTransaction).toHaveBeenCalledTimes(1);
    });

    expect(buildTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        remark: {
          ex_type: 'exchange.purchase',
          ex_id: 'exchange-001',
        },
      }),
    );

    const event = await eventPromise;
    expect(event.detail.transaction?.remark).toEqual({
      ex_type: 'exchange.purchase',
      ex_id: 'exchange-001',
    });
  });


  it('ignores duplicated unlock submission while transfer is in-flight', async () => {
    vi.mocked(signUnsignedTransaction).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return { chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' };
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));
    fireEvent.click(screen.getByTestId('pattern-lock'));

    await waitFor(() => {
      expect(vi.mocked(signUnsignedTransaction)).toHaveBeenCalledTimes(1);
    });
  });

  it('separates building and broadcasting statuses', async () => {
    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 120));
        return 'tx-hash';
      }),
    } as unknown as ReturnType<typeof getChainProvider>);

    vi.mocked(signUnsignedTransaction).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' };
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    expect(await screen.findByTestId('miniapp-transfer-building-status')).toBeInTheDocument();
    expect(screen.queryByTestId('miniapp-transfer-broadcasting-status')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('miniapp-transfer-broadcasting-status')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('miniapp-transfer-building-status')).not.toBeInTheDocument();
  });

  it('shows broadcast success state and supports close button', async () => {
    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => 'tx-hash'),
    } as unknown as ReturnType<typeof getChainProvider>);

    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    expect(await screen.findByTestId('miniapp-transfer-broadcast-success-status')).toBeInTheDocument();
    const closeButton = screen.getByTestId('miniapp-transfer-success-close');
    expect(closeButton).toBeInTheDocument();
    expect(hoisted.mockPop).not.toHaveBeenCalled();

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(hoisted.mockPop).toHaveBeenCalled();
    });
  });

  it('supports background broadcast and resolves transfer event', async () => {
    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    const eventPromise = new Promise<CustomEvent<{ confirmed?: boolean; txHash?: string }>>((resolve) => {
      const handleEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{ confirmed?: boolean; txHash?: string }>;
        if (customEvent.detail?.confirmed !== true) {
          return;
        }
        window.removeEventListener('miniapp-transfer-confirm', handleEvent);
        resolve(customEvent);
      };

      window.addEventListener('miniapp-transfer-confirm', handleEvent);
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    const initialToastCalls = hoisted.mockToastShow.mock.calls.length;

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    fireEvent.click(await screen.findByTestId('miniapp-transfer-background-broadcast'));

    expect(hoisted.mockPop).toHaveBeenCalled();
    const event = await eventPromise;
    expect(event.detail?.confirmed).toBe(true);
    expect(event.detail?.txHash).toBe('tx-hash');
    await waitFor(() => {
      expect(hoisted.mockToastShow.mock.calls.length).toBeGreaterThanOrEqual(initialToastCalls + 2);
    });
  });

  it('uses toast and exits broadcasting state when background broadcast fails', async () => {
    vi.mocked(getChainProvider).mockImplementation(() => ({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        throw new ChainServiceError(
          ChainErrorCodes.TX_BROADCAST_FAILED,
          'Failed to broadcast transaction',
          undefined,
          new Error('Request timeout'),
        );
      }),
    } as unknown as ReturnType<typeof getChainProvider>));

    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    const eventPromise = new Promise<CustomEvent<{ confirmed?: boolean }>>((resolve) => {
      const handleEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{ confirmed?: boolean }>;
        if (customEvent.detail?.confirmed !== false) {
          return;
        }
        window.removeEventListener('miniapp-transfer-confirm', handleEvent);
        resolve(customEvent);
      };

      window.addEventListener('miniapp-transfer-confirm', handleEvent);
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    const initialToastCalls = hoisted.mockToastShow.mock.calls.length;

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    fireEvent.click(await screen.findByTestId('miniapp-transfer-background-broadcast'));

    const event = await eventPromise;
    expect(event.detail?.confirmed).toBe(false);
    await waitFor(() => {
      expect(hoisted.mockToastShow.mock.calls.length).toBeGreaterThanOrEqual(initialToastCalls + 2);
    });
    expect(screen.queryByTestId('miniapp-transfer-error')).not.toBeInTheDocument();
  });


  it('emits transfer result with the same requestId', async () => {
    const requestId = 'transfer-test-request-id';

    const eventPromise = new Promise<CustomEvent<{ requestId?: string; confirmed?: boolean; txHash?: string }>>((resolve) => {
      const handleEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{ requestId?: string; confirmed?: boolean; txHash?: string }>;
        if (customEvent.detail?.requestId !== requestId) {
          return;
        }
        window.removeEventListener('miniapp-transfer-confirm', handleEvent);
        resolve(customEvent);
      };

      window.addEventListener('miniapp-transfer-confirm', handleEvent);
    });

    render(
      <MiniappTransferConfirmJob
        params={{
          requestId,
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    const event = await eventPromise;
    expect(event.detail?.requestId).toBe(requestId);
    expect(event.detail?.confirmed).toBe(true);
    expect(event.detail?.txHash).toBe('tx-hash');
  });

  it('clones transaction payload to avoid cross-request mutation leaks', async () => {
    const sharedTransaction = {
      signature: 'sig-0',
      senderId: 'b_sender_1',
    } as Record<string, unknown>;

    let signIndex = 0;
    vi.mocked(signUnsignedTransaction).mockImplementation(async () => {
      signIndex += 1;
      sharedTransaction.signature = 'sig-' + signIndex;

      return {
        chainId: 'bfmetav2',
        data: sharedTransaction,
        signature: 'sig-' + signIndex,
      };
    });

    vi.mocked(getChainProvider).mockImplementation(() => ({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async (signedTx: { data: unknown }) => {
        const payload = signedTx.data as { signature?: string };
        return 'tx-hash-' + (payload.signature ?? 'unknown');
      }),
    } as unknown as ReturnType<typeof getChainProvider>));

    const runTransfer = async (requestId: string) => {
      const eventPromise = new Promise<CustomEvent<{
        requestId?: string;
        confirmed?: boolean;
        txHash?: string;
        transaction?: Record<string, unknown>;
      }>>((resolve) => {
        const handleEvent = (event: Event) => {
          const customEvent = event as CustomEvent<{
            requestId?: string;
            confirmed?: boolean;
            txHash?: string;
            transaction?: Record<string, unknown>;
          }>;
          if (customEvent.detail?.requestId !== requestId) {
            return;
          }
          window.removeEventListener('miniapp-transfer-confirm', handleEvent);
          resolve(customEvent);
        };

        window.addEventListener('miniapp-transfer-confirm', handleEvent);
      });

      const view = render(
        <MiniappTransferConfirmJob
          params={{
            requestId,
            appName: 'Org App',
            appIcon: '',
            from: 'b_sender_1',
            to: 'b_receiver_1',
            amount: '1000',
            chain: 'BFMetaV2',
            asset: 'BFM',
          }}
        />,
      );

      const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled();
      });

      fireEvent.click(confirmButton);
      fireEvent.click(screen.getByTestId('pattern-lock'));

      const event = await eventPromise;
      view.unmount();
      return event.detail;
    };

    const first = await runTransfer('transfer-clone-1');
    sharedTransaction.signature = 'sig-mutated-by-second';
    const second = await runTransfer('transfer-clone-2');

    expect(first.confirmed).toBe(true);
    expect(second.confirmed).toBe(true);
    expect(first.transaction).toBeDefined();
    expect(second.transaction).toBeDefined();
    expect(first.transaction).not.toBe(second.transaction);
    expect(first.transaction?.signature).toBe('sig-1');
    expect(second.transaction?.signature).toBe('sig-2');
  });

  it('emits cancel result when sheet unmounts unexpectedly', async () => {
    let rejectBroadcast: ((error: unknown) => void) | undefined;
    const broadcastPromise = new Promise<string>((_resolve, reject) => {
      rejectBroadcast = reject;
    });

    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(() => broadcastPromise),
    } as unknown as ReturnType<typeof getChainProvider>);

    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    const requestId = 'transfer-unmount-case';
    const resultEvents: Array<CustomEvent<{ requestId?: string; confirmed?: boolean }>> = [];
    const closeEvents: Array<CustomEvent<{ requestId?: string; reason?: string }>> = [];

    const handleResultEvent = (event: Event) => {
      resultEvents.push(event as CustomEvent<{ requestId?: string; confirmed?: boolean }>);
    };
    const handleCloseEvent = (event: Event) => {
      closeEvents.push(event as CustomEvent<{ requestId?: string; reason?: string }>);
    };

    window.addEventListener('miniapp-transfer-confirm', handleResultEvent);
    window.addEventListener('miniapp-transfer-sheet-closed', handleCloseEvent);

    const { unmount } = render(
      <MiniappTransferConfirmJob
        params={{
          requestId,
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    await waitFor(() => {
      expect(vi.mocked(signUnsignedTransaction)).toHaveBeenCalled();
    });

    unmount();

    rejectBroadcast?.(
      new ChainServiceError(
        ChainErrorCodes.TX_BROADCAST_FAILED,
        'Failed to broadcast transaction',
        undefined,
        new Error('Request timeout'),
      ),
    );

    await waitFor(() => {
      expect(
        resultEvents.some((event) => event.detail?.requestId === requestId && event.detail?.confirmed === false),
      ).toBe(true);
    });

    await waitFor(() => {
      expect(
        closeEvents.some((event) => event.detail?.requestId === requestId && event.detail?.reason === 'cancel'),
      ).toBe(true);
    });

    window.removeEventListener('miniapp-transfer-confirm', handleResultEvent);
    window.removeEventListener('miniapp-transfer-sheet-closed', handleCloseEvent);
  });

  it('leaves broadcasting step when broadcast fails', async () => {
    vi.mocked(getChainProvider).mockReturnValueOnce({
      supportsFullTransaction: true,
      buildTransaction: vi.fn(async (intent: unknown) => ({
        chainId: 'bfmetav2',
        intentType: 'transfer',
        data: intent,
      })),
      signTransaction: vi.fn(),
      broadcastTransaction: vi.fn(async () => {
        throw new ChainServiceError(
          ChainErrorCodes.TX_BROADCAST_FAILED,
          'Failed to broadcast transaction',
          undefined,
          new Error('Request timeout'),
        );
      }),
    } as unknown as ReturnType<typeof getChainProvider>);

    vi.mocked(signUnsignedTransaction).mockResolvedValue({ chainId: 'bfmetav2', data: { tx: '1' }, signature: 'sig' });

    render(
      <MiniappTransferConfirmJob
        params={{
          appName: 'Org App',
          appIcon: '',
          from: 'b_sender_1',
          to: 'b_receiver_1',
          amount: '1000',
          chain: 'BFMetaV2',
          asset: 'BFM',
        }}
      />,
    );

    const confirmButton = screen.getByTestId('miniapp-transfer-review-confirm');
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByTestId('pattern-lock'));

    expect(await screen.findByTestId('miniapp-transfer-error')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId('miniapp-transfer-broadcasting-status')).not.toBeInTheDocument();
    });
  });
});
