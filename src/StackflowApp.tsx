import { useStore } from "@tanstack/react-store";
import { Stack } from "./stackflow";
import { MiniappWindow, MiniappStackView } from "./components/ecosystem";
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  closeStackView,
} from "./services/miniapp-runtime";

export function StackflowApp() {
  const isStackViewOpen = useStore(
    miniappRuntimeStore,
    miniappRuntimeSelectors.isStackViewOpen
  );

  return (
    <>
      <Stack />
      {/* 小程序窗口 - 全局 Popover 层 */}
      <MiniappWindow />
      {/* 层叠视图 - 多应用管理 */}
      <MiniappStackView
        visible={isStackViewOpen}
        onClose={closeStackView}
      />
    </>
  );
}
