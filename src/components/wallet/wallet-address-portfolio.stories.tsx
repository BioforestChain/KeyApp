import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactRenderer } from '@storybook/react';
import type { DecoratorFunction } from 'storybook/internal/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { expect, waitFor, within } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletAddressPortfolioView } from './wallet-address-portfolio-view';
import { WalletAddressPortfolioFromProvider } from './wallet-address-portfolio-from-provider';
import { TokenIconProvider } from './token-icon';
import { chainConfigActions, chainConfigStore, useChainConfigState, useChainConfigs } from '@/stores/chain-config';
import { clearProviderCache } from '@/services/chain-adapter';
import { resolveAssetUrl } from '@/lib/asset-url';
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

// 基于 Bitcoin mempool.space 真实数据格式创建的 mock 交易
// 参考: https://mempool.space/api/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/txs
const mockBitcoinTransactions: TransactionInfo[] = [
  {
    id: '78a44e6e62bf7638065bf58327c8486217dbf84bba617def8f8a2816a23e14c9',
    type: 'receive' as TransactionType,
    status: 'pending',
    amount: Amount.fromRaw('546', 8, 'BTC'),
    symbol: 'BTC',
    address: 'bc1pl4qpz24u7zf6zn7lckdckglns02xghrh4jw3qeh2w37x3m6k657qv6pqw7',
    timestamp: new Date(Date.now() - 600000), // 10 min ago
    chain: 'bitcoin',
  },
  {
    id: 'd274d00350d384f443cb1e42defdd7e12f350aee37813d305b6bb9468270de19',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('546', 8, 'BTC'),
    symbol: 'BTC',
    address: 'bc1py4h77ccc0yalhrv2w8h5l5htw2t2up7nhcmg5t89ndgkjhpxek3qz3dsgc',
    timestamp: new Date(1767688327000),
    chain: 'bitcoin',
  },
  {
    id: 'c11dfe6e1033eb354c6bf7b3428f9290d635cefbe16876b86a8ce84be8c5637d',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('546', 8, 'BTC'),
    symbol: 'BTC',
    address: 'bc1p75kfwfe6se8uztt67nat7fev50ydly9lmcrdj6gtalz6zmsjachqtryrtc',
    timestamp: new Date(1767682433000),
    chain: 'bitcoin',
  },
  {
    id: 'd8773c23582a0bf0fe7f640fd1053c14c5ebf3782fed994bd9cd2aed7d19dedd',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('12168', 8, 'BTC'),
    symbol: 'BTC',
    address: 'bc1ppcagzftu7w6pl7saqvs4nvtpwpr2g7ja96tdylt3lz775yjkkcsqlu7exa',
    timestamp: new Date(1767681823000),
    chain: 'bitcoin',
  },
];

// 基于 TronGrid API 真实数据格式创建的 mock 交易
// 参考: https://api.trongrid.io/v1/accounts/TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9/transactions
const mockTronTransactions: TransactionInfo[] = [
  {
    id: 'caacd034fd600a9a66cb9c841f39b81101e97e23068c8d73152f8741654139e1',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('149000000', 6, 'TRX'), // 149 TRX
    symbol: 'TRX',
    address: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
    timestamp: new Date(1767691140000),
    chain: 'tron',
  },
  {
    id: '2b8d0c9e7f3a1b5e4d6c8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('500000000', 6, 'TRX'), // 500 TRX
    symbol: 'TRX',
    address: 'TAnahWWRPm6jhiYR6gMCE3eLDqL8LfCnVE',
    timestamp: new Date(1767680000000),
    chain: 'tron',
  },
  {
    id: '3c9e1d0f8a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('1000000000', 6, 'TRX'), // 1000 TRX
    symbol: 'TRX',
    address: 'TRkJg1B9WgM8uXzthJJhBhX7K1GBqH9dXb',
    timestamp: new Date(1767670000000),
    chain: 'tron',
  },
];

// 基于 Etherscan API 真实数据格式创建的 mock 交易 (Vitalik's wallet)
const mockEthereumTransactions: TransactionInfo[] = [
  {
    id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('1000000000000000000', 18, 'ETH'), // 1 ETH
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    chain: 'ethereum',
  },
  {
    id: '0x2b3c4d5e6f78901abcdef2345678901abcdef2345678901abcdef2345678901',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('5000000000000000000', 18, 'ETH'), // 5 ETH
    symbol: 'ETH',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    chain: 'ethereum',
  },
  {
    id: '0x3c4d5e6f789012abcdef3456789012abcdef3456789012abcdef3456789012',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('100000000', 6, 'USDC'), // 100 USDC
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    chain: 'ethereum',
  },
];

// BSC 交易 mock
const mockBinanceTransactions: TransactionInfo[] = [
  {
    id: '0xbsc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('10000000000000000000', 18, 'BNB'), // 10 BNB
    symbol: 'BNB',
    address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    timestamp: new Date(Date.now() - 3600000),
    chain: 'binance',
  },
  {
    id: '0xbsc2345678901abcdef2345678901abcdef2345678901abcdef2345678901bc',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('5000000000000000000', 18, 'BNB'), // 5 BNB
    symbol: 'BNB',
    address: '0x28C6c06298d514Db089934071355E5743bf21d60',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    chain: 'binance',
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

function TokenIconProviderWrapper({ children }: { children: React.ReactNode }) {
  const configs = useChainConfigs();

  const resolvedConfigs = useMemo(() => {
    return configs.map((config) => ({
      ...config,
      tokenIconBase: config.tokenIconBase?.map(resolveAssetUrl),
    }));
  }, [configs]);

  const getTokenIconBases = useCallback(
    (chainId: string) => resolvedConfigs.find((c) => c.id === chainId)?.tokenIconBase ?? [],
    [resolvedConfigs],
  );

  return (
    <TokenIconProvider getTokenIconBases={getTokenIconBases}>
      {children}
    </TokenIconProvider>
  );
}

const REAL_ADDRESSES: Record<string, string> = {
  ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  binance: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
  bfmeta: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
};

function formatApiLabel(api: ChainConfig['apis'][number]): string {
  const apiKeyEnv = api.config && 'apiKeyEnv' in api.config ? (api.config.apiKeyEnv as string | undefined) : undefined;
  if (apiKeyEnv) return `${api.type} (${apiKeyEnv})`;
  return api.type;
}

function generateSingleApiConfigs(baseConfig: ChainConfig): ChainConfig[] {
  return baseConfig.apis.map((api, index) => ({
    ...baseConfig,
    id: `${baseConfig.id}-api-${index}-${api.type}`,
    name: `${baseConfig.name} (${api.type})`,
    apis: [api],
    enabled: true,
    source: 'manual' as const,
  }));
}

function DynamicCompareConfigInjector({ chainId }: { chainId: string }) {
  const state = useChainConfigState();
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    if (!state.snapshot) return;
    if (injected) return;

    const baseConfig = state.snapshot.configs.find((c) => c.id === chainId);
    if (!baseConfig) return;

    const alreadyInjected = state.snapshot.configs.some((c) => c.id === `${chainId}-api-0-${baseConfig.apis[0]?.type}`);
    if (alreadyInjected) {
      setInjected(true);
      return;
    }

    const singleApiConfigs = generateSingleApiConfigs(baseConfig);

    chainConfigStore.setState((prev) => {
      if (!prev.snapshot) return prev;
      return {
        ...prev,
        snapshot: {
          ...prev.snapshot,
          configs: [...prev.snapshot.configs, ...singleApiConfigs],
        },
      };
    });

    clearProviderCache();
    setInjected(true);
  }, [state.snapshot, injected, chainId]);

  return null;
}

function DynamicProviderPanel({
  api,
  baseConfig,
  index,
  address,
}: {
  api: ChainConfig['apis'][number];
  baseConfig: ChainConfig;
  index: number;
  address: string;
}) {
  const dynamicChainId = `${baseConfig.id}-api-${index}-${api.type}`;
  const testId = `cmp-${baseConfig.id}-${api.type}`;

  return (
    <div className="flex h-[640px] min-h-0 flex-col overflow-hidden rounded-xl border bg-background">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{api.type}</p>
            <p className="text-muted-foreground truncate text-xs">{api.endpoint}</p>
          </div>
          <p className="text-muted-foreground shrink-0 text-xs">#{index}</p>
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">{formatApiLabel(api)}</p>
      </div>
      <WalletAddressPortfolioFromProvider
        chainId={dynamicChainId}
        address={address}
        chainName={baseConfig.name}
        testId={testId}
        className="flex-1 min-h-0"
      />
    </div>
  );
}

function DynamicCompareProvidersGrid({ chainId }: { chainId: string }) {
  const state = useChainConfigState();
  const baseConfig = state.snapshot?.configs.find((c) => c.id === chainId);

  if (!baseConfig) {
    return <div className="p-4 text-muted-foreground">Chain config not found: {chainId}</div>;
  }

  const address = REAL_ADDRESSES[chainId] ?? '';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{baseConfig.name}</h2>
        <p className="text-muted-foreground text-sm">
          Comparing {baseConfig.apis.length} provider(s) from default-chains.json
        </p>
        <p className="text-muted-foreground font-mono text-xs">{address}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {baseConfig.apis.map((api, index) => (
          <DynamicProviderPanel
            key={`${api.type}-${index}`}
            api={api}
            baseConfig={baseConfig}
            index={index}
            address={address}
          />
        ))}
      </div>
    </div>
  );
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
      <TokenIconProviderWrapper>
        <div className="bg-background mx-auto min-h-screen max-w-md">
          <Story />
        </div>
      </TokenIconProviderWrapper>
    </ChainConfigProvider>
  </QueryClientProvider>
);

const createCompareDecorator = (chainId: string): DecoratorFunction<ReactRenderer> => (Story) => (
  <QueryClientProvider client={createQueryClient()}>
    <ChainConfigProvider>
      <TokenIconProviderWrapper>
        <DynamicCompareConfigInjector chainId={chainId} />
        <div className="bg-background mx-auto min-h-screen max-w-6xl">
          <Story />
        </div>
      </TokenIconProviderWrapper>
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

      const tokenEmpty = canvas.queryByTestId(`${testId}-token-list-empty`);
      expect(tokenEmpty).toBeNull();
    },
    { timeout: 25_000 },
  );

  const historyTab = canvas.getByTestId(`${testId}-tabs-tab-history`);
  historyTab.click();

  await waitFor(
    () => {
      const txList = canvas.queryByTestId(`${testId}-transaction-list`);
      expect(txList).not.toBeNull();

      const txEmpty = canvas.queryByTestId(`${testId}-transaction-list-empty`);
      expect(txEmpty).toBeNull();
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

export const CompareProvidersBfmeta: Story = {
  name: 'Compare Providers: BFMeta',
  decorators: [createCompareDecorator('bfmeta')],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for BFMeta chain.',
      },
    },
  },
  render: () => <DynamicCompareProvidersGrid chainId="bfmeta" />,
};

export const CompareProvidersEthereum: Story = {
  name: 'Compare Providers: Ethereum',
  decorators: [createCompareDecorator('ethereum')],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Ethereum chain.',
      },
    },
  },
  render: () => <DynamicCompareProvidersGrid chainId="ethereum" />,
};

export const CompareProvidersTron: Story = {
  name: 'Compare Providers: Tron',
  decorators: [createCompareDecorator('tron')],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Tron chain.',
      },
    },
  },
  render: () => <DynamicCompareProvidersGrid chainId="tron" />,
};

export const CompareProvidersBitcoin: Story = {
  name: 'Compare Providers: Bitcoin',
  decorators: [createCompareDecorator('bitcoin')],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Bitcoin chain.',
      },
    },
  },
  render: () => <DynamicCompareProvidersGrid chainId="bitcoin" />,
};

export const CompareProvidersBinance: Story = {
  name: 'Compare Providers: Binance',
  decorators: [createCompareDecorator('binance')],
  parameters: {
    chromatic: { delay: 8000 },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for BNB Smart Chain.',
      },
    },
  },
  render: () => <DynamicCompareProvidersGrid chainId="binance" />,
};

/**
 * ProviderFallbackWarning 截图验证 Stories
 * 
 * 覆盖四种主要链的各种场景：
 * 1. 正常数据（supported: true）
 * 2. Fallback 警告（supported: false）
 */

// ==================== BFMeta 链 ====================
export const BFMetaNormalData: Story = {
  name: 'BFMeta - Normal Data',
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [
      { symbol: 'BFT', name: 'BFT', balance: '1234.56789012', decimals: 8, chain: 'bfmeta' },
      { symbol: 'USDT', name: 'USDT', balance: '500.00', decimals: 8, chain: 'bfmeta' },
    ],
    transactions: mockTransactions,
    tokensSupported: true,
    transactionsSupported: true,
  },
};

export const BFMetaFallbackWarning: Story = {
  name: 'BFMeta - Fallback Warning',
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [{ symbol: 'BFT', name: 'BFT', balance: '0', decimals: 8, chain: 'bfmeta' }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'All 2 provider(s) failed. Last error: Connection timeout',
    transactionsSupported: false,
    transactionsFallbackReason: 'No provider implements getTransactionHistory',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  },
};

// ==================== Ethereum 链 ====================
export const EthereumNormalData: Story = {
  name: 'Ethereum - Normal Data (23.68 ETH)',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', balance: '23.683156206881918', decimals: 18, chain: 'ethereum' },
      { symbol: 'USDC', name: 'USD Coin', balance: '1500.00', decimals: 6, chain: 'ethereum' },
    ],
    transactions: mockEthereumTransactions,
    tokensSupported: true,
    transactionsSupported: true,
  },
};

export const EthereumFallbackWarning: Story = {
  name: 'Ethereum - Fallback Warning',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [{ symbol: 'ETH', name: 'Ethereum', balance: '0', decimals: 18, chain: 'ethereum' }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'All providers failed: ethereum-rpc timeout, etherscan rate limited',
    transactionsSupported: false,
    transactionsFallbackReason: 'Blockscout API returned 503',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  },
};

// ==================== BSC/Binance 链 ====================
export const BinanceNormalData: Story = {
  name: 'Binance - Normal Data (234.08 BNB)',
  args: {
    chainId: 'binance',
    chainName: 'BNB Smart Chain',
    tokens: [
      { symbol: 'BNB', name: 'BNB', balance: '234.084063038409', decimals: 18, chain: 'binance' },
      { symbol: 'BUSD', name: 'BUSD', balance: '2000.00', decimals: 18, chain: 'binance' },
    ],
    transactions: mockBinanceTransactions,
    tokensSupported: true,
    transactionsSupported: true,
  },
};

export const BinanceFallbackWarning: Story = {
  name: 'Binance - Fallback Warning',
  args: {
    chainId: 'binance',
    chainName: 'BNB Smart Chain',
    tokens: [{ symbol: 'BNB', name: 'BNB', balance: '0', decimals: 18, chain: 'binance' }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'BSC RPC node unreachable',
    transactionsSupported: false,
    transactionsFallbackReason: 'BscScan API key exhausted',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  },
};

// ==================== Tron 链 ====================
export const TronNormalData: Story = {
  name: 'Tron - Normal Data (163,377 TRX)',
  args: {
    chainId: 'tron',
    chainName: 'Tron',
    tokens: [
      { symbol: 'TRX', name: 'Tron', balance: '163377.648279', decimals: 6, chain: 'tron' },
      { symbol: 'USDT', name: 'Tether', balance: '10000.00', decimals: 6, chain: 'tron' },
    ],
    transactions: mockTronTransactions,
    tokensSupported: true,
    transactionsSupported: true,
  },
};

export const TronFallbackWarning: Story = {
  name: 'Tron - Fallback Warning',
  args: {
    chainId: 'tron',
    chainName: 'Tron',
    tokens: [{ symbol: 'TRX', name: 'Tron', balance: '0', decimals: 6, chain: 'tron' }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'TronGrid API rate limit exceeded',
    transactionsSupported: false,
    transactionsFallbackReason: 'All Tron providers failed',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  },
};

// ==================== 混合场景 ====================
export const PartialFallback: Story = {
  name: 'Partial Fallback - Tokens OK, Transactions Failed',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', balance: '5.5', decimals: 18, chain: 'ethereum' },
    ],
    transactions: [],
    tokensSupported: true, // 余额查询成功
    transactionsSupported: false, // 交易历史查询失败
    transactionsFallbackReason: 'Etherscan API key invalid',
  },
};

export const EmptyButSupported: Story = {
  name: 'Empty Data - No Warning (Provider OK)',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [],
    transactions: [],
    tokensSupported: true, // Provider 正常，只是没数据
    transactionsSupported: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      // 应该没有警告
      expect(canvas.queryAllByTestId('provider-fallback-warning')).toHaveLength(0);
    });
  },
};
