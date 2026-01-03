import { useStore } from '@tanstack/react-store';
import { LayoutGroup, MotionConfig, type Transition } from 'motion/react';
import { Stack } from './stackflow';
import { MiniappWindow, MiniappStackView } from './components/ecosystem';
import { miniappRuntimeStore, miniappRuntimeSelectors, closeStackView } from './services/miniapp-runtime';

const MOTION_DEBUG_SPEED = 0.05;
const MOTION_DEBUG_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220 * MOTION_DEBUG_SPEED * MOTION_DEBUG_SPEED,
  damping: 28 * MOTION_DEBUG_SPEED,
  mass: 0.85,
  // duration: 20000,
} as const;

export function StackflowApp() {
  const isStackViewOpen = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isStackViewOpen);

  return (
    <MotionConfig transition={MOTION_DEBUG_TRANSITION}>
      <LayoutGroup id="miniapp-shared-layout">
        <>
          <Stack />
          {/* 小程序窗口 - 全局 Popover 层 */}
          <MiniappWindow />
          {/* 层叠视图 - 多应用管理 */}
          <MiniappStackView visible={isStackViewOpen} onClose={closeStackView} />
        </>
      </LayoutGroup>
    </MotionConfig>
  );
}
