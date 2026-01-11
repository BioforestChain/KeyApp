import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenIcon } from './index'

const meta: Meta<typeof TokenIcon.Root> = {
  title: 'Components/TokenIcon',
  component: TokenIcon.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
  },
  render: (args) => (
    <TokenIcon.Root {...args}>
      <TokenIcon.Image src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" />
      <TokenIcon.Fallback>ETH</TokenIcon.Fallback>
    </TokenIcon.Root>
  ),
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => (
    <TokenIcon.Root {...args}>
      <TokenIcon.Image src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="BTC" />
      <TokenIcon.Fallback>BTC</TokenIcon.Fallback>
    </TokenIcon.Root>
  ),
}

export const Large: Story = {
  args: {
    size: 'xl',
  },
  render: (args) => (
    <TokenIcon.Root {...args}>
      <TokenIcon.Image src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" />
      <TokenIcon.Fallback>SOL</TokenIcon.Fallback>
    </TokenIcon.Root>
  ),
}

export const Fallback: Story = {
  args: {
    size: 'md',
  },
  render: (args) => (
    <TokenIcon.Root {...args}>
      <TokenIcon.Image src="https://invalid-url.com/image.png" alt="UNKNOWN" />
      <TokenIcon.Fallback>??</TokenIcon.Fallback>
    </TokenIcon.Root>
  ),
}

export const NoImage: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => (
    <TokenIcon.Root {...args}>
      <TokenIcon.Fallback>ABC</TokenIcon.Fallback>
    </TokenIcon.Root>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <TokenIcon.Root key={size} size={size}>
          <TokenIcon.Image src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" />
          <TokenIcon.Fallback>ETH</TokenIcon.Fallback>
        </TokenIcon.Root>
      ))}
    </div>
  ),
}
