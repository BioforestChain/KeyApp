import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MnemonicConfirmBackup } from './mnemonic-confirm-backup'
import type { VerificationSlot } from '@/hooks/use-mnemonic-verification'

const mockMnemonic = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
]

const emptySlots: VerificationSlot[] = [
  { position: 2, expectedWord: 'able', selectedWord: null, isCorrect: null },
  { position: 5, expectedWord: 'absent', selectedWord: null, isCorrect: null },
  { position: 8, expectedWord: 'absurd', selectedWord: null, isCorrect: null },
  { position: 11, expectedWord: 'accident', selectedWord: null, isCorrect: null },
]

const meta = {
  title: 'Onboarding/MnemonicConfirmBackup',
  component: MnemonicConfirmBackup,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
  args: {
    slots: emptySlots,
    candidates: mockMnemonic,
    usedWords: new Set<string>(),
    nextEmptySlotIndex: 0,
    isComplete: false,
    onSelectWord: fn(),
    onDeselectSlot: fn(),
    onComplete: fn(),
  },
} satisfies Meta<typeof MnemonicConfirmBackup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PartiallyFilled: Story = {
  args: {
    slots: [
      { position: 2, expectedWord: 'able', selectedWord: 'able', isCorrect: true },
      { position: 5, expectedWord: 'absent', selectedWord: 'absent', isCorrect: true },
      { position: 8, expectedWord: 'absurd', selectedWord: null, isCorrect: null },
      { position: 11, expectedWord: 'accident', selectedWord: null, isCorrect: null },
    ],
    usedWords: new Set(['able', 'absent']),
    nextEmptySlotIndex: 2,
  },
}

export const WithError: Story = {
  args: {
    slots: [
      { position: 2, expectedWord: 'able', selectedWord: 'able', isCorrect: true },
      { position: 5, expectedWord: 'absent', selectedWord: 'about', isCorrect: false },
      { position: 8, expectedWord: 'absurd', selectedWord: null, isCorrect: null },
      { position: 11, expectedWord: 'accident', selectedWord: null, isCorrect: null },
    ],
    usedWords: new Set(['able', 'about']),
    nextEmptySlotIndex: 2,
  },
}

export const Complete: Story = {
  args: {
    slots: [
      { position: 2, expectedWord: 'able', selectedWord: 'able', isCorrect: true },
      { position: 5, expectedWord: 'absent', selectedWord: 'absent', isCorrect: true },
      { position: 8, expectedWord: 'absurd', selectedWord: 'absurd', isCorrect: true },
      { position: 11, expectedWord: 'accident', selectedWord: 'accident', isCorrect: true },
    ],
    usedWords: new Set(['able', 'absent', 'absurd', 'accident']),
    nextEmptySlotIndex: -1,
    isComplete: true,
  },
}
