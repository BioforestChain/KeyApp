import { useEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
import { useStore } from '@tanstack/react-store'
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  registerDesktopGridHostRef,
  unregisterDesktopGridHostRef,
  registerDesktopAppSlotRef,
  unregisterDesktopAppSlotRef,
} from '@/services/miniapp-runtime'
import type { MiniappTargetDesktop } from '@/services/ecosystem/types'

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })

  const base64 =
    typeof globalThis.btoa === 'function'
      ? globalThis.btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64')

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function toMiniappGridAreaName(appId: string): string {
  return `app_${base64UrlEncode(appId)}`
}

function isTargetDesktop(value: string | null | undefined): value is MiniappTargetDesktop {
  return value === 'mine' || value === 'stack'
}

/**
 * MiniappWindowStack
 *
 * 一个统一的“窗口堆栈层”覆盖网格：
 * - 由 slide 决定布局（本组件只提供 slot 容器）
 * - slot 使用 `grid-area` 定位（基于 appId 的可逆安全名称）
 * - 本组件不区分 mine/stack 的 props，通过 DOM 上的 `data-ecosystem-subpage` 自识别
 */
export function MiniappWindowStack() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [desktop, setDesktop] = useState<MiniappTargetDesktop | null>(null)

  const activeApp = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getActiveApp)

  // 通过 DOM 祖先自识别该层属于 mine 还是 stack
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const page = root.closest('[data-ecosystem-subpage]')?.getAttribute('data-ecosystem-subpage') ?? null
    setDesktop(isTargetDesktop(page) ? page : null)
  }, [])

  // 注册/注销 grid host ref（便于 runtime 定位）
  useEffect(() => {
    const root = rootRef.current
    if (!root || !desktop) return

    registerDesktopGridHostRef(desktop, root)
    return () => unregisterDesktopGridHostRef(desktop)
  }, [desktop])

  // 只为当前 active app 提供 slot（一期最小闭环，避免多 area 布局复杂度）
  const slotApp = useMemo(() => {
    if (!desktop || !activeApp) return null
    const target = activeApp.manifest.targetDesktop ?? 'stack'
    return target === desktop ? activeApp : null
  }, [desktop, activeApp])

  const areaName = slotApp ? toMiniappGridAreaName(slotApp.appId) : null

  // ref 回调：注册/注销 app slot
  const setSlotRef = (el: HTMLDivElement | null) => {
    if (!desktop || !slotApp) return

    if (el) {
      registerDesktopAppSlotRef(desktop, slotApp.appId, el)
      return
    }

    unregisterDesktopAppSlotRef(desktop, slotApp.appId)
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 grid"
      style={{
        pointerEvents: 'none',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        ...(areaName ? { gridTemplateAreas: `"${areaName}"` } : {}),
      }}
      aria-hidden={true}
      data-testid="miniapp-window-stack"
    >
      {slotApp && areaName && (
        <div
          key={slotApp.appId}
          ref={setSlotRef}
          style={{ gridArea: areaName, pointerEvents: 'auto' }}
          data-miniapp-slot
          data-app-id={slotApp.appId}
        />
      )}
    </div>
  )
}

export default MiniappWindowStack
