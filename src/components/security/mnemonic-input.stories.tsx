import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MnemonicInput } from './mnemonic-input';
import { GradientButton } from '../common/gradient-button';

const meta: Meta<typeof MnemonicInput> = {
  title: 'Security/MnemonicInput',
  component: MnemonicInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MnemonicInput>;

export const Default: Story = {
  args: {
    wordCount: 12,
    onComplete: (words) => alert(`Complete: ${words.join(' ')}`),
  },
};

export const Words24: Story = {
  args: {
    wordCount: 24,
    onComplete: (words) => console.log('Complete:', words),
  },
};

export const WithSubmit: Story = {
  render: () => {
    const [words, setWords] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    return (
      <div className="space-y-4">
        <MnemonicInput
          wordCount={12}
          onChange={(w, complete) => {
            setWords(w);
            setIsComplete(complete);
          }}
        />
        <GradientButton fullWidth disabled={!isComplete} onClick={() => alert(`导入: ${words.join(' ')}`)}>
          导入钱包
        </GradientButton>
        <p className="text-muted-foreground text-center text-xs">提示：可以直接粘贴完整的助记词</p>
      </div>
    );
  },
};

export const ImportFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'input' | 'success'>('input');
    const [words, setWords] = useState<string[]>([]);

    if (step === 'success') {
      return (
        <div className="space-y-4 py-8 text-center">
          <div className="bg-green-500/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <svg className="text-green-500 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">钱包导入成功</p>
          <p className="text-muted-foreground text-sm">共导入 {words.length} 个单词</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-medium">导入钱包</h3>
          <p className="text-muted-foreground mt-1 text-sm">请输入您的助记词</p>
        </div>
        <MnemonicInput
          wordCount={12}
          onComplete={(w) => {
            setWords(w);
            setStep('success');
          }}
        />
      </div>
    );
  },
};
