import type { Meta, StoryObj } from '@storybook/react'
import { WalletMiniCard } from './wallet-mini-card'
import { WALLET_THEME_COLORS } from '@/hooks/useWalletTheme'

// 内联 SVG 图标（B 字母，用于 demo）- base64 编码确保兼容性
const DEMO_ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik02IDRoOGE0IDQgMCAwIDEgMCA4aC0yYTQgNCAwIDAgMSAwIDhINlY0em0yIDJ2NGg2YTIgMiAwIDEgMCAwLTRIOHptMCA2djRoNmEyIDIgMCAxIDAgMC00SDh6Ii8+PC9zdmc+'

// 也提供文件系统路径版本
const CHAIN_ICON_URL = '/icons/bfmeta/chain.svg'

const meta: Meta<typeof WalletMiniCard> = {
  title: 'Wallet/WalletMiniCard',
  component: WalletMiniCard,
  tags: ['autodocs'],
  argTypes: {
    themeHue: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md'],
    },
    showPattern: {
      control: { type: 'boolean' },
    },
    watermarkIconUrl: {
      control: { type: 'text' },
    },
  },
}

export default meta
type Story = StoryObj<typeof WalletMiniCard>

export const Default: Story = {
  args: {
    themeHue: 323,
    size: 'sm',
    showPattern: true,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="xs" />
        <span className="text-xs text-muted-foreground">xs (20×12)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="sm" />
        <span className="text-xs text-muted-foreground">sm (32×20)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="md" />
        <span className="text-xs text-muted-foreground">md (44×28)</span>
      </div>
    </div>
  ),
}

export const AllThemeColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {WALLET_THEME_COLORS.map(({ name, hue }) => (
        <div key={hue} className="flex flex-col items-center gap-2">
          <WalletMiniCard themeHue={hue} size="md" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
}

export const WithWatermark: Story = {
  args: {
    themeHue: 323,
    size: 'md',
    showPattern: true,
    watermarkIconUrl: DEMO_ICON_URL,
  },
}

export const WithChainIcon: Story = {
  args: {
    themeHue: 250,
    size: 'md',
    showPattern: true,
    watermarkIconUrl: CHAIN_ICON_URL,
  },
}

export const WithoutPattern: Story = {
  args: {
    themeHue: 250,
    size: 'md',
    showPattern: false,
  },
}

export const RainbowWatermarkShowcase: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">彩虹水印效果 (内联 SVG)</h3>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-20 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={250} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={145} size="xs" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">xs</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">对比：无水印 vs 有水印</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <WalletMiniCard themeHue={323} size="md" />
            <span className="text-xs text-muted-foreground">无水印</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
            <span className="text-xs text-muted-foreground">有水印</span>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const AllSizesWithWatermark: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="xs" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">xs (20x12)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">sm (32x20)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">md (44x28)</span>
      </div>
    </div>
  ),
}

export const InListContext: Story = {
  render: () => (
    <div className="w-80 space-y-2 rounded-xl bg-background p-4">
      {[
        { name: '主钱包', hue: 323 },
        { name: '交易账户', hue: 250 },
        { name: '储蓄', hue: 145 },
      ].map(({ name, hue }) => (
        <div
          key={hue}
          className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
        >
          <WalletMiniCard themeHue={hue} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
          <span className="font-medium">{name}</span>
        </div>
      ))}
    </div>
  ),
}
