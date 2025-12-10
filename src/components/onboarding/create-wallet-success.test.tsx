import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWalletSuccess } from './create-wallet-success';

describe('CreateWalletSuccess', () => {
  const mockOnBackup = vi.fn();
  const mockOnEnterWallet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success message with wallet name', () => {
    render(
      <CreateWalletSuccess
        walletName="我的钱包"
        onEnterWallet={mockOnEnterWallet}
      />,
    );

    expect(screen.getByText('钱包创建成功！')).toBeInTheDocument();
    expect(screen.getByText('我的钱包')).toBeInTheDocument();
  });

  it('renders success icon', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onEnterWallet={mockOnEnterWallet}
      />,
    );

    // Check for success styling (green circle container)
    const iconContainer = document.querySelector('.bg-green-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('shows backup reminder when skipBackup is true', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    expect(screen.getByText('安全提醒')).toBeInTheDocument();
    expect(screen.getByText(/请尽快备份助记词/)).toBeInTheDocument();
  });

  it('does not show backup reminder when skipBackup is false', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={false}
      />,
    );

    expect(screen.queryByText('安全提醒')).not.toBeInTheDocument();
  });

  it('shows backup button when onBackup is provided and skipBackup is true', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    expect(screen.getByRole('button', { name: /立即备份助记词/ })).toBeInTheDocument();
  });

  it('does not show backup button when onBackup is not provided', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    expect(screen.queryByRole('button', { name: /立即备份助记词/ })).not.toBeInTheDocument();
  });

  it('calls onBackup when backup button is clicked', async () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /立即备份助记词/ }));

    expect(mockOnBackup).toHaveBeenCalledTimes(1);
  });

  it('calls onEnterWallet when enter wallet button is clicked', async () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /稍后备份/ }));

    expect(mockOnEnterWallet).toHaveBeenCalledTimes(1);
  });

  it('shows "进入钱包" when no backup option', async () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onEnterWallet={mockOnEnterWallet}
        skipBackup={false}
      />,
    );

    expect(screen.getByRole('button', { name: /进入钱包/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /进入钱包/ }));
    expect(mockOnEnterWallet).toHaveBeenCalledTimes(1);
  });

  it('shows skip note when backup is available', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onBackup={mockOnBackup}
        onEnterWallet={mockOnEnterWallet}
        skipBackup={true}
      />,
    );

    expect(screen.getByText(/您可以稍后在设置中备份助记词/)).toBeInTheDocument();
  });

  it('does not show skip note when backup is not available', () => {
    render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onEnterWallet={mockOnEnterWallet}
        skipBackup={false}
      />,
    );

    expect(screen.queryByText(/您可以稍后在设置中备份助记词/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CreateWalletSuccess
        walletName="TestWallet"
        onEnterWallet={mockOnEnterWallet}
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
