import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWalletForm, validateCreateWalletForm } from './create-wallet-form';

describe('CreateWalletForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenMnemonicOptions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('钱包名称')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入钱包名称')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('8-30个字符，不能包含空格')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请再次输入密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('可选')).toBeInTheDocument();
    expect(screen.getByText(/用户协议/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '创建钱包' })).toBeInTheDocument();
  });

  it('shows mnemonic options button with default values', () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('English · 12 词')).toBeInTheDocument();
  });

  it('shows custom mnemonic options', () => {
    render(
      <CreateWalletForm
        onSubmit={mockOnSubmit}
        mnemonicOptions={{ language: 'zh-Hans', length: 24 }}
      />,
    );

    expect(screen.getByText('中文（简体） · 24 词')).toBeInTheDocument();
  });

  it('calls onOpenMnemonicOptions when mnemonic button is clicked', async () => {
    render(
      <CreateWalletForm onSubmit={mockOnSubmit} onOpenMnemonicOptions={mockOnOpenMnemonicOptions} />,
    );

    await userEvent.click(screen.getByText('English · 12 词'));
    expect(mockOnOpenMnemonicOptions).toHaveBeenCalledTimes(1);
  });

  it('shows name character counter', async () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByPlaceholderText('请输入钱包名称');
    await userEvent.type(nameInput, '测试钱包');

    expect(screen.getByText('4/12')).toBeInTheDocument();
  });

  it('disables submit button when form is invalid', () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: '创建钱包' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid', async () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('请输入钱包名称'), 'MyWallet');
    await user.type(screen.getByPlaceholderText('8-30个字符，不能包含空格'), 'password123');
    await user.type(screen.getByPlaceholderText('请再次输入密码'), 'password123');
    await user.click(screen.getByRole('checkbox'));

    const submitButton = screen.getByRole('button', { name: '创建钱包' });
    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit with form data when valid form is submitted', async () => {
    render(
      <CreateWalletForm
        onSubmit={mockOnSubmit}
        mnemonicOptions={{ language: 'english', length: 12 }}
      />,
    );

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('请输入钱包名称'), 'MyWallet');
    await user.type(screen.getByPlaceholderText('8-30个字符，不能包含空格'), 'password123');
    await user.type(screen.getByPlaceholderText('请再次输入密码'), 'password123');
    await user.type(screen.getByPlaceholderText('可选'), 'hint');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '创建钱包' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'MyWallet',
      password: 'password123',
      confirmPassword: 'password123',
      tip: 'hint',
      agreement: true,
      mnemonicOptions: { language: 'english', length: 12 },
    });
  });

  it('shows submitting state', () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} isSubmitting />);

    expect(screen.getByRole('button', { name: '创建中...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '创建中...' })).toBeDisabled();
  });

  it('disables all inputs when submitting', () => {
    render(<CreateWalletForm onSubmit={mockOnSubmit} isSubmitting />);

    expect(screen.getByPlaceholderText('请输入钱包名称')).toBeDisabled();
    expect(screen.getByPlaceholderText('8-30个字符，不能包含空格')).toBeDisabled();
    expect(screen.getByPlaceholderText('请再次输入密码')).toBeDisabled();
  });
});

describe('validateCreateWalletForm', () => {
  it('returns error for empty name', () => {
    const errors = validateCreateWalletForm({ name: '' });
    expect(errors.name).toBe('请输入钱包名称');
  });

  it('returns error for name with only spaces', () => {
    const errors = validateCreateWalletForm({ name: '   ' });
    expect(errors.name).toBe('请输入钱包名称');
  });

  it('returns error for name exceeding 12 chars', () => {
    const errors = validateCreateWalletForm({ name: '这是一个很长的钱包名称超过十二个字符' });
    expect(errors.name).toBe('钱包名称不能超过12个字符');
  });

  it('returns no error for valid name', () => {
    const errors = validateCreateWalletForm({ name: '我的钱包' });
    expect(errors.name).toBeUndefined();
  });

  it('returns error for empty password', () => {
    const errors = validateCreateWalletForm({ password: '' });
    expect(errors.password).toBe('请输入密码');
  });

  it('returns error for password less than 8 chars', () => {
    const errors = validateCreateWalletForm({ password: 'short' });
    expect(errors.password).toBe('密码至少8个字符');
  });

  it('returns error for password more than 30 chars', () => {
    const errors = validateCreateWalletForm({ password: 'a'.repeat(31) });
    expect(errors.password).toBe('密码不能超过30个字符');
  });

  it('returns error for password with whitespace', () => {
    const errors = validateCreateWalletForm({ password: 'pass word123' });
    expect(errors.password).toBe('密码不能包含空格');
  });

  it('returns no error for valid password', () => {
    const errors = validateCreateWalletForm({ password: 'validpassword123' });
    expect(errors.password).toBeUndefined();
  });

  it('returns error for empty confirm password', () => {
    const errors = validateCreateWalletForm({ password: 'password123', confirmPassword: '' });
    expect(errors.confirmPassword).toBe('请确认密码');
  });

  it('returns error for mismatched passwords', () => {
    const errors = validateCreateWalletForm({
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(errors.confirmPassword).toBe('两次输入的密码不一致');
  });

  it('returns no error for matching passwords', () => {
    const errors = validateCreateWalletForm({
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(errors.confirmPassword).toBeUndefined();
  });

  it('returns error for tip exceeding 50 chars', () => {
    const errors = validateCreateWalletForm({ tip: 'a'.repeat(51) });
    expect(errors.tip).toBe('密码提示不能超过50个字符');
  });

  it('returns no error for empty tip', () => {
    const errors = validateCreateWalletForm({ tip: '' });
    expect(errors.tip).toBeUndefined();
  });

  it('returns error for unchecked agreement', () => {
    const errors = validateCreateWalletForm({ agreement: false });
    expect(errors.agreement).toBe('请阅读并同意用户协议');
  });

  it('returns no error for checked agreement', () => {
    const errors = validateCreateWalletForm({ agreement: true });
    expect(errors.agreement).toBeUndefined();
  });

  it('returns multiple errors for invalid form', () => {
    const errors = validateCreateWalletForm({
      name: '',
      password: 'short',
      confirmPassword: 'different',
      agreement: false,
    });

    expect(errors.name).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
    expect(errors.agreement).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const errors = validateCreateWalletForm({
      name: 'MyWallet',
      password: 'password123',
      confirmPassword: 'password123',
      tip: '',
      agreement: true,
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });
});
