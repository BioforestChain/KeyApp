import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PasswordConfirmSheet } from './password-confirm-sheet';

const meta: Meta<typeof PasswordConfirmSheet> = {
  title: 'Security/PasswordConfirmSheet',
  component: PasswordConfirmSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordConfirmSheet>;

export const Default: Story = {
  args: {
    open: true,
  },
};

export const WithDescription: Story = {
  args: {
    open: true,
    description: '请输入密码以确认此转账操作',
  },
};

export const WithBiometric: Story = {
  args: {
    open: true,
    biometricAvailable: true,
    onBiometric: () => console.log('Biometric triggered'),
  },
};

export const WithError: Story = {
  args: {
    open: true,
    error: '密码错误，请重试',
  },
};

export const Verifying: Story = {
  args: {
    open: true,
    isVerifying: true,
  },
};

export const CustomTitle: Story = {
  args: {
    open: true,
    title: '确认删除钱包',
    description: '此操作不可逆，请确认您已备份助记词',
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleVerify = (password: string) => {
      setError(undefined);
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        if (password === 'correct') {
          setOpen(false);
        } else {
          setError('密码错误，请重试');
        }
      }, 1500);
    };

    return (
      <div className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Try password: &quot;correct&quot; to succeed
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-white"
        >
          Open Password Confirm
        </button>
        <PasswordConfirmSheet
          open={open}
          onClose={() => setOpen(false)}
          onVerify={handleVerify}
          error={error}
          isVerifying={verifying}
          biometricAvailable
          onBiometric={() => {
            setVerifying(true);
            setTimeout(() => {
              setVerifying(false);
              setOpen(false);
            }, 1000);
          }}
        />
      </div>
    );
  },
};

export const FullFeature: Story = {
  args: {
    open: true,
    title: '确认转账',
    description: '您即将向 0x1234...5678 转账 1.5 ETH',
    biometricAvailable: true,
    onBiometric: () => console.log('Biometric'),
  },
};
