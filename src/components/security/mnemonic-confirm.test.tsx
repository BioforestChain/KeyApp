import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestI18nProvider } from '@/test/i18n-mock';
import { MnemonicConfirm } from './mnemonic-confirm';

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>);

const testWords = ['apple', 'banana', 'cherry', 'date', 'elder', 'fig'];

describe('MnemonicConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shuffled word buttons', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    testWords.forEach((word) => {
      expect(screen.getByRole('button', { name: word })).toBeInTheDocument();
    });
  });

  it('shows initial instruction', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);
    expect(screen.getByText('按正确顺序点击下方助记词')).toBeInTheDocument();
  });

  it('shows progress count', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);
    expect(screen.getByText(`已选择 0/${testWords.length}`)).toBeInTheDocument();
  });

  it('adds word to selection when clicked', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'apple' }));

    expect(screen.getByText(`已选择 1/${testWords.length}`)).toBeInTheDocument();
  });

  it('disables word after selection', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    const appleButton = screen.getByRole('button', { name: 'apple' });
    fireEvent.click(appleButton);

    expect(appleButton).toBeDisabled();
  });

  it('calls onComplete when correct order is selected', () => {
    const onComplete = vi.fn();
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={onComplete} />);

    // Select in correct order
    testWords.forEach((word) => {
      fireEvent.click(screen.getByRole('button', { name: word }));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('shows error when incorrect order is selected', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    // Select first word correctly, then wrong ones
    fireEvent.click(screen.getByRole('button', { name: 'apple' }));
    fireEvent.click(screen.getByRole('button', { name: 'cherry' })); // wrong
    fireEvent.click(screen.getByRole('button', { name: 'banana' }));
    fireEvent.click(screen.getByRole('button', { name: 'date' }));
    fireEvent.click(screen.getByRole('button', { name: 'elder' }));
    fireEvent.click(screen.getByRole('button', { name: 'fig' }));

    expect(screen.getByText('助记词顺序错误，请重试')).toBeInTheDocument();
  });

  it('shows success message on correct completion', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    testWords.forEach((word) => {
      fireEvent.click(screen.getByRole('button', { name: word }));
    });

    expect(screen.getByText('助记词验证成功')).toBeInTheDocument();
  });

  it('resets selection when reset button is clicked', () => {
    const onReset = vi.fn();
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: 'apple' }));
    fireEvent.click(screen.getByText('重新选择'));

    expect(screen.getByText(`已选择 0/${testWords.length}`)).toBeInTheDocument();
    expect(onReset).toHaveBeenCalled();
  });

  it('removes last word when undo is clicked', () => {
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'apple' }));
    fireEvent.click(screen.getByRole('button', { name: 'banana' }));

    expect(screen.getByText(`已选择 2/${testWords.length}`)).toBeInTheDocument();

    fireEvent.click(screen.getByText('撤销'));

    expect(screen.getByText(`已选择 1/${testWords.length}`)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MnemonicConfirm words={testWords} onComplete={vi.fn()} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('does not call onComplete when incorrect', () => {
    const onComplete = vi.fn();
    renderWithI18n(<MnemonicConfirm words={testWords} onComplete={onComplete} />);

    // Wrong order
    fireEvent.click(screen.getByRole('button', { name: 'banana' }));
    fireEvent.click(screen.getByRole('button', { name: 'apple' }));
    fireEvent.click(screen.getByRole('button', { name: 'cherry' }));
    fireEvent.click(screen.getByRole('button', { name: 'date' }));
    fireEvent.click(screen.getByRole('button', { name: 'elder' }));
    fireEvent.click(screen.getByRole('button', { name: 'fig' }));

    expect(onComplete).not.toHaveBeenCalled();
  });
});
