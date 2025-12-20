import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestI18nProvider } from '@/test/i18n-mock';
import { TransferConfirmSheet } from './transfer-confirm-sheet';

// Mock clipboard service
const { mockClipboardWrite } = vi.hoisted(() => ({
  mockClipboardWrite: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: mockClipboardWrite,
    read: vi.fn().mockResolvedValue(''),
  },
}))

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>);

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  amount: '1.5',
  symbol: 'ETH',
  toAddress: '0x1234567890abcdef1234567890abcdef12345678',
  feeAmount: 0.002,
  feeSymbol: 'ETH',
};

describe('TransferConfirmSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transfer amount and symbol', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);
    expect(screen.getByText('1.5 ETH')).toBeInTheDocument();
  });

  it('renders fiat value when provided', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} fiatValue="3000" />);
    expect(screen.getByText('≈ $3000')).toBeInTheDocument();
  });

  it('renders truncated address by default', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);
    expect(screen.getByText('0x12345678...345678')).toBeInTheDocument();
  });

  it('expands address on click', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);

    fireEvent.click(screen.getByText('0x12345678...345678'));

    expect(screen.getByText(defaultProps.toAddress)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);

    fireEvent.click(screen.getByText('取消'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '确认转账' }));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('shows confirming state', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} isConfirming />);
    expect(screen.getByText('确认中...')).toBeInTheDocument();
    expect(screen.getByText('确认中...')).toBeDisabled();
  });

  it('disables confirm when fee is loading', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} feeLoading />);
    expect(screen.getByRole('button', { name: '确认转账' })).toBeDisabled();
  });

  it('renders fee display', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} feeFiatValue={5} />);
    expect(screen.getByText(/0\.002 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/≈ \$5\.00/)).toBeInTheDocument();
  });

  it('does not render when not open', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} open={false} />);
    expect(screen.queryByText('确认转账')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);

    // The backdrop has aria-hidden="true", but clicking it should trigger close
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('shows copy feedback when address is copied', async () => {
    mockClipboardWrite.mockClear();

    renderWithI18n(<TransferConfirmSheet {...defaultProps} />);

    const copyButton = screen.getByLabelText('复制地址');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByLabelText('已复制')).toBeInTheDocument();
    });
    expect(mockClipboardWrite).toHaveBeenCalledWith({ text: defaultProps.toAddress });
  });
});
