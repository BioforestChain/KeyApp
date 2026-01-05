import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { ChainSwitchConfirmJob } from '../ChainSwitchConfirmJob'
import { ActivityParamsProvider } from '../../../hooks'
import { BottomSheet } from '@/components/layout/bottom-sheet'

const meta: Meta<typeof ChainSwitchConfirmJob> = {
  title: 'Sheets/ChainSwitchConfirmJob',
  component: ChainSwitchConfirmJob,
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
type Story = StoryObj<typeof ChainSwitchConfirmJob>

/** Demo wrapper to handle events */
function ChainSwitchDemo({
  fromChainId,
  toChainId,
  appName,
  appIcon,
}: {
  fromChainId: string
  toChainId: string
  appName?: string
  appIcon?: string
}) {
  const [result, setResult] = useState<{ approved: boolean; toChainId?: string } | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const handleConfirm = (e: CustomEvent) => {
      setResult(e.detail)
      setIsOpen(false)
    }
    window.addEventListener('chain-switch-confirm', handleConfirm as EventListener)
    return () => window.removeEventListener('chain-switch-confirm', handleConfirm as EventListener)
  }, [])

  if (!isOpen) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="text-lg font-semibold">
          {result?.approved ? '✅ 已确认切换' : '❌ 已取消'}
        </div>
        {result?.approved && (
          <div className="text-muted-foreground text-sm">
            切换到链: {result.toChainId}
          </div>
        )}
        <button
          onClick={() => {
            setResult(null)
            setIsOpen(true)
          }}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2"
        >
          重新打开
        </button>
      </div>
    )
  }

  return (
    <ActivityParamsProvider params={{ fromChainId, toChainId, appName, appIcon }}>
      <BottomSheet>
        <ChainSwitchConfirmJob params={{ fromChainId, toChainId, appName, appIcon }} />
      </BottomSheet>
    </ActivityParamsProvider>
  )
}

/** BSC 切换到 Ethereum */
export const BSCToEthereum: Story = {
  render: () => (
    <ChainSwitchDemo
      fromChainId="0x38"
      toChainId="0x1"
      appName="Forge"
      appIcon="https://via.placeholder.com/64"
    />
  ),
}

/** Ethereum 切换到 BSC */
export const EthereumToBSC: Story = {
  render: () => (
    <ChainSwitchDemo
      fromChainId="0x1"
      toChainId="0x38"
      appName="Teleport"
      appIcon="https://via.placeholder.com/64"
    />
  ),
}

/** 无应用信息 */
export const NoAppInfo: Story = {
  render: () => (
    <ChainSwitchDemo
      fromChainId="0x38"
      toChainId="0x1"
    />
  ),
}

/** 未知链 ID */
export const UnknownChain: Story = {
  render: () => (
    <ChainSwitchDemo
      fromChainId="0x38"
      toChainId="0x89"
      appName="Unknown DApp"
    />
  ),
}
