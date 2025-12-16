import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './bottom-sheet';
import { GradientButton } from '../common/gradient-button';

const meta: Meta<typeof BottomSheet> = {
  title: 'Layout/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

function BottomSheetDemo({ height = 'auto' }: { height?: 'auto' | 'half' | 'full' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <GradientButton onClick={() => setOpen(true)}>打开 BottomSheet</GradientButton>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="选择钱包" height={height}>
        <div className="space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg p-3"
              onClick={() => setOpen(false)}
            >
              <div className="bg-gradient-purple h-10 w-10 rounded-full" />
              <div>
                <p className="font-medium">钱包 {i}</p>
                <p className="text-muted-foreground text-sm">0x1234...5678</p>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

export const Default: Story = {
  render: () => <BottomSheetDemo />,
};

export const HalfHeight: Story = {
  render: () => <BottomSheetDemo height="half" />,
};

export const FullHeight: Story = {
  render: () => <BottomSheetDemo height="full" />,
};

function TransferConfirmDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <GradientButton onClick={() => setOpen(true)}>转账确认示例</GradientButton>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="确认转账">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">收款地址</span>
              <span className="font-mono text-sm">0x1234...5678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">转账金额</span>
              <span className="font-semibold">100 USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">手续费</span>
              <span>≈ 0.001 ETH</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <GradientButton fullWidth onClick={() => setOpen(false)}>
              确认转账
            </GradientButton>
            <button
              className="text-muted-foreground hover:text-foreground w-full py-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              取消
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export const TransferConfirm: Story = {
  render: () => <TransferConfirmDemo />,
};
