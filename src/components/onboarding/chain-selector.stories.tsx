import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChainSelector, getDefaultSelectedChains } from './chain-selector';
import { expect, within, fn } from '@storybook/test';
import type { ChainConfig } from '@/services/chain-config';

const chains: ChainConfig[] = [
  {
    id: 'bfmeta',
    version: '1.0',
    type: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFM',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'ccchain',
    version: '1.0',
    type: 'bioforest',
    name: 'CCChain',
    symbol: 'CCC',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'pmchain',
    version: '1.0',
    type: 'bioforest',
    name: 'PMChain',
    symbol: 'PMC',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'ethereum',
    version: '1.0',
    type: 'evm',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'polygon',
    version: '1.0',
    type: 'evm',
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'bitcoin',
    version: '1.0',
    type: 'bip39',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'tron',
    version: '1.0',
    type: 'bip39',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    enabled: true,
    source: 'default',
  },
];

const meta: Meta<typeof ChainSelector> = {
  title: 'Onboarding/ChainSelector',
  component: ChainSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ChainSelector>;

export const Default: Story = {
  args: {
    chains,
    selectedChains: ['bfmeta', 'ccchain', 'pmchain'],
    favoriteChains: ['ccchain'],
    onSelectionChange: fn(),
    onFavoriteChange: fn(),
    'data-testid': 'chain-selector',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('chain-selector-search')).toBeInTheDocument();
    expect(canvas.getByTestId('chain-selector-group-bioforest')).toBeInTheDocument();
    expect(canvas.getByTestId('chain-selector-chain-bfmeta')).toBeInTheDocument();
  },
};

/**
 * 交互式示例：展示完整的选择流程
 */
export const Interactive: Story = {
  name: 'Interactive Selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>(getDefaultSelectedChains(chains));
    const [favorites, setFavorites] = useState<string[]>(['ccchain']);

    return (
      <div className="w-96 space-y-4">
        <ChainSelector
          chains={chains}
          selectedChains={selected}
          favoriteChains={favorites}
          onSelectionChange={setSelected}
          onFavoriteChange={setFavorites}
          data-testid="chain-selector"
        />
        <div className="text-sm text-muted-foreground">
          Selected: {selected.length} chains
        </div>
      </div>
    );
  },
};

/**
 * 默认选择测试：验证默认选择生物链林
 */
export const DefaultSelectionBioforest: Story = {
  name: 'Default: Bioforest Selected',
  render: () => {
    const defaultSelected = getDefaultSelectedChains(chains);
    const bioforestChains = chains.filter(c => c.type === 'bioforest');
    const allBioforestSelected = bioforestChains.every(c => defaultSelected.includes(c.id));

    return (
      <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Default Selection Test</h3>
          <p className="text-sm text-muted-foreground">
            Bioforest chains should be selected by default
          </p>
        </div>

        <ChainSelector
          chains={chains}
          selectedChains={defaultSelected}
          onSelectionChange={() => {}}
          data-testid="chain-selector"
        />

        <div className={`text-center p-3 rounded-lg ${allBioforestSelected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {allBioforestSelected 
            ? `✓ All ${bioforestChains.length} Bioforest chains selected by default` 
            : '✗ Not all Bioforest chains selected!'}
        </div>
      </div>
    );
  },
};

/**
 * 搜索功能测试
 */
export const SearchFilter: Story = {
  name: 'Search Filtering',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Search Test</h3>
          <p className="text-sm text-muted-foreground">
            Try searching "ETH" or "BF"
          </p>
        </div>

        <ChainSelector
          chains={chains}
          selectedChains={selected}
          onSelectionChange={setSelected}
          data-testid="chain-selector"
        />
      </div>
    );
  },
};

/**
 * 空列表边界测试
 */
export const EmptyChains: Story = {
  name: 'Boundary: Empty Chains',
  args: {
    chains: [],
    selectedChains: [],
    onSelectionChange: fn(),
    'data-testid': 'chain-selector',
  },
};

/**
 * 无搜索框
 */
export const NoSearch: Story = {
  name: 'Without Search',
  args: {
    chains,
    selectedChains: ['bfmeta'],
    onSelectionChange: fn(),
    showSearch: false,
    'data-testid': 'chain-selector',
  },
};

/**
 * 全选状态
 */
export const AllSelected: Story = {
  name: 'All Chains Selected',
  args: {
    chains,
    selectedChains: chains.map(c => c.id),
    onSelectionChange: fn(),
    'data-testid': 'chain-selector',
  },
};

/**
 * 收藏功能测试
 */
export const WithFavorites: Story = {
  name: 'With Favorites',
  render: () => {
    const [selected, setSelected] = useState<string[]>(['ethereum', 'bitcoin']);
    const [favorites, setFavorites] = useState<string[]>(['ethereum', 'bitcoin']);

    return (
      <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Favorites Test</h3>
          <p className="text-sm text-muted-foreground">
            Favorited chains appear first in their group
          </p>
        </div>

        <ChainSelector
          chains={chains}
          selectedChains={selected}
          favoriteChains={favorites}
          onSelectionChange={setSelected}
          onFavoriteChange={setFavorites}
          data-testid="chain-selector"
        />

        <div className="text-sm text-muted-foreground text-center">
          Favorites: {favorites.join(', ') || 'None'}
        </div>
      </div>
    );
  },
};

/**
 * 暗色主题测试
 */
export const ThemeDark: Story = {
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8 rounded-lg w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    chains,
    selectedChains: ['bfmeta', 'ccchain', 'pmchain'],
    favoriteChains: ['ccchain'],
    onSelectionChange: fn(),
    onFavoriteChange: fn(),
    'data-testid': 'chain-selector',
  },
};

/**
 * 组批量选择测试
 */
export const GroupSelection: Story = {
  name: 'Group Selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    const bioforestCount = chains.filter(c => c.type === 'bioforest').length;
    const evmCount = chains.filter(c => c.type === 'evm').length;

    return (
      <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Group Selection Test</h3>
          <p className="text-sm text-muted-foreground">
            Click group checkbox to select/deselect all chains in group
          </p>
        </div>

        <ChainSelector
          chains={chains}
          selectedChains={selected}
          onSelectionChange={setSelected}
          data-testid="chain-selector"
        />

        <div className="text-sm space-y-1">
          <div>Bioforest: {chains.filter(c => c.type === 'bioforest' && selected.includes(c.id)).length}/{bioforestCount}</div>
          <div>EVM: {chains.filter(c => c.type === 'evm' && selected.includes(c.id)).length}/{evmCount}</div>
          <div>Total Selected: {selected.length}/{chains.length}</div>
        </div>
      </div>
    );
  },
};
