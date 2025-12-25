import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactElement } from 'react';
import { PatternLockSetup } from './pattern-lock-setup';
import { TestI18nProvider } from '@/test/i18n-mock';
import { patternToString } from './pattern-lock';

const renderWithI18n = (ui: ReactElement) => {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
};

const mockGridRect = () => {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 300,
    bottom: 300,
    width: 300,
    height: 300,
    toJSON: () => ({}),
  });
};

const drawPattern = (grid: HTMLElement, nodes: number[]) => {
  const size = 3;
  const toClient = (index: number) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const x = ((col + 0.5) / size) * 300;
    const y = ((row + 0.5) / size) * 300;
    return { clientX: x, clientY: y };
  };

  fireEvent.mouseDown(grid, toClient(nodes[0]!));
  nodes.slice(1).forEach((node) => {
    fireEvent.mouseMove(grid, toClient(node));
  });
  fireEvent.mouseUp(grid);
};

describe('PatternLockSetup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('completes when patterns match', () => {
    const onComplete = vi.fn();
    renderWithI18n(<PatternLockSetup onComplete={onComplete} minPoints={4} />);

    const rectSpy = mockGridRect();
    const setGrid = screen.getByTestId('pattern-lock-set-grid');
    const firstPattern = [0, 1, 2, 5];
    drawPattern(setGrid, firstPattern);

    act(() => {
      vi.runAllTimers();
    });

    // 点击下一步进入确认步骤
    fireEvent.click(screen.getByTestId('pattern-lock-next-button'));

    const confirmGrid = screen.getByTestId('pattern-lock-confirm-grid');
    drawPattern(confirmGrid, firstPattern);

    expect(onComplete).toHaveBeenCalledWith(patternToString(firstPattern));
    rectSpy.mockRestore();
  });

  it('shows mismatch message when patterns do not match', () => {
    const onComplete = vi.fn();
    renderWithI18n(<PatternLockSetup onComplete={onComplete} minPoints={4} />);

    const rectSpy = mockGridRect();
    const setGrid = screen.getByTestId('pattern-lock-set-grid');
    drawPattern(setGrid, [0, 1, 2, 5]);

    act(() => {
      vi.runAllTimers();
    });

    // 点击下一步进入确认步骤
    fireEvent.click(screen.getByTestId('pattern-lock-next-button'));

    const confirmGrid = screen.getByTestId('pattern-lock-confirm-grid');
    drawPattern(confirmGrid, [0, 3, 6, 7]);

    expect(screen.getByTestId('pattern-lock-mismatch')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    rectSpy.mockRestore();
  });

  it('allows resetting back to set step', () => {
    renderWithI18n(<PatternLockSetup onComplete={vi.fn()} minPoints={4} />);

    const rectSpy = mockGridRect();
    const setGrid = screen.getByTestId('pattern-lock-set-grid');
    drawPattern(setGrid, [0, 1, 2, 5]);

    act(() => {
      vi.runAllTimers();
    });

    // 点击下一步进入确认步骤
    fireEvent.click(screen.getByTestId('pattern-lock-next-button'));

    // 在确认步骤点击重置按钮
    fireEvent.click(screen.getByTestId('pattern-lock-reset-button'));

    expect(screen.getByTestId('pattern-lock-set-grid')).toBeInTheDocument();
    rectSpy.mockRestore();
  });
});
