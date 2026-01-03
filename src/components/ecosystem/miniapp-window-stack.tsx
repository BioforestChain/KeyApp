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

function isTargetDesktop(value: string | null | undefined): value is MiniappTargetDesktop {
  return value === 'mine' || value === 'stack'
}

/**
 * MiniappWindowStack
 *
 * 一个统一的“窗口堆栈层”覆盖网格：
 * - 由 slide 决定布局（本组件只提供 slot 容器）
 * - slot 统一叠放在同一 grid cell（1 / 1）
 * - 本组件不区分 mine/stack 的 props，通过 DOM 上的 `data-ecosystem-subpage` 自识别
 */
export function MiniappWindowStack() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [desktop, setDesktop] = useState<MiniappTargetDesktop | null>(null)

  const presentations = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getPresentations)

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

  const slotPresentations = useMemo(() => {
    if (!desktop) return []
    return presentations.filter((p) => p.desktop === desktop && p.state !== 'hidden')
  }, [desktop, presentations])

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 grid"
      style={{
        pointerEvents: 'none',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
      }}
      aria-hidden={true}
      data-testid="miniapp-window-stack"
    >
      {slotPresentations.map((p) => {
        const areaName = base64UrlEncode(p.appId)
        const setSlotRef = (el: HTMLDivElement | null) => {
          if (!desktop) return
          if (el) {
            registerDesktopAppSlotRef(desktop, p.appId, el)
            return
          }
          unregisterDesktopAppSlotRef(desktop, p.appId)
        }

        return (
          <div
            key={p.appId}
            ref={setSlotRef}
            style={{ gridArea: '1 / 1', pointerEvents: 'auto' }}
            data-miniapp-slot
            data-app-id={p.appId}
            data-area-name={areaName}
          />
        )
      })}
    </div>
  )
}

export default MiniappWindowStack
