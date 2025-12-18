import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MnemonicOptionsSheet } from './mnemonic-options-sheet';
import type { MnemonicOptions } from './create-wallet-form';
import { TestI18nProvider } from '@/test/i18n-mock';

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
}

describe('MnemonicOptionsSheet', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultValue: MnemonicOptions = {
    language: 'english',
    length: 12,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and sections', () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    expect(screen.getByText('助记词设置')).toBeInTheDocument();
    expect(screen.getByText('语言')).toBeInTheDocument();
    expect(screen.getByText('词数')).toBeInTheDocument();
  });

  it('renders all language options', () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('中文（简体）')).toBeInTheDocument();
    expect(screen.getByText('中文（繁體）')).toBeInTheDocument();
  });

  it('renders all length options', () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    expect(screen.getByText('12 词')).toBeInTheDocument();
    expect(screen.getByText('15 词')).toBeInTheDocument();
    expect(screen.getByText('18 词')).toBeInTheDocument();
    expect(screen.getByText('21 词')).toBeInTheDocument();
    expect(screen.getByText('24 词')).toBeInTheDocument();
    expect(screen.getByText('36 词')).toBeInTheDocument();
  });

  it('shows selected language with check mark', () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={{ language: 'english', length: 12 }}
      />,
    );

    const englishButton = screen.getByRole('radio', { name: 'English' });
    expect(englishButton).toHaveAttribute('aria-checked', 'true');
  });

  it('shows selected length highlighted', () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={{ language: 'english', length: 24 }}
      />,
    );

    const length24Button = screen.getByRole('radio', { name: '24 词' });
    expect(length24Button).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onConfirm with new language when language is selected', async () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    await userEvent.click(screen.getByText('中文（简体）'));

    expect(mockOnConfirm).toHaveBeenCalledWith({
      language: 'zh-Hans',
      length: 12,
    });
  });

  it('calls onConfirm with new length when length is selected', async () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    await userEvent.click(screen.getByText('24 词'));

    expect(mockOnConfirm).toHaveBeenCalledWith({
      language: 'english',
      length: 24,
    });
  });

  it('calls onClose when confirm button is clicked', async () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '确定' }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('preserves existing values when selecting new language', async () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={{ language: 'english', length: 24 }}
      />,
    );

    await userEvent.click(screen.getByText('中文（繁體）'));

    expect(mockOnConfirm).toHaveBeenCalledWith({
      language: 'zh-Hant',
      length: 24, // preserved
    });
  });

  it('preserves existing values when selecting new length', async () => {
    render(
      <MnemonicOptionsSheet
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={{ language: 'zh-Hans', length: 12 }}
      />,
    );

    await userEvent.click(screen.getByText('36 词'));

    expect(mockOnConfirm).toHaveBeenCalledWith({
      language: 'zh-Hans', // preserved
      length: 36,
    });
  });

  it('does not render when closed', () => {
    render(
      <MnemonicOptionsSheet
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        value={defaultValue}
      />,
    );

    expect(screen.queryByText('助记词设置')).not.toBeInTheDocument();
  });
});
