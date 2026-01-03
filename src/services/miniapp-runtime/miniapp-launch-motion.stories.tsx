/**
 * Miniapp Launch Motion (layoutId 版)
 *
 * 目标：用 motion/react 的 layoutId 取代 FLIP/WAAPI，演示两条路径：
 * - 直接：icon -> window
 * - Splash：icon -> splash(icon) -> window
 *
 * 关键要点：
 * - 同一个 layoutId 贯穿 icon/splash/window（容器 + 图标）
 * - 背景层单独淡入，不包裹 layoutId，避免干扰测量
 * - LayoutGroup + AnimatePresence(mode="popLayout")
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { motion, MotionConfig, AnimatePresence, LayoutGroup, type Transition } from 'motion/react';

const meta: Meta = {
  title: 'Services/MiniappRuntime/LaunchMotion',
  parameters: { layout: 'fullscreen' },
};

const MOTION_DEBUG_SPEED = 0.01;
const MOTION_DEBUG_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220 * MOTION_DEBUG_SPEED * MOTION_DEBUG_SPEED,
  damping: 28 * MOTION_DEBUG_SPEED,
  mass: 0.85,
  // duration: 20000,
} as const;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 直接路径：icon -> window
 */
export const DirectPath: Story = {
  render: function DirectPathStory() {
    const [state, setState] = useState<'idle' | 'window'>('idle');

    return (
      <MotionConfig transition={MOTION_DEBUG_TRANSITION}>
        <LayoutGroup>
          <div className="relative h-screen overflow-hidden bg-zinc-900 font-sans">
            {/* idle icon */}
            <AnimatePresence mode="popLayout">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  layoutId="miniapp-container"
                  className="absolute top-8 left-8 z-10 bg-zinc-800"
                  style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden' }}
                  onClick={() => setState('window')}
                  data-testid="icon"
                >
                  <motion.div
                    layoutId="miniapp-icon"
                    className="flex h-full w-full items-center justify-center bg-blue-500"
                    style={{ borderRadius: 16 }}
                  >
                    <motion.span layoutId="miniapp-symbol" className="text-2xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* window */}
            <AnimatePresence mode="popLayout">
              {state === 'window' && (
                <motion.div
                  key="window"
                  layoutId="miniapp-container"
                  className="absolute inset-4 z-20 flex flex-col bg-zinc-800"
                  style={{ borderRadius: 24, overflow: 'hidden' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  data-testid="window"
                >
                  <div className="flex items-center gap-3 bg-blue-500/80 p-4">
                    <motion.div
                      layoutId="miniapp-icon"
                      className="flex h-12 w-12 items-center justify-center bg-blue-500"
                      style={{ borderRadius: 16 }}
                    >
                      <motion.span layoutId="miniapp-symbol" className="text-3xl select-none">
                        🚀
                      </motion.span>
                    </motion.div>
                    <span className="font-bold text-white">My Miniapp</span>
                    <button
                      onClick={() => setState('idle')}
                      className="ml-auto rounded bg-white/20 px-3 py-1 text-white"
                      data-testid="btn-close"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="flex-1 p-4 text-white">Miniapp 内容区域</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white">
              状态: <span data-testid="status">{state}</span>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>
    );
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    await new Promise((r) => setTimeout(r, 200));

    await step('初始 idle', async () => {
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });

    await step('点击启动', async () => {
      await userEvent.click(c.getByTestId('icon'));
      await new Promise((r) => setTimeout(r, 600));
      expect(c.getByTestId('status').textContent).toBe('window');
      expect(c.getByTestId('window')).toBeInTheDocument();
    });

    await step('点击关闭', async () => {
      await userEvent.click(c.getByTestId('btn-close'));
      await new Promise((r) => setTimeout(r, 600));
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });
  },
};

/**
 * Splash 路径：icon -> splash(icon+bg) -> window
 */
export const SplashPath: Story = {
  render: function SplashPathStory() {
    const [state, setState] = useState<'idle' | 'splash' | 'window'>('idle');

    const goSplash = () => {
      setState('splash');
      setTimeout(() => setState('window'), 900);
    };

    return (
      <MotionConfig transition={MOTION_DEBUG_TRANSITION}>
        <LayoutGroup>
          <div className="relative h-screen overflow-hidden bg-zinc-900 font-sans">
            {/* idle icon */}
            <AnimatePresence mode="popLayout">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  layoutId="splash-container"
                  className="absolute top-8 left-8 z-10 bg-orange-500"
                  style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden' }}
                  onClick={goSplash}
                  data-testid="icon"
                >
                  <motion.div
                    layoutId="splash-icon"
                    className="flex h-full w-full items-center justify-center"
                    style={{ borderRadius: 16 }}
                  >
                    <motion.span layoutId="splash-symbol" className="text-2xl select-none">
                      🎯
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* splash 背景 */}
            <AnimatePresence>
              {state === 'splash' && (
                <motion.div
                  key="splash-bg"
                  className="absolute inset-0 bg-gradient-to-b from-orange-400 to-amber-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  data-testid="splash-bg"
                />
              )}
            </AnimatePresence>

            {/* splash icon 居中 */}
            <AnimatePresence mode="popLayout">
              {state === 'splash' && (
                <motion.div
                  key="splash"
                  layoutId="splash-container"
                  className="absolute top-1/2 left-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-orange-600 shadow-xl"
                  style={{ borderRadius: 24, overflow: 'hidden' }}
                  data-testid="splash-icon"
                >
                  <motion.div
                    layoutId="splash-icon"
                    className="flex h-full w-full items-center justify-center"
                    style={{ borderRadius: 24 }}
                  >
                    <motion.span layoutId="splash-symbol" className="text-4xl select-none">
                      🎯
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* window */}
            <AnimatePresence mode="popLayout">
              {state === 'window' && (
                <motion.div
                  key="window"
                  layoutId="splash-container"
                  className="absolute inset-4 z-30 flex flex-col bg-white"
                  style={{ borderRadius: 24, overflow: 'hidden' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  data-testid="window"
                >
                  <div className="flex items-center gap-3 bg-orange-500 p-4">
                    <motion.div
                      layoutId="splash-icon"
                      className="flex h-10 w-10 items-center justify-center bg-orange-600"
                      style={{ borderRadius: 12 }}
                    >
                      <motion.span layoutId="splash-symbol" className="text-lg select-none">
                        🎯
                      </motion.span>
                    </motion.div>
                    <span className="font-bold text-white">Splash Miniapp</span>
                    <button
                      onClick={() => setState('idle')}
                      className="ml-auto rounded bg-white/20 px-3 py-1 text-white"
                      data-testid="btn-close"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <p className="text-gray-800">App 内容区域</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white">
              状态: <span data-testid="status">{state}</span>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>
    );
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    await new Promise((r) => setTimeout(r, 200));

    await step('初始 idle', async () => {
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });

    await step('点击进入 splash', async () => {
      await userEvent.click(c.getByTestId('icon'));
      await new Promise((r) => setTimeout(r, 500));
      expect(c.getByTestId('status').textContent).toBe('splash');
      expect(c.getByTestId('splash-icon')).toBeInTheDocument();
    });

    await step('自动进入 window', async () => {
      await new Promise((r) => setTimeout(r, 900));
      expect(c.getByTestId('status').textContent).toBe('window');
      expect(c.getByTestId('window')).toBeInTheDocument();
    });

    await step('关闭返回 idle', async () => {
      await userEvent.click(c.getByTestId('btn-close'));
      await new Promise((r) => setTimeout(r, 500));
      expect(c.getByTestId('status').textContent).toBe('idle');
    });
  },
};
