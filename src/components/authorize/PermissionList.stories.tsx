import type { Meta, StoryObj } from '@storybook/react'
import { PermissionList } from './PermissionList'

const meta: Meta<typeof PermissionList> = {
  title: 'Authorize/PermissionList',
  component: PermissionList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PermissionList>

export const Default: Story = {
  args: {
    permissions: ['viewAddress', 'viewPublicKey', 'signMessage'],
  },
}

