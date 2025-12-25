import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput, type PasswordStrength } from './password-input';

const meta: Meta<typeof PasswordInput> = {
  title: 'Security/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    showStrength: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    placeholder: '请输入密码',
  },
};

export const WithStrength: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [strength, setStrength] = useState<PasswordStrength>('weak');

    return (
      <div className="space-y-4">
        <PasswordInput
          placeholder="请输入密码"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          showStrength
          onStrengthChange={setStrength}
        />
        <p className="text-muted-foreground text-sm">当前强度: {strength}</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '请输入密码',
    disabled: true,
    value: 'password123',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">钱包密码</label>
      <PasswordInput placeholder="6-20位，需包含字母和数字" showStrength />
      <p className="text-muted-foreground text-xs">密码用于加密您的钱包，请牢记</p>
    </div>
  ),
};

export const ConfirmPassword: Story = {
  render: () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const isMatch = password === confirm && password.length > 0;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">设置密码</label>
          <PasswordInput
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">确认密码</label>
          <PasswordInput placeholder="请再次输入密码" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {confirm && !isMatch && <p className="text-destructive text-xs">两次输入的密码不一致</p>}
          {isMatch && <p className="text-green-500 text-xs">密码匹配</p>}
        </div>
      </div>
    );
  },
};

export const StrengthLevels: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm">弱密码 (123456)</p>
        <PasswordInput value="123456" showStrength readOnly />
      </div>
      <div>
        <p className="mb-2 text-sm">中等密码 (Password1)</p>
        <PasswordInput value="Password1" showStrength readOnly />
      </div>
      <div>
        <p className="mb-2 text-sm">强密码 (MyP@ssw0rd!)</p>
        <PasswordInput value="MyP@ssw0rd!" showStrength readOnly />
      </div>
    </div>
  ),
};
