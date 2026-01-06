import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactRenderer } from '@storybook/react';
import type { DecoratorFunction } from 'storybook/internal/types';
import { useEffect, useState } from 'react';
import { expect, waitFor, within } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletAddressPortfolioView } from './wallet-address-portfolio-view';
import { WalletAddressPortfolioFromProvider } from './wallet-address-portfolio-from-provider';
import { chainConfigActions, chainConfigStore, useChainConfigState } from '@/stores/chain-config';
import { clearProviderCache } from '@/services/chain-adapter';
import { Amount } from '@/types/amount';
import type { TokenInfo } from '@/components/token/token-item';
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item';
import type { ChainConfig } from '@/services/chain-config';

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
  const state = useChainConfigState();
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    if (!initStarted && !state.snapshot && !state.isLoading) {
      setInitStarted(true);
      clearProviderCache();
      chainConfigActions.initialize();
    }
  }, [initStarted, state.snapshot, state.isLoading]);

  if (state.error) {
    return (
      <div data-testid="chain-config-error" className="flex h-96 items-center justify-center p-4">
        <div className="text-destructive text-center">
          <p className="font-medium">Chain config error</p>
          <p className="text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  if (!state.snapshot) {
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

const REAL_ADDRESSES = {
  ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  binance: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
} as const;

const COMPARE_CHAIN_CONFIGS: ChainConfig[] = [
  {
    id: 'ethereum-blockscout-first',
    version: '1.0',
    chainKind: 'evm',
    name: 'Ethereum (blockscout first)',
    symbol: 'ETH',
    icon: '../icons/ethereum/chain.svg',
    decimals: 18,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'blockscout-v1', endpoint: 'https://eth.blockscout.com/api' },
      { type: 'ethereum-rpc', endpoint: 'https://ethereum-rpc.publicnode.com' },
      { type: 'ethwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/eth' },
    ],
  },
  {
    id: 'ethereum-ethwallet-first',
    version: '1.0',
    chainKind: 'evm',
    name: 'Ethereum (ethwallet first)',
    symbol: 'ETH',
    icon: '../icons/ethereum/chain.svg',
    decimals: 18,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'ethwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/eth' },
      { type: 'blockscout-v1', endpoint: 'https://eth.blockscout.com/api' },
      { type: 'ethereum-rpc', endpoint: 'https://ethereum-rpc.publicnode.com' },
    ],
  },

  {
    id: 'tron-rpc-first',
    version: '1.0',
    chainKind: 'tron',
    name: 'Tron (rpc first)',
    symbol: 'TRX',
    icon: '../icons/tron/chain.svg',
    decimals: 6,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'tron-rpc', endpoint: 'https://api.trongrid.io' },
      { type: 'tron-rpc-pro', endpoint: 'https://api.trongrid.io', config: { apiKeyEnv: 'VITE_TRONGRID_API_KEY' } },
      { type: 'tronwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/tron' },
    ],
  },
  {
    id: 'tron-tronwallet-first',
    version: '1.0',
    chainKind: 'tron',
    name: 'Tron (tronwallet first)',
    symbol: 'TRX',
    icon: '../icons/tron/chain.svg',
    decimals: 6,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'tronwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/tron' },
      { type: 'tron-rpc', endpoint: 'https://api.trongrid.io' },
      { type: 'tron-rpc-pro', endpoint: 'https://api.trongrid.io', config: { apiKeyEnv: 'VITE_TRONGRID_API_KEY' } },
    ],
  },

  {
    id: 'bitcoin-mempool-first',
    version: '1.0',
    chainKind: 'bitcoin',
    name: 'Bitcoin (mempool first)',
    symbol: 'BTC',
    icon: '../icons/bitcoin/chain.svg',
    decimals: 8,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'mempool-v1', endpoint: 'https://mempool.space/api' },
      { type: 'btcwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/btc/blockbook' },
    ],
  },
  {
    id: 'bitcoin-btcwallet-first',
    version: '1.0',
    chainKind: 'bitcoin',
    name: 'Bitcoin (btcwallet first)',
    symbol: 'BTC',
    icon: '../icons/bitcoin/chain.svg',
    decimals: 8,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'btcwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/btc/blockbook' },
      { type: 'mempool-v1', endpoint: 'https://mempool.space/api' },
    ],
  },

  {
    id: 'binance-bsc-rpc-first',
    version: '1.0',
    chainKind: 'evm',
    name: 'BNB Smart Chain (rpc first)',
    symbol: 'BNB',
    icon: '../icons/binance/chain.svg',
    decimals: 18,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'bsc-rpc', endpoint: 'https://bsc-rpc.publicnode.com' },
      { type: 'bscwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/bsc' },
    ],
  },
  {
    id: 'binance-bscwallet-first',
    version: '1.0',
    chainKind: 'evm',
    name: 'BNB Smart Chain (bscwallet first)',
    symbol: 'BNB',
    icon: '../icons/binance/chain.svg',
    decimals: 18,
    enabled: true,
    source: 'manual',
    apis: [
      { type: 'bscwallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/bsc' },
      { type: 'bsc-rpc', endpoint: 'https://bsc-rpc.publicnode.com' },
    ],
  },
];

function mergeConfigsById(existing: ChainConfig[], injected: ChainConfig[]): ChainConfig[] {
  const byId = new Map<string, ChainConfig>();
  for (const config of existing) {
    byId.set(config.id, config);
  }
  for (const config of injected) {
    byId.set(config.id, config);
  }
  return [...byId.values()];
}

function CompareConfigInjector() {
  const state = useChainConfigState();
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    if (!state.snapshot) return;
    if (injected) return;
    const alreadyInjected = state.snapshot.configs.some((c) => c.id === 'ethereum-blockscout-first');
    if (alreadyInjected) {
      setInjected(true);
      return;
    }

    chainConfigStore.setState((prev) => {
      if (!prev.snapshot) return prev;
      return {
        ...prev,
        snapshot: {
          ...prev.snapshot,
          configs: mergeConfigsById(prev.snapshot.configs, COMPARE_CHAIN_CONFIGS),
        },
      };
    });

    clearProviderCache();
    setInjected(true);
  }, [state.snapshot, injected]);

  return null;
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

const withCompareChainConfig: DecoratorFunction<ReactRenderer> = (Story) => (
  <QueryClientProvider client={createQueryClient()}>
    <ChainConfigProvider>
      <CompareConfigInjector />
      <div className="bg-background mx-auto min-h-screen max-w-6xl">
        <Story />
      </div>
    </ChainConfigProvider>
  </QueryClientProvider>
);

function hasPositiveNumber(text: string): boolean {
  const matches = text.match(/\d+(?:\.\d+)?/g);
  if (!matches) return false;
  for (const value of matches) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return true;
  }
  return false;
}

async function verifyNonEmptyAssetsAndHistory(canvas: ReturnType<typeof within>, testId: string): Promise<void> {
  await waitFor(
    () => {
      const portfolio = canvas.getByTestId(testId);
      expect(portfolio).toBeVisible();
    },
    { timeout: 25_000 },
  );

  await waitFor(
    () => {
      const tokenList = canvas.queryByTestId(`${testId}-token-list`);
      expect(tokenList).not.toBeNull();
      const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]') ?? [];
      expect(tokenItems.length).toBeGreaterThan(0);
      const tokenText = tokenItems[0]?.textContent ?? '';
      expect(hasPositiveNumber(tokenText)).toBe(true);
    },
    { timeout: 25_000 },
  );

  const historyTab = canvas.getByTestId(`${testId}-tabs-tab-history`);
  historyTab.click();

  await waitFor(
    () => {
      const txList = canvas.queryByTestId(`${testId}-transaction-list`);
      expect(txList).not.toBeNull();
    },
    { timeout: 25_000 },
  );
}

async function expectAnyProviderPanelOk(options: {
  canvas: ReturnType<typeof within>;
  label: string;
  testIds: string[];
}): Promise<void> {
  const errors: string[] = [];
  for (const testId of options.testIds) {
    try {
      await verifyNonEmptyAssetsAndHistory(options.canvas, testId);
      return;
    } catch (error) {
      errors.push(`${testId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`No provider panel returned non-empty data for ${options.label}. Details: ${errors.join(' | ')}`);
}

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

    // Wait for data to load - check component renders without error
    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('bfmeta-portfolio');
        expect(portfolio).toBeVisible();

        // Check loading finished (either has tokens, empty state, or loading skeleton stopped)
        const tokenList = canvas.queryByTestId('bfmeta-portfolio-token-list');
        const tokenEmpty = canvas.queryByTestId('bfmeta-portfolio-token-list-empty');
        const loading = portfolio.querySelector('.animate-pulse');

        // Should have either: token list, empty state, or still loading
        expect(tokenList || tokenEmpty || loading).not.toBeNull();

        // If token list exists, verify it has items
        if (tokenList) {
          const tokenItems = tokenList.querySelectorAll('[data-testid^="token-item-"]');
          expect(tokenItems.length).toBeGreaterThan(0);
        }
      },
      { timeout: 15000 },
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
        story:
          'Fetches real token balances and transactions from Ethereum mainnet using blockscout API. Uses Vitalik address for real ETH transfers.',
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

        // Verify token list exists with actual tokens
        const tokenList = canvas.queryByTestId('ethereum-portfolio-token-list');
        expect(tokenList).not.toBeNull();

        const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
        expect(tokenItems?.length).toBeGreaterThan(0);
      },
      { timeout: 15000 },
    );
  },
};

export const RealDataBitcoin: Story = {
  name: 'Real Data: bitcoin',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real balance and transactions from Bitcoin mainnet using mempool.space API.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="bitcoin"
      address="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
      chainName="Bitcoin"
      testId="bitcoin-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('bitcoin-portfolio');
        expect(portfolio).toBeVisible();

        // Verify token list exists with BTC balance
        const tokenList = canvas.queryByTestId('bitcoin-portfolio-token-list');
        expect(tokenList).not.toBeNull();

        const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
        expect(tokenItems?.length).toBeGreaterThan(0);
      },
      { timeout: 15000 },
    );
  },
};

export const RealDataTron: Story = {
  name: 'Real Data: tron',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real balance and transactions from Tron mainnet using TronGrid API.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="tron"
      address="TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"
      chainName="Tron"
      testId="tron-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('tron-portfolio');
        expect(portfolio).toBeVisible();

        // Verify token list exists with TRX balance
        const tokenList = canvas.queryByTestId('tron-portfolio-token-list');
        expect(tokenList).not.toBeNull();

        const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
        expect(tokenItems?.length).toBeGreaterThan(0);
      },
      { timeout: 15000 },
    );
  },
};

export const RealDataBinance: Story = {
  name: 'Real Data: binance',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real BNB balance from BSC mainnet using public RPC.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="binance"
      address="0x8894E0a0c962CB723c1976a4421c95949bE2D4E3"
      chainName="BNB Smart Chain"
      testId="binance-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const portfolio = canvas.getByTestId('binance-portfolio');
        expect(portfolio).toBeVisible();

        // Verify token list exists with BNB balance
        const tokenList = canvas.queryByTestId('binance-portfolio-token-list');
        expect(tokenList).not.toBeNull();

        const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
        expect(tokenItems?.length).toBeGreaterThan(0);
      },
      { timeout: 15000 },
    );
  },
};

export const CompareProviders: Story = {
  name: 'Compare Providers (Real Data)',
  decorators: [withCompareChainConfig],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Side-by-side comparison: each panel includes all supported providers but with different apis[] order, to compare rendering differences.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Ethereum</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WalletAddressPortfolioFromProvider
            chainId="ethereum-blockscout-first"
            address={REAL_ADDRESSES.ethereum}
            chainName="Ethereum (blockscout first)"
            testId="cmp-ethereum-blockscout"
          />
          <WalletAddressPortfolioFromProvider
            chainId="ethereum-ethwallet-first"
            address={REAL_ADDRESSES.ethereum}
            chainName="Ethereum (ethwallet first)"
            testId="cmp-ethereum-ethwallet"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tron</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WalletAddressPortfolioFromProvider
            chainId="tron-rpc-first"
            address={REAL_ADDRESSES.tron}
            chainName="Tron (rpc first)"
            testId="cmp-tron-rpc"
          />
          <WalletAddressPortfolioFromProvider
            chainId="tron-tronwallet-first"
            address={REAL_ADDRESSES.tron}
            chainName="Tron (tronwallet first)"
            testId="cmp-tron-tronwallet"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Bitcoin</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WalletAddressPortfolioFromProvider
            chainId="bitcoin-mempool-first"
            address={REAL_ADDRESSES.bitcoin}
            chainName="Bitcoin (mempool first)"
            testId="cmp-bitcoin-mempool"
          />
          <WalletAddressPortfolioFromProvider
            chainId="bitcoin-btcwallet-first"
            address={REAL_ADDRESSES.bitcoin}
            chainName="Bitcoin (btcwallet first)"
            testId="cmp-bitcoin-btcwallet"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">BNB Smart Chain</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WalletAddressPortfolioFromProvider
            chainId="binance-bsc-rpc-first"
            address={REAL_ADDRESSES.binance}
            chainName="BNB Smart Chain (rpc first)"
            testId="cmp-binance-rpc"
          />
          <WalletAddressPortfolioFromProvider
            chainId="binance-bscwallet-first"
            address={REAL_ADDRESSES.binance}
            chainName="BNB Smart Chain (bscwallet first)"
            testId="cmp-binance-bscwallet"
          />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Storybook's Vitest runner has a default 15s timeout and runs in MODE=test.
    // Keep this story lightweight in automated Storybook tests; enforce real-network assertions in Storybook UI.
    if (import.meta.env.MODE === 'test') {
      await waitFor(
        () => {
          expect(canvas.getByTestId('cmp-ethereum-blockscout')).toBeVisible();
          expect(canvas.getByTestId('cmp-ethereum-ethwallet')).toBeVisible();
          expect(canvas.getByTestId('cmp-tron-rpc')).toBeVisible();
          expect(canvas.getByTestId('cmp-tron-tronwallet')).toBeVisible();
          expect(canvas.getByTestId('cmp-bitcoin-mempool')).toBeVisible();
          expect(canvas.getByTestId('cmp-bitcoin-btcwallet')).toBeVisible();
          expect(canvas.getByTestId('cmp-binance-rpc')).toBeVisible();
          expect(canvas.getByTestId('cmp-binance-bscwallet')).toBeVisible();
        },
        { timeout: 10_000 },
      );
      return;
    }

    await expectAnyProviderPanelOk({
      canvas,
      label: 'ethereum',
      testIds: ['cmp-ethereum-blockscout', 'cmp-ethereum-ethwallet'],
    });

    await expectAnyProviderPanelOk({
      canvas,
      label: 'tron',
      testIds: ['cmp-tron-rpc', 'cmp-tron-tronwallet'],
    });

    await expectAnyProviderPanelOk({
      canvas,
      label: 'bitcoin',
      testIds: ['cmp-bitcoin-mempool', 'cmp-bitcoin-btcwallet'],
    });

    await expectAnyProviderPanelOk({
      canvas,
      label: 'binance',
      testIds: ['cmp-binance-rpc', 'cmp-binance-bscwallet'],
    });
  },
};
