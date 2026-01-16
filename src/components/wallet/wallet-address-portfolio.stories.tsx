import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from '@storybook/test';
import { WalletAddressPortfolioView } from './wallet-address-portfolio-view';
import { Amount } from '@/types/amount';
import type { TokenInfo } from '@/components/token/token-item';
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item';

// ==================== Mock 数据 ====================

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

const mockEthereumTransactions: TransactionInfo[] = [
  {
    id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('1000000000000000000', 18, 'ETH'),
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
    timestamp: new Date(Date.now() - 7200000),
    chain: 'ethereum',
  },
  {
    id: '0x2b3c4d5e6f78901abcdef2345678901abcdef2345678901abcdef2345678901',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('5000000000000000000', 18, 'ETH'),
    symbol: 'ETH',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    timestamp: new Date(Date.now() - 86400000),
    chain: 'ethereum',
  },
];

const mockTronTransactions: TransactionInfo[] = [
  {
    id: 'caacd034fd600a9a66cb9c841f39b81101e97e23068c8d73152f8741654139e1',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('149000000', 6, 'TRX'),
    symbol: 'TRX',
    address: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
    timestamp: new Date(Date.now() - 3600000),
    chain: 'tron',
  },
];

const mockBinanceTransactions: TransactionInfo[] = [
  {
    id: '0xbsc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('10000000000000000000', 18, 'BNB'),
    symbol: 'BNB',
    address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    timestamp: new Date(Date.now() - 3600000),
    chain: 'binance',
  },
];

// ==================== Meta ====================

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

// ==================== 基础状态 Stories ====================

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

// ==================== 各链正常数据 Stories ====================

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

export const EthereumNormalData: Story = {
  name: 'Ethereum - Normal Data',
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

export const BinanceNormalData: Story = {
  name: 'Binance - Normal Data',
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

export const TronNormalData: Story = {
  name: 'Tron - Normal Data',
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

// ==================== Fallback 警告 Stories ====================

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

// ==================== 边界情况 Stories ====================

export const PartialFallback: Story = {
  name: 'Partial Fallback - Tokens OK, Transactions Failed',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', balance: '5.5', decimals: 18, chain: 'ethereum' },
    ],
    transactions: [],
    tokensSupported: true,
    transactionsSupported: false,
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
    tokensSupported: true,
    transactionsSupported: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.queryAllByTestId('provider-fallback-warning')).toHaveLength(0);
    });
  },
};
