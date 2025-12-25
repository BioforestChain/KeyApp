import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PatternLock, patternToString, isValidPattern } from './pattern-lock';
import { expect, within } from '@storybook/test';

const meta: Meta<typeof PatternLock> = {
  title: 'Security/PatternLock',
  component: PatternLock,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    minPoints: {
      control: { type: 'range', min: 2, max: 9, step: 1 },
    },
    size: {
      control: { type: 'range', min: 3, max: 5, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatternLock>;

export const Default: Story = {
  args: {
    minPoints: 4,
    size: 3,
    'data-testid': 'pattern-lock',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nodes = canvas.getAllByRole('checkbox');
    expect(nodes).toHaveLength(9);
  },
};

export const Interactive: Story = {
  render: () => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [completed, setCompleted] = useState(false);
    
    return (
      <div className="space-y-4 w-80">
        <PatternLock
          value={pattern}
          onChange={setPattern}
          onComplete={() => {
            setCompleted(true);
            setTimeout(() => setCompleted(false), 1000);
          }}
          success={completed && pattern.length >= 4}
        />
        <div className="text-center text-sm text-muted-foreground">
          Pattern: {pattern.length > 0 ? patternToString(pattern) : 'None'}
        </div>
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    value: [0, 1, 2, 5],
    error: true,
    minPoints: 4,
  },
};

export const WithSuccess: Story = {
  args: {
    value: [0, 1, 2, 5, 8],
    success: true,
    minPoints: 4,
  },
};

export const Disabled: Story = {
  args: {
    value: [0, 4, 8],
    disabled: true,
    minPoints: 4,
  },
};

export const MinPoints2: Story = {
  args: {
    minPoints: 2,
  },
};

export const Size4x4: Story = {
  args: {
    size: 4,
    minPoints: 6,
  },
};

export const SetAndConfirmFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'set' | 'confirm' | 'done'>('set');
    const [firstPattern, setFirstPattern] = useState<number[]>([]);
    const [secondPattern, setSecondPattern] = useState<number[]>([]);
    const [error, setError] = useState(false);

    const handleFirstComplete = (pattern: number[]) => {
      if (pattern.length >= 4) {
        setFirstPattern(pattern);
        setStep('confirm');
      }
    };

    const handleSecondComplete = (pattern: number[]) => {
      if (pattern.length >= 4) {
        if (patternToString(pattern) === patternToString(firstPattern)) {
          setStep('done');
          setError(false);
        } else {
          setError(true);
          setSecondPattern([]);
          setTimeout(() => setError(false), 1500);
        }
      }
    };

    const reset = () => {
      setStep('set');
      setFirstPattern([]);
      setSecondPattern([]);
      setError(false);
    };

    return (
      <div className="space-y-4 w-80">
        <h3 className="text-lg font-semibold text-center">
          {step === 'set' && '设置钱包锁'}
          {step === 'confirm' && '确认钱包锁'}
          {step === 'done' && '设置成功!'}
        </h3>
        
        {step === 'set' && (
          <PatternLock
            value={firstPattern}
            onChange={setFirstPattern}
            onComplete={handleFirstComplete}
            success={firstPattern.length >= 4}
          />
        )}
        
        {step === 'confirm' && (
          <PatternLock
            value={secondPattern}
            onChange={setSecondPattern}
            onComplete={handleSecondComplete}
            error={error}
          />
        )}
        
        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">✓</div>
            <p className="text-muted-foreground">钱包锁已设置</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              重新设置
            </button>
          </div>
        )}
      </div>
    );
  },
};

// ==================== 安全测试 ====================

/**
 * 安全测试：验证不同顺序的图案被正确区分
 * 图案 [0,1,2,5] 和 [5,2,1,0] 虽然连接相同的点，但顺序不同，应该是不同的图案
 */
export const SecurityDifferentOrder: Story = {
  name: 'Security: Different Order = Different Pattern',
  render: () => {
    const pattern1 = [0, 1, 2, 5];
    const pattern2 = [5, 2, 1, 0];
    const str1 = patternToString(pattern1);
    const str2 = patternToString(pattern2);
    const areDifferent = str1 !== str2;

    return (
      <div className="space-y-6 w-96">
        <div className="text-center">
          <h3 className="font-bold text-lg">Security Test: Pattern Order Matters</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Same points, different order = Different patterns
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Pattern 1: 0→1→2→5</p>
            <PatternLock value={pattern1} disabled />
            <p className="text-xs text-center text-muted-foreground">Key: {str1}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Pattern 2: 5→2→1→0</p>
            <PatternLock value={pattern2} disabled />
            <p className="text-xs text-center text-muted-foreground">Key: {str2}</p>
          </div>
        </div>

        <div className={`text-center p-3 rounded-lg ${areDifferent ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {areDifferent ? '✓ PASS: Patterns are correctly different' : '✗ FAIL: Patterns should be different!'}
        </div>
      </div>
    );
  },
};

/**
 * 安全测试：验证图案唯一性
 * 展示多个不同的图案及其对应的密钥
 */
export const SecurityPatternUniqueness: Story = {
  name: 'Security: Pattern Uniqueness',
  render: () => {
    const patterns = [
      { name: 'L Shape', pattern: [0, 3, 6, 7, 8] },
      { name: 'Z Shape', pattern: [0, 1, 2, 4, 6, 7, 8] },
      { name: 'Square', pattern: [0, 1, 2, 5, 8, 7, 6, 3] },
      { name: 'Cross', pattern: [1, 4, 3, 4, 5, 4, 7] },
      { name: 'Diagonal', pattern: [0, 4, 8] },
      { name: 'Reverse Diagonal', pattern: [8, 4, 0] },
    ];

    const keys = patterns.map(p => patternToString(p.pattern));
    const uniqueKeys = new Set(keys);
    const allUnique = uniqueKeys.size === keys.length;

    return (
      <div className="space-y-4 w-full max-w-2xl">
        <div className="text-center">
          <h3 className="font-bold text-lg">Security Test: All Patterns Must Be Unique</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {patterns.map((p, i) => (
            <div key={i} className="space-y-1 p-2 border rounded-lg">
              <p className="text-xs font-medium text-center">{p.name}</p>
              <div className="w-24 mx-auto">
                <PatternLock value={p.pattern} disabled className="scale-75 origin-top" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground font-mono">{keys[i]}</p>
            </div>
          ))}
        </div>

        <div className={`text-center p-3 rounded-lg ${allUnique ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {allUnique 
            ? `✓ PASS: All ${keys.length} patterns have unique keys` 
            : `✗ FAIL: Found duplicate keys!`}
        </div>
      </div>
    );
  },
};

/**
 * 安全测试：验证 isValidPattern 函数
 */
export const SecurityValidation: Story = {
  name: 'Security: Pattern Validation',
  render: () => {
    const testCases = [
      { pattern: [0, 1, 2, 5], expected: true, desc: 'Valid: 4 points' },
      { pattern: [0, 1, 2], expected: false, desc: 'Invalid: Only 3 points' },
      { pattern: [0, 1, 1, 2], expected: false, desc: 'Invalid: Duplicate node' },
      { pattern: [0, 1, 9, 2], expected: false, desc: 'Invalid: Out of range (9)' },
      { pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8], expected: true, desc: 'Valid: All 9 points' },
      { pattern: [], expected: false, desc: 'Invalid: Empty pattern' },
    ];

    const results = testCases.map(tc => ({
      ...tc,
      actual: isValidPattern(tc.pattern),
      pass: isValidPattern(tc.pattern) === tc.expected,
    }));

    const allPass = results.every(r => r.pass);

    return (
      <div className="space-y-4 w-full max-w-md">
        <h3 className="font-bold text-lg text-center">Security Test: Pattern Validation</h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Test Case</th>
              <th className="text-center">Expected</th>
              <th className="text-center">Actual</th>
              <th className="text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{r.desc}</td>
                <td className="text-center">{r.expected ? '✓' : '✗'}</td>
                <td className="text-center">{r.actual ? '✓' : '✗'}</td>
                <td className="text-center">{r.pass ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={`text-center p-3 rounded-lg ${allPass ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {allPass ? '✓ All validation tests passed' : '✗ Some validation tests failed'}
        </div>
      </div>
    );
  },
};

// ==================== 边界测试 ====================

/**
 * 边界测试：最小有效图案 (正好 4 个点)
 */
export const BoundaryMinPoints: Story = {
  name: 'Boundary: Minimum Points (4)',
  args: {
    value: [0, 1, 2, 5],
    minPoints: 4,
    success: true,
  },
};

/**
 * 边界测试：最大图案 (所有 9 个点)
 */
export const BoundaryMaxPoints: Story = {
  name: 'Boundary: Maximum Points (9)',
  args: {
    value: [0, 1, 2, 5, 8, 7, 6, 3, 4],
    minPoints: 4,
    success: true,
  },
};

/**
 * 边界测试：少于最小点数
 */
export const BoundaryBelowMin: Story = {
  name: 'Boundary: Below Minimum (3 of 4)',
  args: {
    value: [0, 1, 2],
    minPoints: 4,
  },
};

// ==================== 可访问性测试 ====================

/**
 * 可访问性：键盘导航测试
 */
export const AccessibilityKeyboard: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => {
    const [pattern, setPattern] = useState<number[]>([]);
    
    return (
      <div className="space-y-4 w-80">
        <div className="text-center">
          <h3 className="font-bold">Keyboard Navigation Test</h3>
          <p className="text-sm text-muted-foreground">
            Use Tab to navigate, Space/Enter to select
          </p>
        </div>
        
        <PatternLock
          value={pattern}
          onChange={setPattern}
          data-testid="keyboard-test"
        />
        
        <div className="text-center text-sm">
          Selected: {pattern.length > 0 ? patternToString(pattern) : 'None'}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Note: Only the last selected node can be deselected via keyboard
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nodes = canvas.getAllByRole('checkbox');
    
    // Verify all nodes are accessible
    expect(nodes).toHaveLength(9);
    
    // Each node should have an aria-label
    for (const node of nodes) {
      expect(node).toHaveAttribute('aria-label');
    }
  },
};

/**
 * 可访问性：屏幕阅读器标签测试
 */
export const AccessibilityLabels: Story = {
  name: 'Accessibility: Screen Reader Labels',
  args: {
    value: [0, 4, 8],
    'data-testid': 'a11y-test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Grid should have aria-label
    const grid = canvas.getByRole('group');
    expect(grid).toHaveAttribute('aria-label');
    
    // Selected nodes should have order info in label
    const nodes = canvas.getAllByRole('checkbox');
    const selectedNodes = nodes.filter(n => (n as HTMLInputElement).checked);
    expect(selectedNodes).toHaveLength(3);
  },
};

// ==================== 主题测试 ====================

/**
 * 主题测试：暗色模式
 */
export const ThemeDark: Story = {
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    value: [0, 1, 2, 5, 8],
    success: true,
  },
};

/**
 * 主题测试：错误状态在暗色模式
 */
export const ThemeDarkError: Story = {
  name: 'Theme: Dark Mode Error',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    value: [0, 1, 2, 5],
    error: true,
  },
};
