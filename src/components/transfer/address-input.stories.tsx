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

export const WithValueFocused: Story = {
  render: () => {
    return (
      <AddressInput 
        label="收款地址 (Focused)" 
        value="0x1234567890abcdef1234567890abcdef12345678" 
        autoFocus
        onScan={() => {}}
      />
    );
  },
};

export const LongAddressUnfocused: Story = {
  args: {
    label: 'Long Address (Unfocused)',
    value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
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
 * 带联系人建议 - 聚焦即展开，显示所有联系人
 * AddressInput 直接从 addressBookStore 读取数据（单一数据源）
 */
export const WithContactSuggestions: Story = {
  decorators: [
    (Story) => {
      // Setup contacts for suggestions
      addressBookActions.clearAll();
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', label: 'ETH', isDefault: true },
        ],
        memo: '同事',
      });
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [
          { id: '2', address: '0xabcdef1234567890abcdef1234567890abcdef12', label: 'ETH', isDefault: true },
          { id: '3', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', label: 'BFMETA' },
        ],
      });
      addressBookActions.addContact({
        name: 'Charlie',
        addresses: [
          { id: '4', address: '0x9876543210fedcba9876543210fedcba98765432', label: 'ETH', isDefault: true },
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
        <p className="text-muted-foreground text-sm">
          聚焦输入框即可看到所有联系人建议，输入可过滤
        </p>
        <AddressInput
          label="收款地址"
          value={address}
          onChange={setAddress}
          onScan={() => alert('Open QR scanner')}
          onContactPicker={() => alert('Open contact picker')}
          showSuggestions
        />
        <p className="text-muted-foreground text-sm">当前值: {address || '(空)'}</p>
      </div>
    );
  },
};

/**
 * 按链类型过滤 - 只显示指定链的地址
 * AddressInput 直接从 addressBookStore 读取数据（单一数据源）
 */
export const FilterByChain: Story = {
  decorators: [
    (Story) => {
      addressBookActions.clearAll();
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', label: 'ETH', isDefault: true },
          { id: '2', address: 'b7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', label: 'BFMETA' },
        ],
      });
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [
          { id: '3', address: 'c7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', label: 'CCCHAIN', isDefault: true },
        ],
      });
      return <Story />;
    },
  ],
  render: () => {
    const [address, setAddress] = useState('');

    return (
      <div className="space-y-6 p-4">
        <p className="text-muted-foreground text-sm">
          设置 chainType="bfmeta"，只显示 BFMeta 链有效的地址
        </p>
        <AddressInput
          label="BFMeta 地址"
          value={address}
          onChange={setAddress}
          chainType="bfmeta"
          onContactPicker={() => alert('Open contact picker for BFMeta')}
          showSuggestions
        />
      </div>
    );
  },
};

/**
 * 未知地址显示模式 - 显示钱包占位图标
 */
export const UnknownAddressDisplay: Story = {
  args: {
    label: 'Unknown Address',
    value: '0x1234567890abcdef1234567890abcdef12345678',
  },
};

/**
 * 已知联系人显示模式 - 显示头像和双行信息（名称+地址）
 */
export const KnownContactDisplay: Story = {
  decorators: [
    (Story) => {
      addressBookActions.clearAll();
      addressBookActions.addContact({
        name: 'Alice Cooper',
        addresses: [
          { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', label: 'ETH', isDefault: true },
        ],
        memo: 'Rockstar',
      });
      return <Story />;
    },
  ],
  args: {
    label: 'Known Contact',
    value: '0x1234567890abcdef1234567890abcdef12345678',
  },
};
