import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepIndicator, ProgressSteps } from './StepIndicator'

const meta: Meta<typeof StepIndicator> = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const steps = ['Connect', 'Confirm', 'Complete']

export const Step1: Story = {
  args: {
    steps,
    currentStep: 0,
  },
}

export const Step2: Story = {
  args: {
    steps,
    currentStep: 1,
  },
}

export const Step3: Story = {
  args: {
    steps,
    currentStep: 2,
  },
}

export const Completed: Story = {
  args: {
    steps,
    currentStep: 3,
  },
}

export const ManySteps: Story = {
  args: {
    steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    currentStep: 2,
  },
}

export const ProgressBars: StoryObj<typeof ProgressSteps> = {
  render: () => (
    <div className="space-y-4">
      <ProgressSteps total={4} current={1} />
      <ProgressSteps total={4} current={2} />
      <ProgressSteps total={4} current={3} />
      <ProgressSteps total={4} current={4} />
    </div>
  ),
}
