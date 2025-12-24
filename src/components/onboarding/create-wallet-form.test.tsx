import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWalletForm, validateCreateWalletForm } from './create-wallet-form';
import { TestI18nProvider, testI18n } from '@/test/i18n-mock';

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
}

describe('CreateWalletForm', () => {
  const t = testI18n.t.bind(testI18n);
  const nameLabel = t('onboarding:create.form.walletName');
  const namePlaceholder = t('onboarding:create.form.walletNamePlaceholder');
  const walletLockPlaceholder = t('onboarding:create.form.walletLockPlaceholder');
  const confirmWalletLockPlaceholder = t('onboarding:create.form.confirmWalletLockPlaceholder');
  const walletLockTipPlaceholder = t('onboarding:create.form.walletLockTipPlaceholder');
  const userAgreement = t('onboarding:create.form.userAgreement');
  const createWalletLabel = t('onboarding:create.form.createWallet');
  const creatingLabel = t('onboarding:create.form.creating');
  const mnemonicWords = t('onboarding:create.form.mnemonicWords');
  const englishLabel = t('common:english');
  const zhHansLabel = t('common:中文（简体）');
  const mockOnSubmit = vi.fn();
  const mockOnOpenMnemonicOptions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText(nameLabel)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(namePlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(walletLockPlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(confirmWalletLockPlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(walletLockTipPlaceholder)).toBeInTheDocument();
    expect(screen.getByText(userAgreement)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: createWalletLabel })).toBeInTheDocument();
  });

  it('shows mnemonic options button with default values', () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText(`${englishLabel} · 12 ${mnemonicWords}`)).toBeInTheDocument();
  });

  it('shows custom mnemonic options', () => {
    render(
      <CreateWalletForm
        onSubmit={mockOnSubmit}
        mnemonicOptions={{ language: 'zh-Hans', length: 24 }}
      />,
    );

    expect(screen.getByText(`${zhHansLabel} · 24 ${mnemonicWords}`)).toBeInTheDocument();
  });

  it('calls onOpenMnemonicOptions when mnemonic button is clicked', async () => {
    render(
      <CreateWalletForm onSubmit={mockOnSubmit} onOpenMnemonicOptions={mockOnOpenMnemonicOptions} />,
    );

    await userEvent.click(screen.getByText(`${englishLabel} · 12 ${mnemonicWords}`));
    expect(mockOnOpenMnemonicOptions).toHaveBeenCalledTimes(1);
  });

  it('shows name character counter', async () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByPlaceholderText(namePlaceholder);
    await userEvent.type(nameInput, '测试钱包');

    expect(screen.getByText('4/12')).toBeInTheDocument();
  });

  it('disables submit button when form is invalid', () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: createWalletLabel });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid', async () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} />);

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(namePlaceholder), 'MyWallet');
    await user.type(screen.getByPlaceholderText(walletLockPlaceholder), 'password123');
    await user.type(screen.getByPlaceholderText(confirmWalletLockPlaceholder), 'password123');
    await user.click(screen.getByRole('checkbox'));

    const submitButton = screen.getByRole('button', { name: createWalletLabel });
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

    await user.type(screen.getByPlaceholderText(namePlaceholder), 'MyWallet');
    await user.type(screen.getByPlaceholderText(walletLockPlaceholder), 'password123');
    await user.type(screen.getByPlaceholderText(confirmWalletLockPlaceholder), 'password123');
    await user.type(screen.getByPlaceholderText(walletLockTipPlaceholder), 'hint');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: createWalletLabel }));

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
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} isSubmitting />);

    expect(screen.getByRole('button', { name: creatingLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: creatingLabel })).toBeDisabled();
  });

  it('disables all inputs when submitting', () => {
    renderWithProviders(<CreateWalletForm onSubmit={mockOnSubmit} isSubmitting />);

    expect(screen.getByPlaceholderText(namePlaceholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(walletLockPlaceholder)).toBeDisabled();
    expect(screen.getByPlaceholderText(confirmWalletLockPlaceholder)).toBeDisabled();
  });
});

describe('validateCreateWalletForm', () => {
  const mockT = (key: string) => key;

  it('returns error for empty name', () => {
    const errors = validateCreateWalletForm({ name: '' }, mockT);
    expect(errors.name).toBe('onboarding:create.form.walletNameRequired');
  });

  it('returns error for name with only spaces', () => {
    const errors = validateCreateWalletForm({ name: '   ' }, mockT);
    expect(errors.name).toBe('onboarding:create.form.walletNameRequired');
  });

  it('returns error for name exceeding 12 chars', () => {
    const errors = validateCreateWalletForm({ name: '这是一个很长的钱包名称超过十二个字符' }, mockT);
    expect(errors.name).toBe('onboarding:create.form.walletNameTooLong');
  });

  it('returns no error for valid name', () => {
    const errors = validateCreateWalletForm({ name: '我的钱包' }, mockT);
    expect(errors.name).toBeUndefined();
  });

  it('returns error for empty password', () => {
    const errors = validateCreateWalletForm({ password: '' }, mockT);
    expect(errors.password).toBe('onboarding:create.form.walletLockRequired');
  });

  it('returns error for password less than 8 chars', () => {
    const errors = validateCreateWalletForm({ password: 'short' }, mockT);
    expect(errors.password).toBe('onboarding:create.form.walletLockTooShort');
  });

  it('returns error for password more than 30 chars', () => {
    const errors = validateCreateWalletForm({ password: 'a'.repeat(31) }, mockT);
    expect(errors.password).toBe('onboarding:create.form.walletLockTooLong');
  });

  it('returns error for password with whitespace', () => {
    const errors = validateCreateWalletForm({ password: 'pass word123' }, mockT);
    expect(errors.password).toBe('onboarding:create.form.walletLockNoSpaces');
  });

  it('returns no error for valid password', () => {
    const errors = validateCreateWalletForm({ password: 'validpassword123' }, mockT);
    expect(errors.password).toBeUndefined();
  });

  it('returns error for empty confirm password', () => {
    const errors = validateCreateWalletForm({ password: 'password123', confirmPassword: '' }, mockT);
    expect(errors.confirmPassword).toBe('onboarding:create.form.confirmWalletLockRequired');
  });

  it('returns error for mismatched passwords', () => {
    const errors = validateCreateWalletForm({
      password: 'password123',
      confirmPassword: 'password456',
  }, mockT);
    expect(errors.confirmPassword).toBe('onboarding:create.form.confirmWalletLockMismatch');
  });

  it('returns no error for matching passwords', () => {
    const errors = validateCreateWalletForm({
      password: 'password123',
      confirmPassword: 'password123',
    }, mockT);
    expect(errors.confirmPassword).toBeUndefined();
  });

  it('returns error for tip exceeding 50 chars', () => {
    const errors = validateCreateWalletForm({ tip: 'a'.repeat(51) }, mockT);
    expect(errors.tip).toBe('onboarding:create.form.walletLockTipTooLong');
  });

  it('returns no error for empty tip', () => {
    const errors = validateCreateWalletForm({ tip: '' }, mockT);
    expect(errors.tip).toBeUndefined();
  });

  it('returns error for unchecked agreement', () => {
    const errors = validateCreateWalletForm({ agreement: false }, mockT);
    expect(errors.agreement).toBe('onboarding:create.form.agreementRequired');
  });

  it('returns no error for checked agreement', () => {
    const errors = validateCreateWalletForm({ agreement: true }, mockT);
    expect(errors.agreement).toBeUndefined();
  });

  it('returns multiple errors for invalid form', () => {
    const errors = validateCreateWalletForm({
      name: '',
      password: 'short',
      confirmPassword: 'different',
      agreement: false,
    }, mockT);

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
    }, mockT);

    expect(Object.keys(errors)).toHaveLength(0);
  });
});
