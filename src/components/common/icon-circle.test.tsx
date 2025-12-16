import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IconCircle } from './icon-circle';
import { IconShieldCheck as ShieldCheck, IconWallet as Wallet, IconSettings as Settings } from '@tabler/icons-react';

describe('IconCircle', () => {
  it('renders with icon', () => {
    render(<IconCircle icon={ShieldCheck} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    const { container } = render(<IconCircle icon={Wallet} />);
    expect(container.firstChild).toHaveClass('bg-primary/10');
    expect(container.firstChild).toHaveClass('text-primary');
  });

  it('applies different variants', () => {
    const { container, rerender } = render(<IconCircle icon={Wallet} variant="error" />);
    expect(container.firstChild).toHaveClass('bg-destructive/10');

    rerender(<IconCircle icon={Wallet} variant="success" />);
    expect(container.firstChild).toHaveClass('bg-green-500/10');
  });

  it('applies different sizes', () => {
    const { container, rerender } = render(<IconCircle icon={Settings} size="sm" />);
    expect(container.firstChild).toHaveClass('size-10');

    rerender(<IconCircle icon={Settings} size="lg" />);
    expect(container.firstChild).toHaveClass('size-16');
  });

  it('applies custom className', () => {
    const { container } = render(<IconCircle icon={Wallet} className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
