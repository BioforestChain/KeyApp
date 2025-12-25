import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternLock, patternToString, stringToPattern, isValidPattern } from './pattern-lock';
import { TestI18nProvider, testI18n } from '@/test/i18n-mock';

const renderWithI18n = (ui: ReactElement) => {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
};

describe('PatternLock', () => {
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

  it('renders 9 nodes for 3x3 grid', () => {
    renderWithI18n(<PatternLock data-testid="pattern-lock" />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(9);
  });

  it('shows hint when no pattern is selected', () => {
    renderWithI18n(<PatternLock minPoints={4} />);
    expect(screen.getByText(testI18n.t('security:patternLock.hint', { min: 4 }))).toBeInTheDocument();
  });

  it('shows pattern status when nodes are selected', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2]} minPoints={4} />);
    expect(
      screen.getByText(testI18n.t('security:patternLock.needMore', { current: 3, min: 4 }))
    ).toBeInTheDocument();
  });

  it('shows valid message when minimum points reached', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2, 5]} minPoints={4} />);
    expect(screen.getByText(testI18n.t('security:patternLock.valid', { count: 4 }))).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2, 5]} error />);
    expect(screen.getByText(testI18n.t('security:patternLock.error'))).toBeInTheDocument();
  });

  it('shows success state', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2, 5]} success />);
    expect(screen.getByText(testI18n.t('security:patternLock.success'))).toBeInTheDocument();
  });

  it('calls onChange and onComplete when drawing a pattern', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    renderWithI18n(<PatternLock onChange={onChange} onComplete={onComplete} data-testid="pattern-lock" />);
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
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
    const grid = screen.getByTestId('pattern-lock-grid');

    drawPattern(grid, [0, 1, 2, 5]);

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith([0, 1, 2, 5]);
    expect(onComplete).toHaveBeenCalledWith([0, 1, 2, 5]);
    rectSpy.mockRestore();
  });

  it('shows clear button when pattern exists', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2]} />);
    expect(screen.getByText(testI18n.t('security:patternLock.clear'))).toBeInTheDocument();
  });

  it('does not show clear button when disabled', () => {
    renderWithI18n(<PatternLock value={[0, 1, 2]} disabled />);
    expect(screen.queryByText(testI18n.t('security:patternLock.clear'))).not.toBeInTheDocument();
  });

  it('clears pattern when clear button is clicked', () => {
    const onChange = vi.fn();
    renderWithI18n(<PatternLock value={[0, 1, 2]} onChange={onChange} />);
    
    fireEvent.click(screen.getByText(testI18n.t('security:patternLock.clear')));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('supports keyboard selection and enforces last-node removal', () => {
    renderWithI18n(<PatternLock data-testid="pattern-lock" />);

    const node0 = screen.getByTestId('pattern-lock-node-0');
    const node1 = screen.getByTestId('pattern-lock-node-1');

    fireEvent.keyDown(node0, { key: ' ', code: 'Space' });
    fireEvent.keyDown(node1, { key: ' ', code: 'Space' });

    expect(node0).toBeChecked();
    expect(node1).toBeChecked();

    // Attempt to remove a non-last node should be ignored
    fireEvent.keyDown(node0, { key: ' ', code: 'Space' });
    expect(node0).toBeChecked();

    // Remove last node should work
    fireEvent.keyDown(node1, { key: ' ', code: 'Space' });
    expect(node1).not.toBeChecked();
    expect(node0).toBeChecked();
  });

  it('ignores pointer interactions when disabled', () => {
    const onChange = vi.fn();
    renderWithI18n(<PatternLock data-testid="pattern-lock" disabled onChange={onChange} />);
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
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
    const grid = screen.getByTestId('pattern-lock-grid');

    drawPattern(grid, [0, 1, 2, 5]);
    expect(onChange).not.toHaveBeenCalled();
    rectSpy.mockRestore();
  });
});

describe('patternToString', () => {
  it('converts pattern array to string', () => {
    expect(patternToString([0, 1, 2, 5])).toBe('0-1-2-5');
  });

  it('handles empty array', () => {
    expect(patternToString([])).toBe('');
  });

  it('handles single element', () => {
    expect(patternToString([4])).toBe('4');
  });
});

describe('stringToPattern', () => {
  it('converts string to pattern array', () => {
    expect(stringToPattern('0-1-2-5')).toEqual([0, 1, 2, 5]);
  });

  it('handles empty string', () => {
    expect(stringToPattern('')).toEqual([]);
  });

  it('handles single element', () => {
    expect(stringToPattern('4')).toEqual([4]);
  });

  it('filters invalid values', () => {
    expect(stringToPattern('0-a-2')).toEqual([0, 2]);
  });
});

describe('isValidPattern', () => {
  it('returns true for valid pattern', () => {
    expect(isValidPattern([0, 1, 2, 5], 4)).toBe(true);
  });

  it('returns false for pattern with too few points', () => {
    expect(isValidPattern([0, 1, 2], 4)).toBe(false);
  });

  it('returns false for pattern with duplicates', () => {
    expect(isValidPattern([0, 1, 1, 2], 4)).toBe(false);
  });

  it('returns false for pattern with out of range values', () => {
    expect(isValidPattern([0, 1, 9, 2], 4)).toBe(false);
  });

  it('uses default minPoints of 4', () => {
    expect(isValidPattern([0, 1, 2])).toBe(false);
    expect(isValidPattern([0, 1, 2, 5])).toBe(true);
  });
});
