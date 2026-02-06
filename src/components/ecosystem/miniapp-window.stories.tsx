/**
 * MiniappWindow Stories
 *
 * 演示小程序窗口组件和启动动画
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState, Activity } from 'react';
import { within, userEvent, expect } from '@storybook/test';
import { MiniappSplashScreen } from './miniapp-splash-screen';
import { MiniappCapsule } from './miniapp-capsule';
import { MiniappWindow } from './miniapp-window';
import { EcosystemDesktop, type EcosystemDesktopHandle } from './ecosystem-desktop';
import { SwiperSyncProvider } from '@/components/common/swiper-sync-context';
import { TabBar } from '@/stackflow/components/TabBar';
import {
  closeAllApps,
  launchApp,
  resetMiniappVisualConfig,
  setMiniappMotionTimeScale,
  useMiniappVisibilityRestore,
} from '@/services/miniapp-runtime';
import { MiniappVisualProvider } from '@/services/miniapp-runtime/MiniappVisualProvider';
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
    <div className="grid h-screen grid-cols-2 gap-4 p-4">
      <div className="relative h-full overflow-hidden rounded-xl">
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
      <div className="relative h-full overflow-hidden rounded-xl">
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
      <div className="relative h-full overflow-hidden rounded-xl">
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
      <div className="relative h-full overflow-hidden rounded-xl">
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
    const [timeScale, setTimeScale] = useState(1);

    // 清理旧状态
    useEffect(() => {
      // 清理之前可能残留的应用状态
      closeAllApps();
      resetMiniappVisualConfig();
      setMiniappMotionTimeScale(1);

      return () => {
        resetMiniappVisualConfig();
      };
    }, []);

    useEffect(() => {
      setMiniappMotionTimeScale(timeScale);
    }, [timeScale]);

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
      <MiniappVisualProvider>
        <div className="flex h-screen flex-col">
          <div className="relative flex-1 overflow-hidden">
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
          <TabBar activeTab="ecosystem" className="static" onTabChange={() => {}} />

          {/* 提示 + 速度调控 */}
          <div className="shrink-0 bg-black/90 px-3 py-2 text-xs text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate">点击图标启动应用 | 锻造/传送有 Splash | 市场/钱包直接打开</div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <button
                  className="rounded bg-white/10 px-2 py-1"
                  onClick={() => setTimeScale((s) => Math.max(0.25, Number((s - 0.25).toFixed(2))))}
                >
                  -
                </button>
                <div className="min-w-[6ch] text-center tabular-nums">x{timeScale.toFixed(2)}</div>
                <button
                  className="rounded bg-white/10 px-2 py-1"
                  onClick={() => setTimeScale((s) => Math.min(4, Number((s + 0.25).toFixed(2))))}
                >
                  +
                </button>
                <button className="rounded bg-white/10 px-2 py-1" onClick={() => setTimeScale(1)}>
                  Reset
                </button>
              </div>
            </div>

            <input
              className="mt-2 w-full"
              type="range"
              min={0.25}
              max={4}
              step={0.05}
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              aria-label="Miniapp motion speed"
            />
          </div>
        </div>
      </MiniappVisualProvider>
    );
  },
};

/**
 * 模拟 EcosystemTab 组件
 * 在 Activity 内部调用 activateApp，确保 slots 已注册
 */
function EcosystemTabMock({
  desktopRef,
  myApps,
  onAppOpen,
}: {
  desktopRef: React.RefObject<EcosystemDesktopHandle | null>;
  myApps: { app: MiniappManifest; lastUsed: number }[];
  onAppOpen: (app: MiniappManifest) => void;
}) {
  // 使用与真实 EcosystemTab 相同的 hook
  useMiniappVisibilityRestore();

  return (
    <EcosystemDesktop
      ref={desktopRef}
      showDiscoverPage={false}
      showStackPage="auto"
      apps={mockApps}
      myApps={myApps}
      onAppOpen={onAppOpen}
      onAppDetail={(app) => console.log('Detail:', app.name)}
      onAppRemove={(id) => console.log('Remove:', id)}
    />
  );
}

/**
 * Tab 切换可见性测试
 *
 * 使用真实的 TabBar 和 React 19 Activity 模拟底部 Tab 切换场景：
 * - MiniappWindow 在全局层渲染（不随 Tab 切换卸载）
 * - EcosystemTabMock 在 Activity 内，包含 activateApp 逻辑
 *
 * 测试步骤：
 * 1. 点击生态 Tab，然后点击图标启动应用
 * 2. 点击钱包 Tab 切走
 * 3. 点击生态 Tab 切回
 * 4. 观察小程序窗口是否仍然可见
 */
export const TabSwitchVisibility: Story = {
  decorators: [
    (Story) => (
      <SwiperSyncProvider>
        <div className="h-screen">
          <Story />
        </div>
      </SwiperSyncProvider>
    ),
  ],
  render: function TabSwitchVisibilityStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const [activeTab, setActiveTab] = useState<'wallet' | 'ecosystem' | 'settings'>('ecosystem');

    // 清理旧状态
    useEffect(() => {
      closeAllApps();
      resetMiniappVisualConfig();
      return () => {
        resetMiniappVisualConfig();
      };
    }, []);



    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60,
    }));

    const handleAppOpen = (app: MiniappManifest) => {
      console.log('[TabSwitchVisibility] Opening app:', app.name);
      const manifest: MiniappManifest = { ...app, targetDesktop: 'mine' };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    };

    const handleTabChange = (tab: 'wallet' | 'ecosystem' | 'settings') => {
      console.log('[TabSwitchVisibility] Tab changed to:', tab);
      setActiveTab(tab);
    };

    return (
      <MiniappVisualProvider>
        <div className="flex h-screen flex-col bg-background">
          <div className="relative flex-1 overflow-hidden">
            {/* 使用 React 19 Activity 模拟真实 Tab 切换行为 */}
            <Activity mode={activeTab === 'wallet' ? 'visible' : 'hidden'}>
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">👛</div>
                  <div>钱包页面</div>
                </div>
              </div>
            </Activity>

            <Activity mode={activeTab === 'ecosystem' ? 'visible' : 'hidden'}>
              <EcosystemTabMock
                desktopRef={desktopRef}
                myApps={myApps}
                onAppOpen={handleAppOpen}
              />
            </Activity>

            <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">⚙️</div>
                  <div>设置页面</div>
                </div>
              </div>
            </Activity>

            {/* MiniappWindow 在全局层，不随 Tab 切换卸载（与 StackflowApp 一致） */}
            <MiniappWindow />
          </div>

          {/* 真实 TabBar */}
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} className="static" />
        </div>
      </MiniappVisualProvider>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((r) => setTimeout(r, 500));

    await step('点击第一个应用图标启动', async () => {
      const appIcon = canvas.getAllByTestId(/^ios-app-icon-/)[0];
      expect(appIcon).toBeInTheDocument();
      await userEvent.click(appIcon);
      await new Promise((r) => setTimeout(r, 1500));
    });

    await step('验证窗口已渲染', async () => {
      const window = canvas.getByTestId('miniapp-window');
      expect(window).toBeInTheDocument();
    });

    await step('点击钱包 Tab 切走', async () => {
      const walletTab = canvas.getByTestId('tab-wallet');
      await userEvent.click(walletTab);
      await new Promise((r) => setTimeout(r, 300));
    });

    await step('点击生态 Tab 切回', async () => {
      const ecosystemTab = canvas.getByTestId('tab-ecosystem');
      await userEvent.click(ecosystemTab);
      await new Promise((r) => setTimeout(r, 500));
    });

    await step('验证窗口重新可见', async () => {
      const window = canvas.getByTestId('miniapp-window');
      expect(window).toBeInTheDocument();
    });
  },
};
