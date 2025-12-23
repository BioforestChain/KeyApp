import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AddressInput } from './address-input';
import { addressBookActions } from '@/stores';

const meta: Meta<typeof AddressInput> = {
  title: 'Transfer/AddressInput',
  component: AddressInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AddressInput>;

export const Default: Story = {
  args: {
    label: '收款地址',
    onScan: () => alert('Open scanner'),
  },
};

export const WithValue: Story = {
  args: {
    label: '收款地址',
    value: '0x1234567890abcdef1234567890abcdef12345678',
  },
};

export const WithError: Story = {
  args: {
    label: '收款地址',
    value: '0x123',
    error: '地址格式不正确',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4">
        <AddressInput label="收款地址" value={value} onChange={setValue} onScan={() => alert('Scan QR code')} />
        <p className="text-muted-foreground text-sm">当前值: {value || '(空)'}</p>
      </div>
    );
  },
};

export const DifferentChains: Story = {
  render: () => (
    <div className="space-y-4">
      <AddressInput label="ETH 地址" value="0x1234567890abcdef1234567890abcdef12345678" />
      <AddressInput label="TRON 地址" value="TRXabcdefghijklmnopqrstuvwxyz123456" />
      <AddressInput label="BTC 地址" value="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" />
    </div>
  ),
};

export const WithoutScan: Story = {
  args: {
    label: '收款地址',
  },
};

export const TransferForm: Story = {
  render: () => {
    const [address, setAddress] = useState('');

    return (
      <div className="space-y-6 p-4">
        <h3 className="text-lg font-medium">转账</h3>
        <AddressInput label="收款地址" value={address} onChange={setAddress} onScan={() => alert('Open QR scanner')} />
        <button
          className="bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50"
          disabled={!address || address.length < 20}
        >
          下一步
        </button>
      </div>
    );
  },
};

/**
 * 带联系人建议 - 输入联系人名称或地址前缀会显示建议
 */
export const WithContactSuggestions: Story = {
  decorators: [
    (Story) => {
      // Setup contacts for suggestions
      addressBookActions.clearAll();
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', chainType: 'ethereum', isDefault: true },
        ],
        memo: '同事',
      });
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [
          { id: '2', address: '0xabcdef1234567890abcdef1234567890abcdef12', chainType: 'ethereum', isDefault: true },
          { id: '3', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', chainType: 'bfmeta' },
        ],
      });
      addressBookActions.addContact({
        name: 'Charlie',
        addresses: [
          { id: '4', address: '0x9876543210fedcba9876543210fedcba98765432', chainType: 'ethereum', isDefault: true },
        ],
        memo: '朋友',
      });
      return <Story />;
    },
  ],
  render: () => {
    const [address, setAddress] = useState('');

    return (
      <div className="space-y-6 p-4">
        <p className="text-muted-foreground text-sm">试着输入 "Al"、"Bob" 或 "0x12" 来查看建议</p>
        <AddressInput
          label="收款地址"
          value={address}
          onChange={setAddress}
          onScan={() => alert('Open QR scanner')}
          showSuggestions
        />
        <p className="text-muted-foreground text-sm">当前值: {address || '(空)'}</p>
      </div>
    );
  },
};
