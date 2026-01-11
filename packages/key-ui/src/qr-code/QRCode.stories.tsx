import type { Meta, StoryObj } from '@storybook/react-vite'
import { QRCode, AddressQRCode } from './QRCode'

const meta: Meta<typeof QRCode> = {
  title: 'Components/QRCode',
  component: QRCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'https://example.com',
    size: 200,
  },
}

export const Small: Story = {
  args: {
    value: 'https://example.com',
    size: 120,
  },
}

export const Large: Story = {
  args: {
    value: 'https://example.com',
    size: 300,
  },
}

export const WithLogo: Story = {
  args: {
    value: 'https://example.com',
    size: 200,
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    logoSize: 40,
  },
}

export const EthereumAddress: StoryObj<typeof AddressQRCode> = {
  render: () => (
    <AddressQRCode
      address="0x1234567890abcdef1234567890abcdef12345678"
      chain="ethereum"
      size={200}
    />
  ),
}

export const BitcoinAddress: StoryObj<typeof AddressQRCode> = {
  render: () => (
    <AddressQRCode
      address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      chain="bitcoin"
      size={200}
    />
  ),
}
