import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TabBar, type TabItem } from './tab-bar';

const meta: Meta<typeof TabBar> = {
  title: 'Layout/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-[200px] pb-20">
        <div className="p-4">
          <p className="text-muted-foreground">页面内容区域</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabBar>;

const HomeIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-6 w-6"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const WalletIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-6 w-6"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const HistoryIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-6 w-6"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-6 w-6"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const defaultItems: TabItem[] = [
  { id: 'home', label: '首页', icon: <HomeIcon />, activeIcon: <HomeIcon filled /> },
  { id: 'wallet', label: '钱包', icon: <WalletIcon />, activeIcon: <WalletIcon filled /> },
  { id: 'history', label: '记录', icon: <HistoryIcon />, activeIcon: <HistoryIcon filled /> },
  { id: 'me', label: '我的', icon: <UserIcon />, activeIcon: <UserIcon filled /> },
];

function TabBarDemo({ items = defaultItems }: { items?: TabItem[] }) {
  const [activeId, setActiveId] = useState('home');

  return <TabBar items={items} activeId={activeId} onTabChange={setActiveId} />;
}

export const Default: Story = {
  render: () => <TabBarDemo />,
};

export const WithBadge: Story = {
  render: () => (
    <TabBarDemo
      items={[
        { id: 'home', label: '首页', icon: <HomeIcon />, activeIcon: <HomeIcon filled /> },
        { id: 'wallet', label: '钱包', icon: <WalletIcon />, activeIcon: <WalletIcon filled />, badge: 3 },
        { id: 'history', label: '记录', icon: <HistoryIcon />, activeIcon: <HistoryIcon filled />, badge: 99 },
        { id: 'me', label: '我的', icon: <UserIcon />, activeIcon: <UserIcon filled />, badge: '新' },
      ]}
    />
  ),
};

export const ThreeTabs: Story = {
  render: () => (
    <TabBarDemo
      items={[
        { id: 'home', label: '首页', icon: <HomeIcon />, activeIcon: <HomeIcon filled /> },
        { id: 'wallet', label: '钱包', icon: <WalletIcon />, activeIcon: <WalletIcon filled /> },
        { id: 'me', label: '我的', icon: <UserIcon />, activeIcon: <UserIcon filled /> },
      ]}
    />
  ),
};
