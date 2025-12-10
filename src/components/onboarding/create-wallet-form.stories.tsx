import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CreateWalletForm, type MnemonicOptions } from './create-wallet-form';

const meta: Meta<typeof CreateWalletForm> = {
  title: 'Onboarding/CreateWalletForm',
  component: CreateWalletForm,
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
type Story = StoryObj<typeof CreateWalletForm>;

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onOpenMnemonicOptions: () => console.log('Open mnemonic options'),
  },
};

export const WithChineseMnemonic: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onOpenMnemonicOptions: () => console.log('Open mnemonic options'),
    mnemonicOptions: {
      language: 'zh-Hans',
      length: 24,
    },
  },
};

export const Submitting: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    isSubmitting: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [result, setResult] = useState<string | null>(null);
    const [mnemonicOptions, setMnemonicOptions] = useState<MnemonicOptions>({
      language: 'english',
      length: 12,
    });
    const [showOptions, setShowOptions] = useState(false);

    return (
      <div className="space-y-4">
        <CreateWalletForm
          onSubmit={(data) => {
            setResult(JSON.stringify(data, null, 2));
          }}
          onOpenMnemonicOptions={() => setShowOptions(true)}
          mnemonicOptions={mnemonicOptions}
        />

        {showOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <div className="w-full max-w-md rounded-t-xl bg-background p-4">
              <h3 className="mb-4 text-lg font-semibold">助记词设置</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">语言</p>
                  <div className="flex gap-2">
                    {(['english', 'zh-Hans', 'zh-Hant'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setMnemonicOptions((o) => ({ ...o, language: lang }))}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          mnemonicOptions.language === lang
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {lang === 'english' ? 'English' : lang === 'zh-Hans' ? '简体' : '繁體'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">长度</p>
                  <div className="flex flex-wrap gap-2">
                    {([12, 15, 18, 21, 24, 36] as const).map((len) => (
                      <button
                        key={len}
                        onClick={() => setMnemonicOptions((o) => ({ ...o, length: len }))}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          mnemonicOptions.length === len
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {len} 词
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowOptions(false)}
                  className="w-full rounded-full bg-primary py-3 text-white"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
            <p className="mb-2 font-semibold text-green-800 dark:text-green-200">提交成功！</p>
            <pre className="text-xs text-green-700 dark:text-green-300">{result}</pre>
          </div>
        )}
      </div>
    );
  },
};

export const InOnboardingFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'form' | 'success'>('form');

    if (step === 'success') {
      return (
        <div className="space-y-4 text-center">
          <div className="rounded-xl bg-green-100 p-6 dark:bg-green-900/30">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              ✅ 钱包创建成功！
            </p>
          </div>
          <button
            onClick={() => setStep('form')}
            className="text-sm text-muted-foreground"
          >
            重新开始
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">创建钱包</h2>
        <p className="text-sm text-muted-foreground">
          设置钱包名称和密码，开始您的加密之旅
        </p>
        <CreateWalletForm
          onSubmit={() => setStep('success')}
          onOpenMnemonicOptions={() => alert('打开助记词选项')}
        />
      </div>
    );
  },
};
