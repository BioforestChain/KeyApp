import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MnemonicInput } from './mnemonic-input'
import { GradientButton } from '../common/gradient-button'

const meta: Meta<typeof MnemonicInput> = {
  title: 'Security/MnemonicInput',
  component: MnemonicInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MnemonicInput>

export const Default: Story = {
  args: {
    wordCount: 12,
    onComplete: (words) => alert(`Complete: ${words.join(' ')}`),
  },
}

export const Words24: Story = {
  args: {
    wordCount: 24,
    onComplete: (words) => console.log('Complete:', words),
  },
}

export const WithSubmit: Story = {
  render: () => {
    const [words, setWords] = useState<string[]>([])
    const [isComplete, setIsComplete] = useState(false)
    
    return (
      <div className="space-y-4">
        <MnemonicInput
          wordCount={12}
          onChange={(w, complete) => {
            setWords(w)
            setIsComplete(complete)
          }}
        />
        <GradientButton
          fullWidth
          disabled={!isComplete}
          onClick={() => alert(`导入: ${words.join(' ')}`)}
        >
          导入钱包
        </GradientButton>
        <p className="text-xs text-muted text-center">
          提示：可以直接粘贴完整的助记词
        </p>
      </div>
    )
  },
}

export const ImportFlow: Story = {
  render: () => {
    const [step, setStep] = useState<'input' | 'success'>('input')
    const [words, setWords] = useState<string[]>([])
    
    if (step === 'success') {
      return (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">钱包导入成功</p>
          <p className="text-sm text-muted">共导入 {words.length} 个单词</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-medium">导入钱包</h3>
          <p className="text-sm text-muted mt-1">请输入您的助记词</p>
        </div>
        <MnemonicInput
          wordCount={12}
          onComplete={(w) => {
            setWords(w)
            setStep('success')
          }}
        />
      </div>
    )
  },
}
