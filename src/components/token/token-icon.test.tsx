import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenIcon } from './token-icon';

describe('TokenIcon', () => {
  it('renders fallback when no image URL', () => {
    render(<TokenIcon symbol="BTC" />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByLabelText('BTC')).toBeInTheDocument();
  });

  it('displays first letter of symbol as fallback', () => {
    render(<TokenIcon symbol="ethereum" />);
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('renders image when URL provided', () => {
    render(<TokenIcon symbol="BTC" imageUrl="https://example.com/btc.png" />);
    const img = screen.getByAltText('BTC');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/btc.png');
  });

  it('shows fallback on image load error', () => {
    render(<TokenIcon symbol="ETH" imageUrl="https://broken.url/eth.png" />);
    const img = screen.getByAltText('ETH');
    fireEvent.error(img);
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<TokenIcon symbol="BTC" size="sm" />);
    expect(screen.getByLabelText('BTC')).toHaveClass('size-6');

    rerender(<TokenIcon symbol="BTC" size="md" />);
    expect(screen.getByLabelText('BTC')).toHaveClass('size-8');

    rerender(<TokenIcon symbol="BTC" size="lg" />);
    expect(screen.getByLabelText('BTC')).toHaveClass('size-10');
  });

  it('applies custom className', () => {
    render(<TokenIcon symbol="BTC" className="custom-class" />);
    expect(screen.getByLabelText('BTC')).toHaveClass('custom-class');
  });

  it('handles null imageUrl as fallback', () => {
    render(<TokenIcon symbol="USDT" imageUrl={null} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('capitalizes fallback letter', () => {
    render(<TokenIcon symbol="btc" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
