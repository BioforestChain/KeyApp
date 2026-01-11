import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-32" />,
}

export const Circle: Story = {
  render: () => <Skeleton className="size-12 rounded-full" />,
}

export const Text: Story = {
  render: () => <SkeletonText lines={3} />,
}

export const Card: Story = {
  render: () => <SkeletonCard />,
}

export const List: Story = {
  render: () => <SkeletonList count={3} />,
}

export const CustomSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  ),
}
