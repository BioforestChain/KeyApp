import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordConfirmSheet } from './password-confirm-sheet';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onVerify: vi.fn(),
};

describe('PasswordConfirmSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);
    expect(screen.getByText('验证密码')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<PasswordConfirmSheet {...defaultProps} title="确认操作" />);
    expect(screen.getByText('确认操作')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PasswordConfirmSheet {...defaultProps} description="请输入密码以确认此操作" />);
    expect(screen.getByText('请输入密码以确认此操作')).toBeInTheDocument();
  });

  it('calls onVerify with password on submit', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);

    const input = screen.getByPlaceholderText('请输入密码');
    fireEvent.change(input, { target: { value: 'mypassword123' } });

    fireEvent.click(screen.getByRole('button', { name: '确认' }));

    expect(defaultProps.onVerify).toHaveBeenCalledWith('mypassword123');
  });

  it('disables submit when password is empty', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled();
  });

  it('enables submit when password has value', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);

    const input = screen.getByPlaceholderText('请输入密码');
    fireEvent.change(input, { target: { value: 'password' } });

    expect(screen.getByRole('button', { name: '确认' })).not.toBeDisabled();
  });

  it('shows error message when provided', () => {
    render(<PasswordConfirmSheet {...defaultProps} error="密码错误" />);
    expect(screen.getByText('密码错误')).toBeInTheDocument();
  });

  it('shows biometric button when available', () => {
    const onBiometric = vi.fn();
    render(
      <PasswordConfirmSheet {...defaultProps} biometricAvailable onBiometric={onBiometric} />,
    );
    expect(screen.getByText('使用生物识别')).toBeInTheDocument();
  });

  it('does not show biometric button when not available', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);
    expect(screen.queryByText('使用生物识别')).not.toBeInTheDocument();
  });

  it('calls onBiometric when biometric button is clicked', () => {
    const onBiometric = vi.fn();
    render(
      <PasswordConfirmSheet {...defaultProps} biometricAvailable onBiometric={onBiometric} />,
    );

    fireEvent.click(screen.getByText('使用生物识别'));
    expect(onBiometric).toHaveBeenCalled();
  });

  it('shows verifying state', () => {
    render(<PasswordConfirmSheet {...defaultProps} isVerifying />);
    expect(screen.getByText('验证中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '验证中...' })).toBeDisabled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<PasswordConfirmSheet {...defaultProps} />);

    fireEvent.click(screen.getByText('取消'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when not open', () => {
    render(<PasswordConfirmSheet {...defaultProps} open={false} />);
    expect(screen.queryByText('验证密码')).not.toBeInTheDocument();
  });

  it('clears password on close', () => {
    const { rerender } = render(<PasswordConfirmSheet {...defaultProps} />);

    const input = screen.getByPlaceholderText('请输入密码');
    fireEvent.change(input, { target: { value: 'password' } });

    fireEvent.click(screen.getByText('取消'));

    // Reopen
    rerender(<PasswordConfirmSheet {...defaultProps} open={true} />);

    // Password should be cleared (submit button disabled)
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled();
  });
});
