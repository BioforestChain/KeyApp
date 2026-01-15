import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, waitFor } from '@storybook/test';
import { MyAppsPage } from './my-apps-page';
import type { MiniappManifest } from '@/services/ecosystem';

const mockApps: Array<{ app: MiniappManifest; lastUsed: number }> = [
  {
    app: {
      id: 'app-1',
      name: '转账助手',
      description: '快速安全的转账工具',
      icon: 'https://picsum.photos/seed/app1/200',
      url: 'https://example.com/app-1',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now(),
  },
  {
    app: {
      id: 'app-2',
      name: 'DeFi 收益',
      description: '一站式 DeFi 收益管理',
      icon: 'https://picsum.photos/seed/app2/200',
      url: 'https://example.com/app-2',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now() - 1000,
  },
  {
    app: {
      id: 'app-3',
      name: 'NFT 市场',
      description: '发现和交易 NFT',
      icon: 'https://picsum.photos/seed/app3/200',
      url: 'https://example.com/app-3',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now() - 2000,
  },
  {
    app: {
      id: 'app-4',
      name: '链上投票',
      description: '参与 DAO 治理投票',
      icon: 'https://picsum.photos/seed/app4/200',
      url: 'https://example.com/app-4',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now() - 3000,
  },
  {
    app: {
      id: 'app-5',
      name: '跨链桥',
      description: '多链资产跨链转移',
      icon: 'https://picsum.photos/seed/app5/200',
      url: 'https://example.com/app-5',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now() - 4000,
  },
  {
    app: {
      id: 'app-6',
      name: '质押挖矿',
      description: '质押代币获取收益',
      icon: 'https://picsum.photos/seed/app6/200',
      url: 'https://example.com/app-6',
      version: '1.0.0',
      permissions: [],
    },
    lastUsed: Date.now() - 5000,
  },
];

const meta: Meta<typeof MyAppsPage> = {
  title: 'Ecosystem/MyAppsPage',
  component: MyAppsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    onSearchClick: fn(),
    onAppOpen: fn(),
    onAppDetail: fn(),
    onAppRemove: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof MyAppsPage>;

export const Default: Story = {
  args: {
    apps: mockApps,
  },
};

export const Empty: Story = {
  args: {
    apps: [],
  },
};

export const FewApps: Story = {
  args: {
    apps: mockApps.slice(0, 2),
  },
};

export const ManyApps: Story = {
  args: {
    apps: [
      ...mockApps,
      ...mockApps.map((item, i) => ({
        ...item,
        app: { ...item.app, id: `app-extra-${i}`, name: `应用 ${i + 7}` },
      })),
    ],
  },
};

// 长按测试 - 验证 popover 菜单显示
export const LongPressTest: Story = {
  args: {
    apps: mockApps,
  },
  play: async ({ canvas, step }) => {
    await step('检查图标是否渲染', async () => {
      const icon = canvas.getByText('转账助手');
      await expect(icon).toBeInTheDocument();
    });

    await step('右键点击图标触发菜单', async () => {
      const iconButton = canvas.getByText('转账助手').closest('button') as HTMLElement;
      
      // 触发 contextmenu 事件（模拟右键/长按）
      iconButton.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
      
      // 等待 popover 打开
      await waitFor(() => {
        const popover = document.querySelector('.ios-desktop-icon:popover-open');
        expect(popover).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    await step('验证菜单内容', async () => {
      await waitFor(() => {
        const menu = document.querySelector('.ios-context-menu');
        expect(menu).toBeVisible();
      });
    });
  },
};

// 搜索胶囊点击测试
export const SearchCapsuleTest: Story = {
  args: {
    apps: mockApps,
    onSearchClick: fn(),
  },
  play: async ({ args, canvas, step, userEvent }) => {
    await step('点击搜索胶囊', async () => {
      const searchCapsule = canvas.getByText('搜索');
      await userEvent.click(searchCapsule);
      await expect(args.onSearchClick).toHaveBeenCalled();
    });
  },
};

// 点击图标测试
export const TapIconTest: Story = {
  args: {
    apps: mockApps,
    onAppOpen: fn(),
  },
  play: async ({ args, canvas, step, userEvent }) => {
    await step('点击应用图标', async () => {
      const iconButton = canvas.getByText('转账助手').closest('button') as HTMLElement;
      await userEvent.click(iconButton);
      await expect(args.onAppOpen).toHaveBeenCalled();
    });
  },
};
