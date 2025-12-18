import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestI18nProvider } from '@/test/i18n-mock';
import { MnemonicConfirmBackup } from './mnemonic-confirm-backup';
import type { VerificationSlot } from '@/hooks/use-mnemonic-verification';

describe('MnemonicConfirmBackup', () => {
  const mockSlots: VerificationSlot[] = [
    { position: 2, expectedWord: 'able', selectedWord: null, isCorrect: null },
    { position: 5, expectedWord: 'absent', selectedWord: null, isCorrect: null },
    { position: 8, expectedWord: 'absurd', selectedWord: null, isCorrect: null },
    { position: 11, expectedWord: 'accident', selectedWord: null, isCorrect: null },
  ];

  const mockCandidates = [
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    'absent',
    'absorb',
    'abstract',
    'absurd',
    'abuse',
    'access',
    'accident',
  ];

  const defaultProps = {
    slots: mockSlots,
    candidates: mockCandidates,
    usedWords: new Set<string>(),
    nextEmptySlotIndex: 0,
    isComplete: false,
    onSelectWord: vi.fn(),
    onDeselectSlot: vi.fn(),
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    expect(screen.getByText('确认助记词')).toBeInTheDocument();
  });

  it('renders all verification slots', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders all candidate words', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    mockCandidates.forEach((word) => {
      expect(screen.getByText(word)).toBeInTheDocument();
    });
  });

  it('highlights active slot', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    expect(screen.getByText('请选择第 3 个单词')).toBeInTheDocument();
  });

  it('calls onSelectWord when clicking a candidate', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    fireEvent.click(screen.getByText('able'));
    expect(defaultProps.onSelectWord).toHaveBeenCalledWith('able');
  });

  it('disables used words', () => {
    const usedWords = new Set(['able', 'absent']);
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} usedWords={usedWords} />
      </TestI18nProvider>,
    );

    const ableButton = screen.getByRole('button', { name: 'able' });
    expect(ableButton).toBeDisabled();
  });

  it('shows correct status icon for correct selection', () => {
    const slotsWithCorrect: VerificationSlot[] = [
      { position: 2, expectedWord: 'able', selectedWord: 'able', isCorrect: true },
      ...mockSlots.slice(1),
    ];
    const usedWords = new Set(['able']);
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} slots={slotsWithCorrect} usedWords={usedWords} nextEmptySlotIndex={1} />
      </TestI18nProvider>,
    );
    const greenTexts = screen.getAllByText('able');
    expect(greenTexts.some((el) => el.classList.contains('text-green-700'))).toBe(true);
  });

  it('shows error status for incorrect selection', () => {
    const slotsWithError: VerificationSlot[] = [
      { position: 2, expectedWord: 'able', selectedWord: 'about', isCorrect: false },
      ...mockSlots.slice(1),
    ];
    const usedWords = new Set(['about']);
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} slots={slotsWithError} usedWords={usedWords} nextEmptySlotIndex={1} />
      </TestI18nProvider>,
    );
    const aboutTexts = screen.getAllByText('about');
    expect(aboutTexts.some((el) => el.classList.contains('text-red-700'))).toBe(true);
  });

  it('calls onDeselectSlot when clicking incorrect selection', () => {
    const slotsWithError: VerificationSlot[] = [
      { position: 2, expectedWord: 'able', selectedWord: 'about', isCorrect: false },
      ...mockSlots.slice(1),
    ];
    const usedWords = new Set(['about']);
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} slots={slotsWithError} usedWords={usedWords} nextEmptySlotIndex={1} />
      </TestI18nProvider>,
    );
    const aboutTexts = screen.getAllByText('about');
    const errorText = aboutTexts.find((el) => el.classList.contains('text-red-700'));
    const errorSlot = errorText?.closest('[role="button"]');
    if (errorSlot) {
      fireEvent.click(errorSlot);
      expect(defaultProps.onDeselectSlot).toHaveBeenCalledWith(0);
    }
  });

  it('disables complete button when not complete', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} />
      </TestI18nProvider>,
    );
    const completeButton = screen.getByText('请完成验证');
    expect(completeButton).toBeDisabled();
  });

  it('enables complete button when complete', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} isComplete={true} />
      </TestI18nProvider>,
    );
    const completeButton = screen.getByText('完成备份');
    expect(completeButton).not.toBeDisabled();
  });

  it('shows success message when complete', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} isComplete={true} />
      </TestI18nProvider>,
    );
    expect(screen.getByText(/验证成功/)).toBeInTheDocument();
  });

  it('calls onComplete when clicking complete button', () => {
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} isComplete={true} />
      </TestI18nProvider>,
    );
    fireEvent.click(screen.getByText('完成备份'));
    expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows hint for wrong selections', () => {
    const slotsWithError: VerificationSlot[] = [
      { position: 2, expectedWord: 'able', selectedWord: 'about', isCorrect: false },
      ...mockSlots.slice(1),
    ];
    render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} slots={slotsWithError} />
      </TestI18nProvider>,
    );
    expect(screen.getByText(/点击红色选项可重新选择/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestI18nProvider>
        <MnemonicConfirmBackup {...defaultProps} className="custom-class" />
      </TestI18nProvider>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
