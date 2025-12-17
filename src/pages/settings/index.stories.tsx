import type { Meta, StoryObj } from '@storybook/react';
import { SettingsItem } from './settings-item';
import { SettingsSection } from './settings-section';
import { SettingsPage } from './index';
import { IconLanguage as Languages, IconLock as Lock, IconEye as Eye } from '@tabler/icons-react';

// SettingsItem stories
const itemMeta = {
  title: 'Pages/Settings/SettingsItem',
  component: SettingsItem,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="bg-card max-w-md rounded-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsItem>;

export default itemMeta;
type ItemStory = StoryObj<typeof itemMeta>;

export const Default: ItemStory = {
  args: {
    label: '语言',
    value: '简体中文',
    icon: <Languages size={20} />,
    onClick: () => console.log('clicked'),
  },
};

export const WithoutValue: ItemStory = {
  args: {
    label: '查看助记词',
    icon: <Eye size={20} />,
    onClick: () => console.log('clicked'),
  },
};

export const Disabled: ItemStory = {
  args: {
    label: '应用锁',
    value: '未设置',
    icon: <Lock size={20} />,
    disabled: true,
  },
};

export const NoChevron: ItemStory = {
  args: {
    label: '版本',
    value: 'v1.0.0',
    showChevron: false,
  },
};

// SettingsSection stories
export const Section: StoryObj<typeof SettingsSection> = {
  render: () => (
    <div className="bg-muted/30 max-w-md p-4">
      <SettingsSection title="安全">
        <SettingsItem icon={<Lock size={20} />} label="应用锁" value="已开启" onClick={() => {}} />
        <div className="bg-border mx-4 h-px" />
        <SettingsItem icon={<Eye size={20} />} label="查看助记词" onClick={() => {}} />
      </SettingsSection>
    </div>
  ),
};

// SettingsPage story
export const Page: StoryObj<typeof SettingsPage> = {
  render: () => (
    <div className="bg-background mx-auto min-h-screen max-w-md">
      <SettingsPage />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
