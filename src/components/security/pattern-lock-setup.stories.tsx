import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PatternLockSetup } from './pattern-lock-setup';
import { expect, within, fn } from '@storybook/test';

const meta: Meta<typeof PatternLockSetup> = {
  title: 'Security/PatternLockSetup',
  component: PatternLockSetup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PatternLockSetup>;

export const Default: Story = {
  args: {
    onComplete: fn(),
    minPoints: 4,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('pattern-lock-set-grid')).toBeInTheDocument();
  },
};

/**
 * 完整流程演示
 */
export const FullFlow: Story = {
  name: 'Full Setup Flow',
  render: () => {
    const [result, setResult] = useState<string | null>(null);

    if (result) {
      return (
        <div className="w-80 text-center space-y-4">
          <div className="text-6xl text-green-500">✓</div>
          <h3 className="font-bold text-lg">Pattern Set Successfully</h3>
          <p className="text-sm text-muted-foreground">
            Pattern Key: <code className="bg-muted px-2 py-1 rounded">{result}</code>
          </p>
          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="w-80">
        <PatternLockSetup onComplete={setResult} minPoints={4} />
      </div>
    );
  },
};

/**
 * 最小点数为 2
 */
export const MinPoints2: Story = {
  name: 'Minimum 2 Points',
  args: {
    onComplete: fn(),
    minPoints: 2,
  },
};

/**
 * 最小点数为 6
 */
export const MinPoints6: Story = {
  name: 'Minimum 6 Points',
  args: {
    onComplete: fn(),
    minPoints: 6,
  },
};

/**
 * 暗色主题
 */
export const ThemeDark: Story = {
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8 rounded-lg w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    onComplete: fn(),
    minPoints: 4,
  },
};

/**
 * 安全测试说明
 */
export const SecurityNotes: Story = {
  name: 'Security: Pattern Requirements',
  render: () => {
    return (
      <div className="w-96 space-y-6">
        <div className="text-center">
          <h3 className="font-bold text-lg">Pattern Lock Security</h3>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">✓ Security Features</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Minimum 4 points required by default</li>
              <li>Order matters: [0,1,2,5] ≠ [5,2,1,0]</li>
              <li>No duplicate points allowed</li>
              <li>Must confirm pattern twice</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Pattern Complexity</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>4 points: 7,152 combinations</li>
              <li>5 points: 56,520 combinations</li>
              <li>6 points: 361,152 combinations</li>
              <li>9 points: 985,824 combinations</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <PatternLockSetup onComplete={(key) => alert(`Pattern: ${key}`)} minPoints={4} />
        </div>
      </div>
    );
  },
};
