import { useStore } from '@tanstack/react-store';
import { LayoutGroup } from 'motion/react';
import { Stack } from './stackflow';
import { MiniappWindow, MiniappStackView } from './components/ecosystem';
import { miniappRuntimeStore, miniappRuntimeSelectors, closeStackView } from './services/miniapp-runtime';
import { MiniappVisualProvider } from './services/miniapp-runtime/MiniappVisualProvider';
import { DevWatermark } from './components/common/DevWatermark';

export function StackflowApp() {
  const isStackViewOpen = useStore(miniappRuntimeStore, miniappRuntimeSelectors.isStackViewOpen);

  return (
    <MiniappVisualProvider>
      <LayoutGroup id="miniapp-shared-layout">
        <>
          <Stack />
          {/* 小程序窗口 - 全局 Popover 层 */}
          <MiniappWindow />
          {/* 层叠视图 - 多应用管理 */}
          <MiniappStackView visible={isStackViewOpen} onClose={closeStackView} />
          {/* 开发版水印 */}
          <DevWatermark />
        </>
      </LayoutGroup>
    </MiniappVisualProvider>
  );
}
