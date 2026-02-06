import { windowStackManager } from '@biochain/ecosystem-native';
import type { MiniappPresentation, MiniappInstance } from './types';
import type { RuntimeStateDomCommand } from './runtime-state-machine';

/**
 * DOM 绑定层：执行由状态机输出的命令
 */
export function domBindApplyCommand(command: RuntimeStateDomCommand): void {
  if (command.type === 'slot:interactive') {
    if (!windowStackManager.isStackRegistered(command.desktop)) return;
    windowStackManager.setSlotInteractive(command.desktop, command.appId, command.interactive);
  }
}

/**
 * DOM 绑定层：同步 iframe 的挂载目标（不直接触发状态变更）
 */
export function domBindSyncIframeMountTarget(
  app: MiniappInstance,
  presentation: MiniappPresentation | null | undefined,
): void {
  const handle = app.containerHandle;
  if (!handle || handle.type !== 'iframe') return;

  const desktop = presentation?.desktop ?? app.manifest.targetDesktop ?? 'stack';
  if (!windowStackManager.isStackRegistered(desktop)) return;

  const latestSlot = windowStackManager.getSlot(desktop, app.appId) ?? windowStackManager.getOrCreateSlot(desktop, app.appId);
  handle.setMountTarget?.(latestSlot);
}
