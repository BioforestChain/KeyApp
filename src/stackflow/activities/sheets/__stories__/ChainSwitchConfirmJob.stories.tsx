import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { getKeyAppChainId } from '@biochain/bio-sdk'

const meta: Meta = {
  title: 'Sheets/ChainSwitchConfirmJob',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-background">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj

function ChainSwitchPreview({
  fromChainId,
  toChainId,
  appName,
}: {
  fromChainId: string
  toChainId: string
  appName?: string
}) {
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)
  const from = getKeyAppChainId(fromChainId) ?? fromChainId
  const to = getKeyAppChainId(toChainId) ?? toChainId

  return (
    <div className="mx-auto flex h-screen w-[375px] flex-col justify-end">
      <div className="bg-background rounded-t-2xl border border-border p-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />

        <h2 className="text-center text-lg font-semibold">切换网络确认</h2>
        <p className="text-muted-foreground mt-1 text-center text-sm">
          {appName || '未知 DApp'} 请求切换网络
        </p>

        <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">当前网络</span>
            <span className="font-medium">{from}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">目标网络</span>
            <span className="font-medium">{to}</span>
          </div>
        </div>

        {result && (
          <div className="mt-4 rounded-xl border border-border p-3 text-sm">
            结果：{result === 'approved' ? '已确认' : '已取消'}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setResult('rejected')}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => setResult('approved')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            确认
          </button>
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

/** BSC 切换到 Ethereum */
export const BSCToEthereum: Story = {
  render: () => (
    <ChainSwitchPreview
      fromChainId="0x38"
      toChainId="0x1"
      appName="Forge"
    />
  ),
}

/** Ethereum 切换到 BSC */
export const EthereumToBSC: Story = {
  render: () => (
    <ChainSwitchPreview
      fromChainId="0x1"
      toChainId="0x38"
      appName="Teleport"
    />
  ),
}

/** 无应用信息 */
export const NoAppInfo: Story = {
  render: () => (
    <ChainSwitchPreview
      fromChainId="0x38"
      toChainId="0x1"
    />
  ),
}

/** 未知链 ID */
export const UnknownChain: Story = {
  render: () => (
    <ChainSwitchPreview
      fromChainId="0x38"
      toChainId="0x89"
      appName="Unknown DApp"
    />
  ),
}
