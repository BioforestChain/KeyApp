import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AddressInput } from './address-input'

const meta: Meta<typeof AddressInput> = {
  title: 'Transfer/AddressInput',
  component: AddressInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AddressInput>

export const Default: Story = {
  args: {
    label: '收款地址',
    onScan: () => alert('Open scanner'),
  },
}

export const WithValue: Story = {
  args: {
    label: '收款地址',
    value: '0x1234567890abcdef1234567890abcdef12345678',
  },
}

export const WithError: Story = {
  args: {
    label: '收款地址',
    value: '0x123',
    error: '地址格式不正确',
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="space-y-4">
        <AddressInput
          label="收款地址"
          value={value}
          onChange={setValue}
          onScan={() => alert('Scan QR code')}
        />
        <p className="text-sm text-muted">
          当前值: {value || '(空)'}
        </p>
      </div>
    )
  },
}

export const DifferentChains: Story = {
  render: () => (
    <div className="space-y-4">
      <AddressInput
        label="ETH 地址"
        value="0x1234567890abcdef1234567890abcdef12345678"
      />
      <AddressInput
        label="TRON 地址"
        value="TRXabcdefghijklmnopqrstuvwxyz123456"
      />
      <AddressInput
        label="BTC 地址"
        value="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
      />
    </div>
  ),
}

export const WithoutScan: Story = {
  args: {
    label: '收款地址',
  },
}

export const TransferForm: Story = {
  render: () => {
    const [address, setAddress] = useState('')
    
    return (
      <div className="space-y-6 p-4">
        <h3 className="font-medium text-lg">转账</h3>
        <AddressInput
          label="收款地址"
          value={address}
          onChange={setAddress}
          onScan={() => alert('Open QR scanner')}
        />
        <button
          className="w-full py-3 rounded-full bg-primary text-white font-medium disabled:opacity-50"
          disabled={!address || address.length < 20}
        >
          下一步
        </button>
      </div>
    )
  },
}
