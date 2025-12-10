import type { Meta, StoryObj } from '@storybook/react'
import { RecoverWalletForm } from './recover-wallet-form'
import { fn } from '@storybook/test'

const meta = {
  title: 'Onboarding/RecoverWalletForm',
  component: RecoverWalletForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] rounded-lg border bg-background p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof RecoverWalletForm>

export default meta
type Story = StoryObj<typeof meta>

/** Default empty state */
export const Default: Story = {}

/** With submitting state */
export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
}

/** Interactive demo with prefilled valid mnemonic */
export const WithValidMnemonic: Story = {
  render: (args) => {
    // Note: This is a test mnemonic, never use in production
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          测试助记词（请勿在生产环境使用）：
          <br />
          abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon
          about
        </p>
        <RecoverWalletForm {...args} />
      </div>
    )
  },
}
