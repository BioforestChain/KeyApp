import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionStatus, TransactionStatusIcon } from './transaction-status';

describe('TransactionStatus', () => {
  it('renders success status with correct styling', () => {
    render(<TransactionStatus status="success" />);
    const element = screen.getByLabelText('Success');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-green-600');
  });

  it('renders failed status with correct styling', () => {
    render(<TransactionStatus status="failed" />);
    const element = screen.getByLabelText('Failed');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-red-600');
  });

  it('renders pending status with correct styling', () => {
    render(<TransactionStatus status="pending" />);
    const element = screen.getByLabelText('Pending');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-yellow-600');
  });

  it('renders cancelled status with correct styling', () => {
    render(<TransactionStatus status="cancelled" />);
    const element = screen.getByLabelText('Cancelled');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-gray-500');
  });

  it('shows label by default', () => {
    render(<TransactionStatus status="success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<TransactionStatus status="success" showLabel={false} />);
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('uses custom label when provided', () => {
    render(<TransactionStatus status="success" label="Confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<TransactionStatus status="success" size="sm" />);
    expect(screen.getByLabelText('Success')).toHaveClass('text-xs');

    rerender(<TransactionStatus status="success" size="lg" />);
    expect(screen.getByLabelText('Success')).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    render(<TransactionStatus status="success" className="custom-class" />);
    expect(screen.getByLabelText('Success')).toHaveClass('custom-class');
  });
});

describe('TransactionStatusIcon', () => {
  it('renders icon only without label', () => {
    render(<TransactionStatusIcon status="success" />);
    expect(screen.getByLabelText('Success')).toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<TransactionStatusIcon status="success" />);
    expect(screen.getByLabelText('Success')).toHaveClass('text-green-600');

    rerender(<TransactionStatusIcon status="failed" />);
    expect(screen.getByLabelText('Failed')).toHaveClass('text-red-600');

    rerender(<TransactionStatusIcon status="pending" />);
    expect(screen.getByLabelText('Pending')).toHaveClass('text-yellow-600');
  });

  it('applies size classes', () => {
    const { rerender } = render(<TransactionStatusIcon status="success" size="sm" />);
    expect(screen.getByLabelText('Success')).toHaveClass('size-3');

    rerender(<TransactionStatusIcon status="success" size="lg" />);
    expect(screen.getByLabelText('Success')).toHaveClass('size-5');
  });
});
