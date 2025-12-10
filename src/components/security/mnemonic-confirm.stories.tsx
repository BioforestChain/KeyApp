import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MnemonicConfirm } from './mnemonic-confirm';

const meta: Meta<typeof MnemonicConfirm> = {
  title: 'Security/MnemonicConfirm',
  component: MnemonicConfirm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MnemonicConfirm>;

const words12 = [
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

const words24 = [
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
  'account',
  'accuse',
  'achieve',
  'acid',
  'acoustic',
  'acquire',
  'across',
  'act',
  'action',
  'actor',
  'actress',
  'actual',
];

export const Default: Story = {
  args: {
    words: words12,
    onComplete: () => console.log('Complete!'),
  },
};

export const Words24: Story = {
  args: {
    words: words24,
    onComplete: () => console.log('Complete!'),
  },
};

export const ShortWords: Story = {
  args: {
    words: ['apple', 'banana', 'cherry', 'date'],
    onComplete: () => console.log('Complete!'),
  },
};

export const Interactive: Story = {
  render: () => {
    const [completed, setCompleted] = useState(false);
    const [key, setKey] = useState(0);

    const handleComplete = () => {
      setCompleted(true);
    };

    const handleRestart = () => {
      setCompleted(false);
      setKey((k) => k + 1);
    };

    if (completed) {
      return (
        <div className="space-y-4 text-center">
          <div className="rounded-xl bg-green-100 p-6 dark:bg-green-900/30">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              🎉 验证成功！
            </p>
            <p className="mt-2 text-sm text-green-600 dark:text-green-300">助记词已确认备份</p>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-lg bg-primary px-4 py-2 text-white"
          >
            再试一次
          </button>
        </div>
      );
    }

    return (
      <MnemonicConfirm
        key={key}
        words={['apple', 'banana', 'cherry', 'date', 'elder', 'fig']}
        onComplete={handleComplete}
      />
    );
  },
};

export const InOnboardingFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'show' | 'confirm' | 'done'>('show');
    const words = ['ocean', 'wisdom', 'garden', 'silent', 'brave', 'crystal'];

    if (step === 'show') {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">请备份您的助记词</h2>
          <p className="text-sm text-muted-foreground">
            请按顺序抄写以下助记词，并妥善保管。
          </p>
          <div className="grid grid-cols-3 gap-2">
            {words.map((word, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center"
              >
                <span className="text-xs text-muted-foreground">{i + 1}.</span>{' '}
                <span className="font-medium">{word}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep('confirm')}
            className="w-full rounded-full bg-primary py-3 text-white"
          >
            我已备份，下一步
          </button>
        </div>
      );
    }

    if (step === 'confirm') {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">验证助记词</h2>
          <p className="text-sm text-muted-foreground">请按正确顺序点击助记词以验证备份。</p>
          <MnemonicConfirm words={words} onComplete={() => setStep('done')} />
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-green-100 p-6 dark:bg-green-900/30">
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">
            ✅ 备份完成！
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep('show')}
          className="text-sm text-muted-foreground"
        >
          重新开始
        </button>
      </div>
    );
  },
};
