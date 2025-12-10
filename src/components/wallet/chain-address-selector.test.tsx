import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChainAddressSelector, type ChainData } from './chain-address-selector';

const mockChains: ChainData[] = [
  {
    chain: 'ethereum',
    name: 'Ethereum',
    addresses: [
      { address: '0x1234567890abcdef1234567890abcdef12345678', balance: '1.5 ETH', isDefault: true },
      { address: '0xabcdef1234567890abcdef1234567890abcdef12', balance: '0.5 ETH' },
    ],
  },
  {
    chain: 'tron',
    name: 'Tron',
    addresses: [
      { address: 'TAbcdefghijklmnopqrstuvwxyz123456', balance: '10,000 TRX', isDefault: true },
    ],
  },
  {
    chain: 'bsc',
    name: 'BSC',
    addresses: [],
  },
];

describe('ChainAddressSelector', () => {
  it('renders empty state when no chains', () => {
    render(<ChainAddressSelector chains={[]} />);
    expect(screen.getByText('暂无可用链')).toBeInTheDocument();
  });

  it('renders chain list', () => {
    render(<ChainAddressSelector chains={mockChains} />);
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Tron')).toBeInTheDocument();
    expect(screen.getByText('BSC')).toBeInTheDocument();
  });

  it('shows addresses for first chain by default', () => {
    render(<ChainAddressSelector chains={mockChains} />);
    expect(screen.getByText('0x123456...345678')).toBeInTheDocument();
    expect(screen.getByText('1.5 ETH')).toBeInTheDocument();
  });

  it('switches addresses when chain is selected', () => {
    render(<ChainAddressSelector chains={mockChains} />);

    fireEvent.click(screen.getByText('Tron'));

    expect(screen.getByText('TAbcdefg...123456')).toBeInTheDocument();
    expect(screen.getByText('10,000 TRX')).toBeInTheDocument();
  });

  it('shows empty state for chain with no addresses', () => {
    render(<ChainAddressSelector chains={mockChains} />);

    fireEvent.click(screen.getByText('BSC'));

    expect(screen.getByText('该链暂无地址')).toBeInTheDocument();
  });

  it('calls onSelect when address is clicked', () => {
    const onSelect = vi.fn();
    render(<ChainAddressSelector chains={mockChains} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('0x123456...345678'));

    expect(onSelect).toHaveBeenCalledWith('ethereum', '0x1234567890abcdef1234567890abcdef12345678');
  });

  it('calls onSelect with correct chain after switching', () => {
    const onSelect = vi.fn();
    render(<ChainAddressSelector chains={mockChains} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Tron'));
    fireEvent.click(screen.getByText('TAbcdefg...123456'));

    expect(onSelect).toHaveBeenCalledWith('tron', 'TAbcdefghijklmnopqrstuvwxyz123456');
  });

  it('highlights selected chain', () => {
    render(<ChainAddressSelector chains={mockChains} selectedChain="tron" />);
    const tronItem = screen.getByRole('option', { name: /Tron/i });
    expect(tronItem).toHaveAttribute('aria-selected', 'true');
  });

  it('highlights selected address', () => {
    render(
      <ChainAddressSelector
        chains={mockChains}
        selectedAddress="0x1234567890abcdef1234567890abcdef12345678"
      />,
    );
    const addressItem = screen.getByRole('option', { name: /0x123456...345678/i });
    expect(addressItem).toHaveAttribute('aria-selected', 'true');
  });

  it('shows default badge for default address', () => {
    render(<ChainAddressSelector chains={mockChains} />);
    expect(screen.getByText('默认')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChainAddressSelector chains={mockChains} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
