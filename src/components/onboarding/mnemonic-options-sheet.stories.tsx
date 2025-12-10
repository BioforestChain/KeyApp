import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MnemonicOptionsSheet } from './mnemonic-options-sheet';
import type { MnemonicOptions } from './create-wallet-form';

const meta: Meta<typeof MnemonicOptionsSheet> = {
  title: 'Onboarding/MnemonicOptionsSheet',
  component: MnemonicOptionsSheet,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MnemonicOptionsSheet>;

export const Default: Story = {
  args: {
    open: true,
    value: { language: 'english', length: 12 },
    onClose: () => console.log('Close'),
    onConfirm: (options) => console.log('Confirm:', options),
  },
};

export const WithChineseSimplified: Story = {
  args: {
    open: true,
    value: { language: 'zh-Hans', length: 24 },
    onClose: () => console.log('Close'),
    onConfirm: (options) => console.log('Confirm:', options),
  },
};

export const WithChineseTraditional: Story = {
  args: {
    open: true,
    value: { language: 'zh-Hant', length: 15 },
    onClose: () => console.log('Close'),
    onConfirm: (options) => console.log('Confirm:', options),
  },
};

export const WithLongMnemonic: Story = {
  args: {
    open: true,
    value: { language: 'english', length: 36 },
    onClose: () => console.log('Close'),
    onConfirm: (options) => console.log('Confirm:', options),
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<MnemonicOptions>({
      language: 'english',
      length: 12,
    });

    const languageLabels = {
      english: 'English',
      'zh-Hans': '中文（简体）',
      'zh-Hant': '中文（繁體）',
    };

    return (
      <div className="space-y-4 p-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">当前选择</h3>
          <p className="text-sm text-muted-foreground">
            语言：{languageLabels[options.language]}
          </p>
          <p className="text-sm text-muted-foreground">词数：{options.length} 词</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary px-6 py-2 text-white"
        >
          修改助记词设置
        </button>

        <MnemonicOptionsSheet
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={setOptions}
          value={options}
        />
      </div>
    );
  },
};
