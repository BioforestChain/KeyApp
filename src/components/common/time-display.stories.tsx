import type { Meta, StoryObj } from '@storybook/react'
import { TimeDisplay } from './time-display'

const meta: Meta<typeof TimeDisplay> = {
  title: 'Common/TimeDisplay',
  component: TimeDisplay,
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['relative', 'date', 'datetime', 'time'],
    },
  },
}

export default meta
type Story = StoryObj<typeof TimeDisplay>

const now = new Date()
const minutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
const hoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
const daysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
const weeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

export const Default: Story = {
  args: {
    value: minutesAgo,
  },
}

export const RelativeTime: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted">刚刚:</span>
        <TimeDisplay value={now} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted">5分钟前:</span>
        <TimeDisplay value={minutesAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted">3小时前:</span>
        <TimeDisplay value={hoursAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted">2天前:</span>
        <TimeDisplay value={daysAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted">2周前:</span>
        <TimeDisplay value={weeksAgo} />
      </div>
    </div>
  ),
}

export const DateFormat: Story = {
  args: {
    value: now,
    format: 'date',
  },
}

export const DateTimeFormat: Story = {
  args: {
    value: now,
    format: 'datetime',
  },
}

export const TimeFormat: Story = {
  args: {
    value: now,
    format: 'time',
  },
}

export const AllFormats: Story = {
  render: () => (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted mb-1">Relative (default)</p>
        <TimeDisplay value={hoursAgo} format="relative" />
      </div>
      <div>
        <p className="text-sm text-muted mb-1">Date</p>
        <TimeDisplay value={hoursAgo} format="date" />
      </div>
      <div>
        <p className="text-sm text-muted mb-1">DateTime</p>
        <TimeDisplay value={hoursAgo} format="datetime" />
      </div>
      <div>
        <p className="text-sm text-muted mb-1">Time</p>
        <TimeDisplay value={hoursAgo} format="time" />
      </div>
    </div>
  ),
}

export const TransactionList: Story = {
  render: () => (
    <div className="space-y-2">
      {[
        { type: '发送', amount: '-100 USDT', time: minutesAgo },
        { type: '接收', amount: '+0.5 ETH', time: hoursAgo },
        { type: '兑换', amount: '100 USDT → 0.05 ETH', time: daysAgo },
      ].map((tx, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <p className="font-medium">{tx.type}</p>
            <p className="text-sm text-muted">{tx.amount}</p>
          </div>
          <TimeDisplay value={tx.time} className="text-sm text-muted" />
        </div>
      ))}
    </div>
  ),
}
