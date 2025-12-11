import type { Meta, StoryObj } from '@storybook/react'
import { QRCode, AddressQRCode } from './qr-code'

const meta: Meta<typeof QRCode> = {
  title: 'Common/QRCode',
  component: QRCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 100, max: 400, step: 20 },
    },
    level: {
      control: 'select',
      options: ['L', 'M', 'Q', 'H'],
    },
    bgColor: { control: 'color' },
    fgColor: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof QRCode>

export const Default: Story = {
  args: {
    value: 'https://example.com',
    size: 200,
  },
}

export const EthereumAddress: Story = {
  args: {
    value: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    size: 200,
    level: 'H',
  },
}

export const BitcoinAddress: Story = {
  args: {
    value: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    size: 200,
    level: 'H',
  },
}

export const CustomColors: Story = {
  args: {
    value: 'https://example.com',
    size: 200,
    bgColor: '#f0f0f0',
    fgColor: '#6366f1',
  },
}

export const LargeSize: Story = {
  args: {
    value: 'https://example.com',
    size: 300,
  },
}

export const SmallSize: Story = {
  args: {
    value: 'https://example.com',
    size: 120,
  },
}

export const HighErrorCorrection: Story = {
  args: {
    value: 'https://example.com',
    size: 200,
    level: 'H',
  },
}

// AddressQRCode Stories
export const AddressQRCodeStory: StoryObj<typeof AddressQRCode> = {
  render: () => (
    <div className="flex gap-6">
      <div className="text-center">
        <AddressQRCode 
          address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
          chain="ethereum" 
        />
        <p className="mt-2 text-sm text-muted-foreground">Ethereum</p>
      </div>
      <div className="text-center">
        <AddressQRCode 
          address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" 
          chain="bitcoin" 
        />
        <p className="mt-2 text-sm text-muted-foreground">Bitcoin</p>
      </div>
      <div className="text-center">
        <AddressQRCode 
          address="TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW" 
          chain="tron" 
        />
        <p className="mt-2 text-sm text-muted-foreground">Tron</p>
      </div>
    </div>
  ),
}
