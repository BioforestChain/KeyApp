import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MnemonicDisplay } from './mnemonic-display'

const meta: Meta<typeof MnemonicDisplay> = {
  title: 'Security/MnemonicDisplay',
  component: MnemonicDisplay,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MnemonicDisplay>

const mockWords = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
]

const mock24Words = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
  'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
  'across', 'act', 'action', 'actor', 'actress', 'actual',
]

export const Default: Story = {
  args: {
    words: mockWords,
    onCopy: () => console.log('Copied!'),
  },
}

export const Hidden: Story = {
  args: {
    words: mockWords,
    hidden: true,
  },
}

export const Words24: Story = {
  args: {
    words: mock24Words,
  },
}

export const ToggleVisibility: Story = {
  render: () => {
    const [hidden, setHidden] = useState(true)
    return (
      <div className="space-y-4">
        <MnemonicDisplay words={mockWords} hidden={hidden} />
        <button
          onClick={() => setHidden(!hidden)}
          className="text-sm text-primary"
        >
          {hidden ? '显示助记词' : '隐藏助记词'}
        </button>
      </div>
    )
  },
}

export const WithWarning: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive font-medium">⚠️ 重要提示</p>
        <p className="text-xs text-destructive/80 mt-1">
          请将助记词抄写在纸上并妥善保管。任何人获取您的助记词都可以访问您的钱包资产。
        </p>
      </div>
      <MnemonicDisplay words={mockWords} />
    </div>
  ),
}
