/**
 * Motion layoutId 实验
 *
 * 使用 motion/react 的 layoutId 实现共享元素过渡
 *
 * FLIP 思维：
 * - First: 记录元素初始位置
 * - Last: 记录元素最终位置
 * - Invert: 计算反向 transform
 * - Play: 播放动画
 *
 * layoutId 自动处理 FLIP，但需要正确使用 AnimatePresence
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { motion, MotionConfig, AnimatePresence, LayoutGroup } from 'motion/react';

const meta: Meta = {
  title: 'Services/MotionExperiment',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础 layoutId 测试 - FLIP 正确实现
 *
 * 关键：使用 LayoutGroup 包裹，确保 layoutId 跨组件工作
 * 两个元素都在 AnimatePresence 内，实现正确的交叉淡化
 */
export const IconToSplash: Story = {
  render: function IconToSplashStory() {
    const [isOpen, setIsOpen] = useState(false);

    // 定义圆角数值，保持一致性
    const BORDER_RADIUS_CLOSED = 16; // 对应 rounded-2xl
    const BORDER_RADIUS_OPEN = 24; // 对应 rounded-3xl

    return (
      <MotionConfig transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}>
        <LayoutGroup>
          <div className="relative h-screen w-full overflow-hidden bg-zinc-900 font-sans">
            <AnimatePresence mode="popLayout">
              {!isOpen ? (
                /* ================= CLOSED (Icon) ================= */
                <motion.div
                  layoutId="window-bg"
                  key="closed"
                  className="absolute top-8 left-8 z-10 bg-zinc-800" // 即使是 closed 状态，最好也给个背景色防止闪烁
                  style={{
                    borderRadius: BORDER_RADIUS_CLOSED,
                    overflow: 'hidden', // 关键修复：防止内容溢出圆角
                    width: 64, // 显式宽高有助于计算
                    height: 64,
                  }}
                  onClick={() => setIsOpen(true)}
                  data-testid="icon"
                >
                  <motion.div
                    layoutId="icon-bg"
                    className="flex h-full w-full cursor-pointer items-center justify-center bg-blue-500"
                    style={{
                      // 这里不需要 overflow hidden，因为它是内部填充物
                      borderRadius: BORDER_RADIUS_CLOSED,
                    }}
                  >
                    <motion.span layoutId="icon-symbol" className="text-2xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>
                </motion.div>
              ) : (
                /* ================= OPEN (Window) ================= */
                <motion.div
                  layoutId="window-bg"
                  key="open"
                  // 移除 inset-4，改用具体的宽高或定位，或者保留 inset 但配合 layout
                  className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-zinc-800"
                  style={{
                    borderRadius: BORDER_RADIUS_OPEN,
                    overflow: 'hidden', // 关键修复：在放大过程中保持圆角裁剪
                  }}
                >
                  <motion.div
                    layoutId="icon-bg"
                    className="flex h-24 w-24 cursor-pointer items-center justify-center bg-blue-500"
                    style={{
                      borderRadius: BORDER_RADIUS_OPEN, // 内部元素也需要平滑过渡圆角
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    data-testid="splash-icon"
                  >
                    <motion.span layoutId="icon-symbol" className="text-4xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-white"
                  >
                    点击图标关闭
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 text-sm text-white">
              状态: <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>
    );
  },
  // Play 函数保持不变，因为逻辑和 testId 都保留了
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((resolve) => setTimeout(resolve, 300));

    await step('初始: closed', async () => {
      expect(canvas.getByTestId('status').textContent).toBe('closed');
      expect(canvas.getByTestId('icon')).toBeInTheDocument();
    });

    await step('点击图标: 动画到中间', async () => {
      await userEvent.click(canvas.getByTestId('icon'));
      // 等待动画完成
      await new Promise((resolve) => setTimeout(resolve, 800));

      expect(canvas.getByTestId('status').textContent).toBe('open');
      expect(canvas.getByTestId('splash-icon')).toBeInTheDocument();
    });

    await step('点击关闭: 动画回去', async () => {
      await userEvent.click(canvas.getByTestId('splash-icon'));
      await new Promise((resolve) => setTimeout(resolve, 800));

      expect(canvas.getByTestId('status').textContent).toBe('closed');
      expect(canvas.getByTestId('icon')).toBeInTheDocument();
    });
  },
};

// 模拟“胶囊按钮”组件
const CapsuleButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
      className="absolute top-4 right-4 z-50 flex h-8 items-center overflow-hidden rounded-full border border-white/20 bg-black/20 backdrop-blur-md"
    >
      {/* 菜单按钮 (模拟) */}
      <button className="flex h-full w-10 items-center justify-center hover:bg-white/10 active:bg-white/20">
        <div className="flex gap-[2px]">
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
        </div>
      </button>

      {/* 分割线 */}
      <div className="h-4 w-[1px] bg-white/20" />

      {/* 关闭按钮 (功能性) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="flex h-full w-10 items-center justify-center hover:bg-white/10 active:bg-white/20"
        data-testid="capsule-close"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  );
};

export const IconToMiniProgram: Story = {
  render: function IOSLaunch() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <MotionConfig transition={{ type: 'spring', stiffness: 220, damping: 28 }}>
        <LayoutGroup>
          <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-100 font-sans">
            <div className="absolute top-10 text-xs text-zinc-400">iOS 风格启动：图标内容随窗口同步放大</div>

            <AnimatePresence mode="popLayout">
              {!isOpen ? (
                /* ================= ICON 状态 ================= */
                <motion.div
                  key="icon"
                  layoutId="app-container" // 1. 容器变形
                  className="relative cursor-pointer overflow-hidden bg-black text-white shadow-2xl"
                  style={{
                    width: 68, // iOS 图标标准尺寸
                    height: 68,
                    borderRadius: 16, // 连续曲率圆角
                    position: 'absolute',
                    zIndex: 10,
                  }}
                  onClick={() => setIsOpen(true)}
                  data-testid="app-icon"
                >
                  {/* 2. Logo 变形：居中，尺寸较小 */}
                  <motion.div layoutId="app-logo" className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl"></span>
                  </motion.div>
                </motion.div>
              ) : (
                /* ================= WINDOW 状态 ================= */
                <motion.div
                  key="window"
                  layoutId="app-container" // 1. 容器变形
                  className="relative flex flex-col overflow-hidden bg-black shadow-2xl"
                  style={{
                    width: 375,
                    height: 812, // iPhone 尺寸
                    borderRadius: 40, // 屏幕圆角
                    zIndex: 20,
                  }}
                  data-testid="app-window"
                >
                  {/*
                      核心技巧：
                      在 Window 打开时，Logo 依然存在且居中，但是变大了。
                      Motion 会自动计算小 Logo 到大 Logo 的插值。
                      这给人的感觉就是“图标放大了”。
                   */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div layoutId="app-logo" className="flex items-center justify-center">
                      {/* 这里 Logo 变大了，并且透明度逐渐变淡，因为内容要浮现了 */}
                      <motion.span
                        className="text-9xl" // 变大！
                        animate={{ opacity: 0.1, scale: 1.2 }} // 可选：进入后淡化或继续微调
                        transition={{ delay: 0.3, duration: 0.5 }} // 变形结束后再淡化
                      >
                        
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* ================= 实际 APP 内容 ================= */}
                  {/* 使用 absolute 覆盖在 Splash Logo 上，并延迟显示 */}
                  <div className="relative z-10 flex h-full w-full flex-col">
                    <CapsuleButton onClose={() => setIsOpen(false)} />

                    <motion.div
                      className="flex-1 overflow-y-auto p-6 pt-24 text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }} // 简单的淡入
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <h1 className="mb-2 text-3xl font-bold">My App</h1>
                      <p className="mb-8 text-zinc-500">Designed by Apple in California</p>

                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800"
                          >
                            <div className="mb-2 h-8 w-8 rounded-full bg-white/20" />
                            <div className="h-2 w-16 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </MotionConfig>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((resolve) => setTimeout(resolve, 500));

    await step('Tap Icon', async () => {
      await userEvent.click(canvas.getByTestId('app-icon'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(canvas.getByTestId('app-window')).toBeInTheDocument();
    });

    await step('Close App', async () => {
      await userEvent.click(canvas.getByTestId('capsule-close'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(canvas.getByTestId('app-icon')).toBeInTheDocument();
    });
  },
};
