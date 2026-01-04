import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ChainSelector, getDefaultSelectedChains } from './chain-selector';
import { TestI18nProvider } from '@/test/i18n-mock';
import type { ChainConfig } from '@/services/chain-config';

const sampleChains: ChainConfig[] = [
  {
    id: 'bfmeta',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFM',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'ccchain',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'CCChain',
    symbol: 'CCC',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'ethereum',
    version: '1.0',
    chainKind: 'evm',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'tron',
    version: '1.0',
    chainKind: 'bitcoin',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    enabled: true,
    source: 'default',
  },
];

const renderWithI18n = (ui: ReactElement) => {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
};

describe('ChainSelector', () => {
  it('renders grouped chains', () => {
    renderWithI18n(
      <ChainSelector
        data-testid="chain-selector"
        chains={sampleChains}
        selectedChains={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('chain-selector-group-bioforest')).toBeInTheDocument();
    expect(screen.getByTestId('chain-selector-group-evm')).toBeInTheDocument();
    expect(screen.getByTestId('chain-selector-group-bip39')).toBeInTheDocument();
  });

  it('selects all chains in a group', () => {
    const onSelectionChange = vi.fn();
    renderWithI18n(
      <ChainSelector
        data-testid="chain-selector"
        chains={sampleChains}
        selectedChains={[]}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByTestId('chain-selector-group-checkbox-bioforest'));
    expect(onSelectionChange).toHaveBeenCalledWith(['bfmeta', 'ccchain']);
  });

  it('filters chains by search query', () => {
    renderWithI18n(
      <ChainSelector
        data-testid="chain-selector"
        chains={sampleChains}
        selectedChains={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('chain-selector-search'), { target: { value: 'ETH' } });

    expect(screen.queryByTestId('chain-selector-chain-bfmeta')).not.toBeInTheDocument();
    expect(screen.getByTestId('chain-selector-chain-ethereum')).toBeInTheDocument();
  });

  it('renders favorites first within groups', () => {
    renderWithI18n(
      <ChainSelector
        data-testid="chain-selector"
        chains={sampleChains}
        selectedChains={[]}
        favoriteChains={['ccchain']}
        onSelectionChange={vi.fn()}
        onFavoriteChange={vi.fn()}
      />,
    );

    const groupContent = screen.getByTestId('chain-selector-group-content-bioforest');
    const items = within(groupContent).getAllByTestId(/chain-selector-chain-/);
    expect(items[0]).toHaveAttribute('data-testid', 'chain-selector-chain-ccchain');
  });
});

describe('getDefaultSelectedChains', () => {
  it('returns bioforest chain ids only', () => {
    const defaults = getDefaultSelectedChains(sampleChains);
    expect(defaults).toEqual(['bfmeta', 'ccchain']);
  });
});
