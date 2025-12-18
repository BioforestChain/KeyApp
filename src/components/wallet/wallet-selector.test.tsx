import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletSelector } from './wallet-selector';
import type { WalletInfo } from './wallet-card';
import { TestI18nProvider } from '@/test/i18n-mock';

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>);

const mockWallets: WalletInfo[] = [
  {
    id: 'wallet-1',
    name: 'Main Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    balance: '1.5 ETH',
    fiatValue: '3000',
    isBackedUp: true,
  },
  {
    id: 'wallet-2',
    name: 'Savings',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    balance: '0.5 BTC',
    fiatValue: '20000',
    isBackedUp: false,
  },
  {
    id: 'wallet-3',
    name: 'Trading',
    address: 'TAbcdefghijklmnopqrstuvwxyz123456',
    balance: '10,000 TRX',
    isBackedUp: true,
  },
];

describe('WalletSelector', () => {
  it('renders empty state when no wallets', () => {
    renderWithI18n(<WalletSelector wallets={[]} />);
    expect(screen.getByText('暂无钱包')).toBeInTheDocument();
    expect(screen.getByText('点击上方按钮创建或导入钱包')).toBeInTheDocument();
  });

  it('renders list of wallets', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} />);
    expect(screen.getByText('Main Wallet')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Trading')).toBeInTheDocument();
  });

  it('displays truncated addresses', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} />);
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(screen.getByText('0xabcd...ef12')).toBeInTheDocument();
  });

  it('displays balance for each wallet', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} />);
    expect(screen.getByText('1.5 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.5 BTC')).toBeInTheDocument();
    expect(screen.getByText('10,000 TRX')).toBeInTheDocument();
  });

  it('highlights selected wallet', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} selectedId="wallet-2" />);
    const selectedItem = screen.getByRole('option', { name: /Savings/i });
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    expect(selectedItem).toHaveClass('bg-muted');
  });

  it('calls onSelect when wallet is clicked', () => {
    const onSelect = vi.fn();
    renderWithI18n(<WalletSelector wallets={mockWallets} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Main Wallet'));
    expect(onSelect).toHaveBeenCalledWith(mockWallets[0]);
  });

  it('calls onClose after selection', () => {
    const onClose = vi.fn();
    renderWithI18n(<WalletSelector wallets={mockWallets} onClose={onClose} />);

    fireEvent.click(screen.getByText('Main Wallet'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows backup warning for unbackedup wallets', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} />);
    const warnings = screen.getAllByText('未备份');
    expect(warnings).toHaveLength(1);
  });

  it('applies custom className', () => {
    const { container } = renderWithI18n(
      <WalletSelector wallets={mockWallets} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays wallet avatar with first letter', () => {
    renderWithI18n(<WalletSelector wallets={mockWallets} />);
    expect(screen.getByText('M')).toBeInTheDocument(); // Main
    expect(screen.getByText('S')).toBeInTheDocument(); // Savings
    expect(screen.getByText('T')).toBeInTheDocument(); // Trading
  });
});
