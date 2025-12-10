import type { Meta, StoryObj } from '@storybook/react'
import { SettingsItem } from './settings-item'
import { SettingsSection } from './settings-section'
import { SettingsPage } from './index'
import { Wallet, Globe, Lock, Eye } from 'lucide-react'

// SettingsItem stories
const itemMeta = {
  title: 'Pages/Settings/SettingsItem',
  component: SettingsItem,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-card rounded-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsItem>

export default itemMeta
type ItemStory = StoryObj<typeof itemMeta>

export const Default: ItemStory = {
  args: {
    label: '语言',
    value: '简体中文',
    icon: <Globe className="size-4" />,
    onClick: () => console.log('clicked'),
  },
}

export const WithoutValue: ItemStory = {
  args: {
    label: '查看助记词',
    icon: <Eye className="size-4" />,
    onClick: () => console.log('clicked'),
  },
}

export const Disabled: ItemStory = {
  args: {
    label: '应用锁',
    value: '未设置',
    icon: <Lock className="size-4" />,
    disabled: true,
  },
}

export const NoChevron: ItemStory = {
  args: {
    label: '版本',
    value: 'v1.0.0',
    showChevron: false,
  },
}

// SettingsSection stories
export const Section: StoryObj<typeof SettingsSection> = {
  render: () => (
    <div className="max-w-md p-4 bg-muted/30">
      <SettingsSection title="安全">
        <SettingsItem
          icon={<Lock className="size-4" />}
          label="应用锁"
          value="已开启"
          onClick={() => {}}
        />
        <div className="mx-4 h-px bg-border" />
        <SettingsItem
          icon={<Eye className="size-4" />}
          label="查看助记词"
          onClick={() => {}}
        />
      </SettingsSection>
    </div>
  ),
}

// SettingsPage story
export const Page: StoryObj<typeof SettingsPage> = {
  render: () => (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <SettingsPage />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}
