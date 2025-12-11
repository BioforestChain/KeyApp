import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import {
  TransactionToast,
  ToastContainer,
  type TransactionToastProps,
} from './transaction-toast'

const meta = {
  title: 'Notification/TransactionToast',
  component: TransactionToast,
  parameters: {
    layout: 'centered',
  },
  args: {
    id: 'toast-1',
    status: 'success',
    title: '交易成功',
    message: '您的转账已确认',
    duration: 0, // Disable auto-close in stories
    onClose: fn(),
    onClick: fn(),
  },
} satisfies Meta<typeof TransactionToast>

export default meta
type Story = StoryObj<typeof meta>

// Success state
export const Success: Story = {
  args: {
    status: 'success',
    title: '交易成功',
    message: '您向 0x1234...5678 的转账已确认',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
  },
}

// Pending state
export const Pending: Story = {
  args: {
    status: 'pending',
    title: '交易处理中',
    message: '请稍候，正在确认您的交易',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
}

// Failed state
export const Failed: Story = {
  args: {
    status: 'failed',
    title: '交易失败',
    message: '交易被网络拒绝，请检查余额或重试',
    txHash: '0xfailhash123456789012345678901234567890ab',
  },
}

// Without message
export const TitleOnly: Story = {
  args: {
    status: 'success',
    title: '收款成功',
  },
}

// Interactive demo with multiple toasts
function MultipleToastsDemo() {
  const [toasts, setToasts] = useState<TransactionToastProps[]>([
    {
      id: '1',
      status: 'success',
      title: '交易成功',
      message: '100 USDT 已发送',
      txHash: '0x123...abc',
    },
    {
      id: '2',
      status: 'pending',
      title: '交易处理中',
      message: '等待网络确认',
    },
    {
      id: '3',
      status: 'failed',
      title: '交易失败',
      message: 'Gas 不足',
    },
  ])

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleAddToast = (status: TransactionToastProps['status']) => {
    const newToast: TransactionToastProps = {
      id: `toast-${Date.now()}`,
      status,
      title: status === 'success' ? '新交易成功' : status === 'pending' ? '新交易处理中' : '新交易失败',
      message: `创建于 ${new Date().toLocaleTimeString()}`,
      duration: status === 'pending' ? 0 : 5000,
    }
    setToasts((prev) => [...prev, newToast])
  }

  return (
    <div className="min-h-[400px] w-full p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleAddToast('success')}
          className="rounded bg-green-500 px-3 py-1 text-white"
        >
          Add Success
        </button>
        <button
          onClick={() => handleAddToast('pending')}
          className="rounded bg-yellow-500 px-3 py-1 text-white"
        >
          Add Pending
        </button>
        <button
          onClick={() => handleAddToast('failed')}
          className="rounded bg-red-500 px-3 py-1 text-white"
        >
          Add Failed
        </button>
      </div>
      <ToastContainer toasts={toasts} onClose={handleClose} position="top-right" />
    </div>
  )
}

export const MultipleToasts: Story = {
  render: () => <MultipleToastsDemo />,
  parameters: {
    layout: 'fullscreen',
  },
}
