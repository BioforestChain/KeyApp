import { useEffect, useRef } from 'react'
import {
  registerDesktopGridHostRef,
  unregisterDesktopGridHostRef,
  registerDesktopAppSlotRef,
  unregisterDesktopAppSlotRef,
} from '@/services/miniapp-runtime'
import type { MiniappTargetDesktop } from '@/services/ecosystem/types'
import {
  WindowStackWrapper,
  windowStackManager,
  type SlotInfo,
} from '@biochain/ecosystem-native/react'

export interface MiniappWindowStackProps {
  /** 指定该 stack 属于哪个桌面，必须传入 */
  desktop: MiniappTargetDesktop
}

/**
 * MiniappWindowStack
 *
 * 一个统一的"窗口堆栈层"覆盖网格：
 * - 由 slide 决定布局（本组件只提供 slot 容器）
 * - slot 统一叠放在同一 grid cell（1 / 1）
 *
 * 重构说明：
 * - 使用 Lit Web Component (WindowStackWrapper) 实现同步 slot 创建
 * - 消除了 React 异步渲染导致的竞态条件
 * - slot 现在由 windowStackManager.getOrCreateSlot() 同步创建
 * - desktop 必须通过 prop 传入，确保首次渲染就能注册 WindowStack
 */
export function MiniappWindowStack({ desktop }: MiniappWindowStackProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  // 注册/注销 grid host ref（便于 runtime 定位）
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    registerDesktopGridHostRef(desktop, root)
    return () => unregisterDesktopGridHostRef(desktop)
  }, [desktop])

  // 监听 Lit 组件的 slot 创建/销毁事件，同步到 runtime-refs
  useEffect(() => {
    const handleSlotCreated = (slot: SlotInfo) => {
      if (slot.desktop === desktop) {
        registerDesktopAppSlotRef(desktop, slot.appId, slot.element)
      }
    }

    const handleSlotRemoved = (appId: string, slotDesktop: MiniappTargetDesktop) => {
      if (slotDesktop === desktop) {
        unregisterDesktopAppSlotRef(desktop, appId)
      }
    }

    const unsubCreate = windowStackManager.onSlotCreated(handleSlotCreated)
    const unsubRemove = windowStackManager.onSlotRemoved(handleSlotRemoved)

    return () => {
      unsubCreate()
      unsubRemove()
    }
  }, [desktop])

  // 保持与原版完全一致的样式结构
  return (
    <div
      ref={rootRef}
      className="absolute left-0 right-0 top-0 z-20"
      style={{
        bottom: 'var(--tab-bar-height)',
        pointerEvents: 'none',
      }}
      aria-hidden={true}
      data-testid="miniapp-window-stack"
    >
      <WindowStackWrapper
        desktop={desktop}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

export default MiniappWindowStack
