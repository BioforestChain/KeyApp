/**
 * MiniappWindow Stories
 * 
 * 演示小程序窗口组件和启动动画
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect } from 'react';
import { MiniappSplashScreen } from './miniapp-splash-screen';
import { MiniappCapsule } from './miniapp-capsule';
import { MiniappWindow } from './miniapp-window';
import { EcosystemDesktop, type EcosystemDesktopHandle } from './ecosystem-desktop';
import { SwiperSyncProvider } from '@/components/common/swiper-sync-context';
import { TabBar } from '@/stackflow/components/TabBar';
import { launchApp, closeAllApps } from '@/services/miniapp-runtime';
import type { MiniappManifest } from '@/services/ecosystem';

const meta: Meta = {
  title: 'Ecosystem/MiniappWindow',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock 应用数据
const mockApps: MiniappManifest[] = [
  {
    id: 'gaubee',
    name: 'Gaubee',
    description: 'gaubee.com',
    icon: 'https://gaubee.com/icon-192x192.png',
    url: 'https://gaubee.com/',
    version: '1.0.0',
    themeColor: '#4285F4',
    splashScreen: true,
    capsuleTheme: 'auto',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'The Free Encyclopedia',
    icon: 'https://www.wikipedia.org/static/favicon/wikipedia.ico',
    url: 'https://www.wikipedia.org/',
    version: '1.0.0',
    themeColor: '#111827',
    splashScreen: { timeout: 1200 },
    capsuleTheme: 'auto',
  },
  {
    id: 'kingsword-blog',
    name: 'Kingsword Blog',
    description: 'blog.kingsword.tech',
    icon: 'https://blog.kingsword.tech/favicon.png',
    url: 'https://blog.kingsword.tech/',
    version: '1.0.0',
    themeColor: '#0f172a',
    capsuleTheme: 'auto',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Research (no splash)',
    icon: 'https://openai.com/favicon.ico',
    url: 'https://openai.com/',
    version: '1.0.0',
    themeColor: '#10a37f',
  },
];

/** 单独测试启动屏幕 */
export const SplashScreenOnly: Story = {
  render: () => (
    <div className="relative h-screen">
      <MiniappSplashScreen
        appId="demo"
        app={{
          name: '锻造',
          icon: 'https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg',
          themeColor: '#f59e0b',
        }}
        visible={true}
      />
    </div>
  ),
};

/** 单独测试胶囊按钮 */
export const CapsuleOnly: Story = {
  render: () => (
    <div className="relative h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <MiniappCapsule
        visible={true}
        onAction={() => console.log('Action clicked')}
        onClose={() => console.log('Close clicked')}
      />
    </div>
  ),
};

/** 不同主题色的启动屏幕 */
export const SplashScreenThemes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 h-screen">
      <div className="relative h-full rounded-xl overflow-hidden">
        <MiniappSplashScreen
          appId="amber"
          app={{
            name: '锻造',
            icon: 'https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg',
            themeColor: '#f59e0b',
          }}
          visible={true}
        />
      </div>
      <div className="relative h-full rounded-xl overflow-hidden">
        <MiniappSplashScreen
          appId="purple"
          app={{
            name: '传送',
            icon: 'https://api.iconify.design/fluent-emoji:rocket.svg',
            themeColor: '#8b5cf6',
          }}
          visible={true}
        />
      </div>
      <div className="relative h-full rounded-xl overflow-hidden">
        <MiniappSplashScreen
          appId="green"
          app={{
            name: '市场',
            icon: 'https://api.iconify.design/fluent-emoji:shopping-bags.svg',
            themeColor: '#10b981',
          }}
          visible={true}
        />
      </div>
      <div className="relative h-full rounded-xl overflow-hidden">
        <MiniappSplashScreen
          appId="blue"
          app={{
            name: '钱包',
            icon: 'https://api.iconify.design/fluent-emoji:money-bag.svg',
            themeColor: '#3b82f6',
          }}
          visible={true}
        />
      </div>
    </div>
  ),
};

/**
 * 启动动画演示
 * 
 * 点击图标启动应用，观察 FLIP 动画效果：
 * - 锻造/传送：有 splash screen（路径 1）
 * - 市场/钱包：无 splash screen（路径 2）
 */
export const LaunchDemo: Story = {
  decorators: [
    (Story) => (
      <SwiperSyncProvider>
        <div className="h-screen">
          <Story />
        </div>
      </SwiperSyncProvider>
    ),
  ],
  render: function LaunchDemoStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);

    // 清理旧状态
    useEffect(() => {
      // 清理之前可能残留的应用状态
      closeAllApps();
    }, []);

    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60,
    }));

    const handleAppOpen = (app: MiniappManifest) => {
      console.log('[LaunchDemo] Opening app:', app.name);
      // 关键：动画目标来自 targetDesktop 对应 slide 的 rect，因此必须先切到该页
      const manifest: MiniappManifest = { ...app, targetDesktop: 'mine' };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    };

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 relative overflow-hidden">
          <EcosystemDesktop
            ref={desktopRef}
            showDiscoverPage={false}
            showStackPage="auto"
            apps={mockApps}
            myApps={myApps}
            onAppOpen={handleAppOpen}
            onAppDetail={(app) => console.log('Detail:', app.name)}
            onAppRemove={(id) => console.log('Remove:', id)}
          />

          {/* 窗口层 */}
          <MiniappWindow />
        </div>

        {/* 真实项目底部指示器（TabBar 内置生态 indicator） */}
        <TabBar activeTab="ecosystem" onTabChange={() => {}} />

        {/* 提示 */}
        <div className="shrink-0 bg-black/90 text-white p-3 text-center text-xs">
          点击图标启动应用 | 锻造/传送有 Splash | 市场/钱包直接打开
        </div>
      </div>
    );
  },
};
