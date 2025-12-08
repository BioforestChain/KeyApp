import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BottomSheet } from './bottom-sheet'
import { GradientButton } from '../common/gradient-button'

const meta: Meta<typeof BottomSheet> = {
  title: 'Layout/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BottomSheet>

function BottomSheetDemo({ height = 'auto' }: { height?: 'auto' | 'half' | 'full' }) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="p-4">
      <GradientButton onClick={() => setOpen(true)}>
        打开 BottomSheet
      </GradientButton>
      
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="选择钱包"
        height={height}
      >
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-purple" />
              <div>
                <p className="font-medium">钱包 {i}</p>
                <p className="text-sm text-muted">0x1234...5678</p>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

export const Default: Story = {
  render: () => <BottomSheetDemo />,
}

export const HalfHeight: Story = {
  render: () => <BottomSheetDemo height="half" />,
}

export const FullHeight: Story = {
  render: () => <BottomSheetDemo height="full" />,
}

function TransferConfirmDemo() {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="p-4">
      <GradientButton onClick={() => setOpen(true)}>
        转账确认示例
      </GradientButton>
      
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="确认转账"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">收款地址</span>
              <span className="font-mono text-sm">0x1234...5678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">转账金额</span>
              <span className="font-semibold">100 USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">手续费</span>
              <span>≈ 0.001 ETH</span>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <GradientButton fullWidth onClick={() => setOpen(false)}>
              确认转账
            </GradientButton>
            <button 
              className="w-full py-3 text-muted hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              取消
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export const TransferConfirm: Story = {
  render: () => <TransferConfirmDemo />,
}
