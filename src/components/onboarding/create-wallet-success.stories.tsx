import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CreateWalletSuccess } from './create-wallet-success';

const meta: Meta<typeof CreateWalletSuccess> = {
  title: 'Onboarding/CreateWalletSuccess',
  component: CreateWalletSuccess,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CreateWalletSuccess>;

export const Default: Story = {
  args: {
    walletName: '我的钱包',
    skipBackup: true,
    onBackup: () => console.log('Backup'),
    onEnterWallet: () => console.log('Enter wallet'),
  },
};

export const WithoutBackupOption: Story = {
  args: {
    walletName: 'MyWallet',
    skipBackup: false,
    onEnterWallet: () => console.log('Enter wallet'),
  },
};

export const LongWalletName: Story = {
  args: {
    walletName: '超长钱包名称测试',
    skipBackup: true,
    onBackup: () => console.log('Backup'),
    onEnterWallet: () => console.log('Enter wallet'),
  },
};

export const Interactive: Story = {
  render: () => {
    const [action, setAction] = useState<string | null>(null);

    if (action === 'backup') {
      return (
        <div className="space-y-4 p-6 text-center">
          <p className="text-lg font-medium">开始备份助记词...</p>
          <button
            onClick={() => setAction(null)}
            className="text-sm text-muted-foreground"
          >
            返回
          </button>
        </div>
      );
    }

    if (action === 'enter') {
      return (
        <div className="space-y-4 p-6 text-center">
          <p className="text-lg font-medium">进入钱包主页...</p>
          <button
            onClick={() => setAction(null)}
            className="text-sm text-muted-foreground"
          >
            返回
          </button>
        </div>
      );
    }

    return (
      <CreateWalletSuccess
        walletName="测试钱包"
        skipBackup={true}
        onBackup={() => setAction('backup')}
        onEnterWallet={() => setAction('enter')}
      />
    );
  },
};

export const InOnboardingFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'success' | 'done'>('success');

    if (step === 'done') {
      return (
        <div className="space-y-4 p-6 text-center">
          <div className="rounded-xl bg-blue-100 p-6 dark:bg-blue-900/30">
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              🏠 钱包主页
            </p>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">
              您已成功进入钱包
            </p>
          </div>
          <button
            onClick={() => setStep('success')}
            className="text-sm text-muted-foreground"
          >
            重新开始
          </button>
        </div>
      );
    }

    return (
      <CreateWalletSuccess
        walletName="BFM Pay"
        skipBackup={true}
        onBackup={() => alert('跳转到备份页面')}
        onEnterWallet={() => setStep('done')}
      />
    );
  },
};
