/**
 * Miniapp Runtime Hooks
 *
 * 提供与小程序运行时生命周期相关的 React hooks。
 */

import { useEffect, useSyncExternalStore } from 'react'
import type { MiniappTargetDesktop } from '../ecosystem/types'
import type { SlotStatus } from './types'
import { getSlotStatus, subscribeSlotStatus } from './runtime-refs'

// 延迟导入避免循环依赖 - 使用 import() 动态导入
async function loadMiniappRuntime() {
  return import('./index')
}

/**
 * 当组件挂载/渲染时，恢复当前活跃的小程序可见性。
 *
 * 使用场景：
 * - 放在 Activity 内部的组件中（如 EcosystemTab）
 * - 当 Activity 从 hidden 变为 visible 时，确保小程序窗口重新显示
 *
 * 原理：
 * - React 19 Activity mode="hidden" 可能暂停组件而非卸载
 * - MiniappWindowStack 的 slots 在 Activity 内部注册
 * - MiniappWindowPortal 需要有效的 portalHost 才能渲染
 * - 此 hook 在组件渲染后调用 activateApp()，触发 store 更新
 * - 确保 slots 已注册后再触发 MiniappWindowPortal 重新渲染
 *
 * @example
 * ```tsx
 * function EcosystemTab() {
 *   useMiniappVisibilityRestore();
 *   return <EcosystemDesktop ... />;
 * }
 * ```
 */
export function useMiniappVisibilityRestore(): void {
  useEffect(() => {
    loadMiniappRuntime().then(({ miniappRuntimeStore, activateApp }) => {
      const { activeAppId } = miniappRuntimeStore.state
      if (activeAppId) {
        activateApp(activeAppId)
      }
    })
  })
}

/**
 * 订阅指定 slot 的状态
 *
 * @param desktop - 目标桌面（mine 或 stack）
 * @param appId - 应用 ID
 * @returns slot 状态：'ready'（已注册）、'lost'（已注销）或 null（从未注册）
 *
 * @example
 * ```tsx
 * function MiniappWindowPortal({ appId, presentation }) {
 *   const slotStatus = useSlotStatus(presentation.desktop, appId);
 *   const isSlotLost = slotStatus === 'lost';
 *   // ...
 * }
 * ```
 */
export function useSlotStatus(desktop: MiniappTargetDesktop, appId: string): SlotStatus | null {
  return useSyncExternalStore(
    subscribeSlotStatus,
    () => getSlotStatus(desktop, appId),
    () => getSlotStatus(desktop, appId)
  )
}
