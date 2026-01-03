import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback, useRef } from 'react';
import { EcosystemDesktop, type EcosystemDesktopHandle } from './ecosystem-desktop';
import { EcosystemTabIndicator } from './ecosystem-tab-indicator';
import { SwiperSyncProvider } from '@/components/common/swiper-sync-context';
import { launchApp } from '@/services/miniapp-runtime';
import type { MiniappManifest } from '@/services/ecosystem';

// Mock 数据
const mockApps: MiniappManifest[] = [
  {
    id: 'forge',
    name: '锻造',
    description: '铸造和管理你的 NFT 资产',
    icon: '/miniapps/forge/logo.webp',
    url: 'https://localhost:5182/',
    version: '1.0.0',
    themeColor: '#FF6B35',
    splashScreen: true,
    sourceName: 'BioChain',
    sourceIcon: '/logo.webp',
  },
  {
    id: 'teleport',
    name: '传送',
    description: '跨链资产转移',
    icon: '/miniapps/teleport/logo.webp',
    url: 'https://localhost:5183/',
    version: '1.0.0',
    themeColor: '#6366F1',
    splashScreen: true,
    sourceName: 'BioChain',
    sourceIcon: '/logo.webp',
  },
  {
    id: 'market',
    name: '市场',
    description: 'NFT 交易市场',
    icon: '/miniapps/forge/logo.webp',
    url: 'https://example.com/market',
    version: '1.0.0',
    themeColor: '#10B981',
    sourceName: 'Community',
    sourceIcon: '/logo.webp',
  },
  {
    id: 'wallet',
    name: '钱包',
    description: '数字资产管理',
    icon: '/miniapps/teleport/logo.webp',
    url: 'https://example.com/wallet',
    version: '1.0.0',
    themeColor: '#F59E0B',
    sourceName: 'BioChain',
    sourceIcon: '/logo.webp',
  },
];

const meta: Meta<typeof EcosystemDesktop> = {
  title: 'Ecosystem/EcosystemDesktop',
  component: EcosystemDesktop,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <SwiperSyncProvider groupId="ecosystem">
        <div className="h-[667px] w-[375px] mx-auto bg-background overflow-hidden relative">
          <Story />
        </div>
      </SwiperSyncProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EcosystemDesktop>;

/** 完整桌面（发现页 + 我的页 + 应用堆栈页） */
export const FullDesktop: Story = {
  render: function FullDesktopStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    
    const myApps = mockApps.slice(0, 3).map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60,
    }));

    const handleAppOpen = useCallback((app: MiniappManifest) => {
      console.log('Open:', app.name);
      const manifest: MiniappManifest = { ...app, targetDesktop: 'mine' };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    }, []);

    return (
      <>
        <EcosystemDesktop
          ref={desktopRef}
          showDiscoverPage={true}
          showStackPage="auto"
          apps={mockApps}
          myApps={myApps}
          featuredApps={mockApps.slice(0, 2)}
          recommendedApps={mockApps.slice(2)}
          hotApps={mockApps}
          onAppOpen={handleAppOpen}
          onAppDetail={(app) => console.log('Detail:', app.name)}
          onAppRemove={(id) => console.log('Remove:', id)}
        />
        {/* 底部指示器（松耦合，自动从 store 读取状态） */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator onPageChange={(page) => desktopRef.current?.slideTo(page)} />
        </div>
      </>
    );
  },
};

/** 仅我的页（无发现页，无搜索框） */
export const MyAppsOnly: Story = {
  render: function MyAppsOnlyStory() {
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60,
    }));

    return (
      <>
        <EcosystemDesktop
          showDiscoverPage={false}
          showStackPage={false}
          apps={mockApps}
          myApps={myApps}
          onAppOpen={(app) => console.log('Open:', app.name)}
          onAppDetail={(app) => console.log('Detail:', app.name)}
          onAppRemove={(id) => console.log('Remove:', id)}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator />
        </div>
      </>
    );
  },
};

/** 可配置桌面 */
export const Configurable: Story = {
  render: function ConfigurableStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const [showDiscoverPage, setShowDiscoverPage] = useState(true);
    const [showStackPage, setShowStackPage] = useState<boolean | 'auto'>('auto');
    
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60,
    }));

    return (
      <div className="flex flex-col h-full">
        {/* 控制面板 */}
        <div className="shrink-0 bg-black/90 text-white p-3 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDiscoverPage}
              onChange={(e) => setShowDiscoverPage(e.target.checked)}
              className="rounded"
            />
            显示发现页
          </label>
          <label className="flex items-center gap-2 text-sm">
            <select
              value={String(showStackPage)}
              onChange={(e) => {
                const v = e.target.value;
                setShowStackPage(v === 'auto' ? 'auto' : v === 'true');
              }}
              className="bg-gray-800 rounded px-2 py-1 text-sm"
            >
              <option value="auto">应用堆栈页: 自动</option>
              <option value="true">应用堆栈页: 显示</option>
              <option value="false">应用堆栈页: 隐藏</option>
            </select>
          </label>
        </div>

        {/* 桌面 */}
        <div className="flex-1 relative overflow-hidden">
          <EcosystemDesktop
            ref={desktopRef}
            showDiscoverPage={showDiscoverPage}
            showStackPage={showStackPage}
            apps={mockApps}
            myApps={myApps}
            featuredApps={mockApps.slice(0, 2)}
            recommendedApps={mockApps.slice(2)}
            hotApps={mockApps}
            onAppOpen={(app) => {
              console.log('Open:', app.name);
              const manifest: MiniappManifest = { ...app, targetDesktop: 'mine' };
              desktopRef.current?.slideTo('mine');
              requestAnimationFrame(() => launchApp(app.id, manifest));
            }}
            onAppDetail={(app) => console.log('Detail:', app.name)}
            onAppRemove={(id) => console.log('Remove:', id)}
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <EcosystemTabIndicator />
          </div>
        </div>
      </div>
    );
  },
};

/** 空状态 */
export const EmptyState: Story = {
  render: function EmptyStateStory() {
    return (
      <>
        <EcosystemDesktop
          showDiscoverPage={true}
          apps={mockApps}
          myApps={[]}
          featuredApps={mockApps.slice(0, 2)}
          recommendedApps={mockApps}
          hotApps={mockApps}
          onAppOpen={(app) => console.log('Open:', app.name)}
          onAppDetail={(app) => console.log('Detail:', app.name)}
          onAppRemove={(id) => console.log('Remove:', id)}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator />
        </div>
      </>
    );
  },
};
