import { Stack } from "./stackflow";
import { MiniappWindow } from "./components/ecosystem";

export function StackflowApp() {
  return (
    <>
      <Stack />
      {/* 小程序窗口 - 全局 Popover 层 */}
      <MiniappWindow />
    </>
  );
}
