import type { Meta, StoryObj } from '@storybook/react'
import { AddressDisplay } from './address-display'

const meta: Meta<typeof AddressDisplay> = {
  title: 'Wallet/AddressDisplay',
  component: AddressDisplay,
  tags: ['autodocs'],
  argTypes: {
    copyable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AddressDisplay>

const ethAddress = '0x1234567890abcdef1234567890abcdef12345678'
const tronAddress = 'TAbcdefghijklmnopqrstuvwxyz123456789'
const btcAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

export const Default: Story = {
  render: () => (
    <div className="w-full">
      <AddressDisplay address={ethAddress} />
    </div>
  ),
}

export const NotCopyable: Story = {
  render: () => (
    <div className="w-full">
      <AddressDisplay address={ethAddress} copyable={false} />
    </div>
  ),
}

export const DifferentChains: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-sm text-muted">ETH:</span>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-sm text-muted">TRON:</span>
        <AddressDisplay address={tronAddress} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-sm text-muted">BTC:</span>
        <AddressDisplay address={btcAddress} />
      </div>
    </div>
  ),
}

export const Responsive: Story = {
  render: () => (
    <div className="space-y-6">
      <p className="text-sm text-muted">智能截断：根据容器宽度自动计算最优显示</p>
      <div className="w-[150px] border border-dashed p-2">
        <p className="text-xs text-muted mb-1">150px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[200px] border border-dashed p-2">
        <p className="text-xs text-muted mb-1">200px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[300px] border border-dashed p-2">
        <p className="text-xs text-muted mb-1">300px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[400px] border border-dashed p-2">
        <p className="text-xs text-muted mb-1">400px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-full border border-dashed p-2">
        <p className="text-xs text-muted mb-1">full width</p>
        <AddressDisplay address={ethAddress} />
      </div>
    </div>
  ),
}
