import type { Meta, StoryObj } from '@storybook/react';
import { MarqueeText } from './marquee-text';

const meta: Meta<typeof MarqueeText> = {
  title: 'UI/MarqueeText',
  component: MarqueeText,
  tags: ['autodocs'],
  argTypes: {
    copyable: {
      control: 'boolean',
    },
    duration: {
      control: { type: 'range', min: 1, max: 20, step: 0.5 },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MarqueeText>;

export const ShortText: Story = {
  args: {
    children: 'Short text',
    className: 'w-48',
  },
};

export const OverflowingText: Story = {
  args: {
    children: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    className: 'w-48 font-mono text-sm',
  },
};

export const LongChainName: Story = {
  args: {
    children: 'Binance Smart Chain Mainnet (BSC)',
    className: 'w-32',
  },
};

export const WithCopyButton: Story = {
  args: {
    children: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    className: 'w-48 font-mono text-sm',
    copyable: true,
  },
};

export const CustomDuration: Story = {
  args: {
    children: 'This text scrolls at a custom speed that is slower than default',
    className: 'w-48',
    duration: 10,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Short text (no scroll)</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1">Short</MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">Overflowing address (scrolls)</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1 font-mono text-sm">
          0x742d35cc6634c0532925a3b844bc454e4438f44e
        </MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">With copy button</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1 font-mono text-sm" copyable>
          0x742d35cc6634c0532925a3b844bc454e4438f44e
        </MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">Hover to pause animation</p>
        <MarqueeText className="border-border w-32 rounded border px-2 py-1">
          Hover over this text to pause the scrolling animation
        </MarqueeText>
      </div>
    </div>
  ),
};
