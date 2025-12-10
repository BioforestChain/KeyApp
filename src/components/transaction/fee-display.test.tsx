import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeDisplay } from './fee-display';

describe('FeeDisplay', () => {
  it('renders fee amount and symbol', () => {
    render(<FeeDisplay amount={0.001} symbol="ETH" />);
    expect(screen.getByText(/0\.001 ETH/)).toBeInTheDocument();
  });

  it('formats small amounts correctly', () => {
    render(<FeeDisplay amount={0.0000001} symbol="ETH" />);
    expect(screen.getByText(/< 0\.000001 ETH/)).toBeInTheDocument();
  });

  it('renders fiat equivalent when provided', () => {
    render(<FeeDisplay amount={0.01} symbol="ETH" fiatValue={25.5} />);
    expect(screen.getByText(/≈ \$25\.50/)).toBeInTheDocument();
  });

  it('uses custom fiat symbol', () => {
    render(<FeeDisplay amount={0.01} symbol="ETH" fiatValue={100} fiatSymbol="€" />);
    expect(screen.getByText(/≈ €100\.00/)).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<FeeDisplay amount={0} symbol="ETH" isLoading />);
    expect(screen.getByLabelText('Loading fee')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading fee')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows high fee warning when threshold exceeded', () => {
    render(<FeeDisplay amount={0.1} symbol="ETH" fiatValue={50} highFeeThreshold={10} />);
    expect(screen.getByLabelText('High fee warning')).toBeInTheDocument();
  });

  it('does not show warning when below threshold', () => {
    render(<FeeDisplay amount={0.001} symbol="ETH" fiatValue={2} highFeeThreshold={10} />);
    expect(screen.queryByLabelText('High fee warning')).not.toBeInTheDocument();
  });

  it('handles string amounts', () => {
    render(<FeeDisplay amount="0.005" symbol="BNB" />);
    expect(screen.getByText(/0\.005 BNB/)).toBeInTheDocument();
  });

  it('handles zero amount', () => {
    render(<FeeDisplay amount={0} symbol="ETH" />);
    expect(screen.getByText(/0 ETH/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FeeDisplay amount={0.01} symbol="ETH" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('formats large fiat values with commas', () => {
    render(<FeeDisplay amount={1} symbol="ETH" fiatValue={1234.56} />);
    expect(screen.getByText(/≈ \$1,234\.56/)).toBeInTheDocument();
  });
});
