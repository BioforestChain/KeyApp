import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeDisplay } from './fee-display';
import { TestI18nProvider } from '@/test/i18n-mock';

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
}

describe('FeeDisplay', () => {
  it('renders fee amount and symbol', () => {
    renderWithProviders(<FeeDisplay amount={0.001} symbol="ETH" />);
    expect(screen.getByText('0.001')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('formats small amounts correctly', () => {
    renderWithProviders(<FeeDisplay amount={0.0000001} symbol="ETH" />);
    // AmountDisplay 使用 8 位小数精度
    expect(screen.getByText('0.0000001')).toBeInTheDocument();
  });

  it('renders fiat equivalent when provided', () => {
    renderWithProviders(<FeeDisplay amount={0.01} symbol="ETH" fiatValue={25.5} />);
    // fiat 值在 <p> 元素中，使用 textContent 检查
    const fiatEl = screen.getByText((_, element) => 
      element?.tagName === 'P' && element?.textContent?.includes('25.5') === true
    );
    expect(fiatEl).toBeInTheDocument();
  });

  it('uses custom fiat symbol', () => {
    renderWithProviders(<FeeDisplay amount={0.01} symbol="ETH" fiatValue={100} fiatSymbol="€" />);
    const fiatEl = screen.getByText((_, element) => 
      element?.tagName === 'P' && element?.textContent?.includes('€') === true && element?.textContent?.includes('100') === true
    );
    expect(fiatEl).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    renderWithProviders(<FeeDisplay amount={0} symbol="ETH" isLoading />);
    expect(screen.getByLabelText('正在加载手续费')).toBeInTheDocument();
    expect(screen.getByLabelText('正在加载手续费')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows high fee warning when threshold exceeded', () => {
    renderWithProviders(<FeeDisplay amount={0.1} symbol="ETH" fiatValue={50} highFeeThreshold={10} />);
    expect(screen.getByLabelText('高手续费警告')).toBeInTheDocument();
  });

  it('does not show warning when below threshold', () => {
    renderWithProviders(<FeeDisplay amount={0.001} symbol="ETH" fiatValue={2} highFeeThreshold={10} />);
    expect(screen.queryByLabelText('高手续费警告')).not.toBeInTheDocument();
  });

  it('handles string amounts', () => {
    renderWithProviders(<FeeDisplay amount="0.005" symbol="BNB" />);
    expect(screen.getByText('0.005')).toBeInTheDocument();
    expect(screen.getByText('BNB')).toBeInTheDocument();
  });

  it('handles zero amount', () => {
    renderWithProviders(<FeeDisplay amount={0} symbol="ETH" />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(<FeeDisplay amount={0.01} symbol="ETH" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('formats large fiat values with commas', () => {
    renderWithProviders(<FeeDisplay amount={1} symbol="ETH" fiatValue={1234.56} />);
    const fiatEl = screen.getByText((_, element) => 
      element?.tagName === 'P' && element?.textContent?.includes('1,234.56') === true
    );
    expect(fiatEl).toBeInTheDocument();
  });
});
