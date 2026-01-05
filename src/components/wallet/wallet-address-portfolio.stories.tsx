import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactRenderer } from '@storybook/react';
import type { DecoratorFunction } from 'storybook/internal/types';
import { useEffect, useState } from 'react';
import { expect, waitFor, within } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletAddressPortfolioView } from './wallet-address-portfolio-view';
import { WalletAddressPortfolioFromProvider } from './wallet-address-portfolio-from-provider';
import { chainConfigActions, chainConfigStore } from '@/stores/chain-config';
import { clearProviderCache } from '@/services/chain-adapter';
import { Amount } from '@/types/amount';
import type { TokenInfo } from '@/components/token/token-item';
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item';

const mockTokens: TokenInfo[] = [
  { symbol: 'BFT', name: 'BFT', balance: '1234.56789012', decimals: 8, chain: 'bfmeta' },
  { symbol: 'USDT', name: 'USDT', balance: '500.00000000', decimals: 8, chain: 'bfmeta' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.00123456', decimals: 8, chain: 'bfmeta' },
];

const mockTransactions: TransactionInfo[] = [
  {
    id: 'tx1',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('100000000', 8, 'BFT'),
    symbol: 'BFT',
    address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
    timestamp: new Date(Date.now() - 3600000),
    chain: 'bfmeta',
  },
  {
    id: 'tx2',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('50000000', 8, 'BFT'),
    symbol: 'BFT',
    address: 'bAnotherAddress1234567890abcdef',
    timestamp: new Date(Date.now() - 86400000),
    chain: 'bfmeta',
  },
];

function ChainConfigProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        clearProviderCache();
        await chainConfigActions.initialize();

        if (!mounted) return;

        const state = chainConfigStore.state;
        if (state.error) {
          setError(state.error);
          setStatus('error');
        } else if (state.snapshot) {
          setStatus('ready');
        } else {
          setError('No chain config snapshot after initialization');
          setStatus('error');
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'error') {
    return (
      <div data-testid="chain-config-error" className="flex h-96 items-center justify-center p-4">
        <div className="text-destructive text-center">
          <p className="font-medium">Chain config initialization failed</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div data-testid="chain-config-loading" className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p>Loading chain configuration...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

const withChainConfig: DecoratorFunction<ReactRenderer> = (Story) => (
  <QueryClientProvider client={createQueryClient()}>
    <ChainConfigProvider>
      <div className="bg-background mx-auto min-h-screen max-w-md">
        <Story />
      </div>
    </ChainConfigProvider>
  </QueryClientProvider>
);

const meta = {
  title: 'Wallet/WalletAddressPortfolio',
  component: WalletAddressPortfolioView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WalletAddressPortfolioView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: mockTokens,
    transactions: mockTransactions,
  },
};

export const Loading: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: [],
    tokensLoading: true,
    transactionsLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      const portfolio = canvas.getByTestId('wallet-address-portfolio');
      expect(portfolio).toBeVisible();

      const pulsingElements = portfolio.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  },
};

export const Empty: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      const emptyState = canvas.getByTestId('wallet-address-portfolio-token-list-empty');
      expect(emptyState).toBeVisible();
    });
  },
};

export const RealDataBfmeta: Story = {
  name: 'Real Data: biochain-bfmeta',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real token balances and transactions from BFMeta chain using the actual chainProvider API.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="bfmeta"
      address="bCfAynSAKhzgKLi3BXyuh5k22GctLR72j"
      chainName="BFMeta"
      testId="bfmeta-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('bfmeta-portfolio');
        expect(portfolio).toBeVisible();

        const tokenList = canvas.queryByTestId('bfmeta-portfolio-token-list');
        const tokenEmpty = canvas.queryByTestId('bfmeta-portfolio-token-list-empty');
        expect(tokenList || tokenEmpty).not.toBeNull();

        const txList = canvas.queryByTestId('bfmeta-portfolio-transaction-list');
        const txEmpty = canvas.queryByTestId('bfmeta-portfolio-transaction-list-empty');
        expect(txList || txEmpty).not.toBeNull();
      },
      { timeout: 12000 },
    );
  },
};

export const RealDataEthereum: Story = {
  name: 'Real Data: eth-eth',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real token balances and transactions from Ethereum mainnet using blockscout API.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="ethereum"
      address="0x75a6F48BF634868b2980c97CcEf467A127597e08"
      chainName="Ethereum"
      testId="ethereum-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('ethereum-portfolio');
        expect(portfolio).toBeVisible();

        const tokenList = canvas.queryByTestId('ethereum-portfolio-token-list');
        const tokenEmpty = canvas.queryByTestId('ethereum-portfolio-token-list-empty');
        expect(tokenList || tokenEmpty).not.toBeNull();

        const txList = canvas.queryByTestId('ethereum-portfolio-transaction-list');
        const txEmpty = canvas.queryByTestId('ethereum-portfolio-transaction-list-empty');
        expect(txList || txEmpty).not.toBeNull();
      },
      { timeout: 12000 },
    );
  },
};
