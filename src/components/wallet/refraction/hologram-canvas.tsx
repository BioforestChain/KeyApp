import { useEffect, useId, useRef, useCallback } from 'react'
import { hologramScheduler } from './scheduler'
import type { Priority } from './types'

type RenderMode = 'dynamic' | 'static'

export interface HologramCanvasProps {
  priority?: Priority
  enabledPattern: boolean
  enabledWatermark: boolean
  mode?: RenderMode
  pointerX: number
  pointerY: number
  active: boolean
  themeHue: number
  watermarkMaskUrl?: string | null
  watermarkCellSize?: number
  watermarkIconSize?: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function HologramCanvas({
  priority = 'high',
  enabledPattern,
  enabledWatermark,
  mode = 'dynamic',
  pointerX,
  pointerY,
  active,
  themeHue,
  watermarkMaskUrl,
  watermarkCellSize,
  watermarkIconSize,
}: HologramCanvasProps) {
  const cardId = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const transferredRef = useRef(false) // Track if canvas was transferred (can only happen once)
  const registeredRef = useRef(false)

  // Store current props in ref for ResizeObserver callback
  const propsRef = useRef({
    priority,
    mode,
    pointerX,
    pointerY,
    active,
    themeHue,
    enabledPattern,
    enabledWatermark,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  })
  propsRef.current = {
    priority,
    mode,
    pointerX,
    pointerY,
    active,
    themeHue,
    enabledPattern,
    enabledWatermark,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  }

  // Schedule state update (reads from refs to avoid stale closures)
  const scheduleUpdate = useCallback(() => {
    queueMicrotask(() => {
      if (!registeredRef.current) return

      const props = propsRef.current
      const pointer =
        props.mode === 'static' ? { x: 0, y: 0 } : { x: clamp(props.pointerX, -1, 1), y: clamp(props.pointerY, -1, 1) }

      hologramScheduler.update({
        cardId,
        priority: props.priority,
        mode: props.mode,
        ...sizeRef.current,
        pointer,
        active: props.mode === 'static' ? false : props.active,
        themeHue: props.themeHue,
        enabledPattern: props.enabledPattern,
        enabledWatermark: props.enabledWatermark,
        watermarkMaskUrl: props.watermarkMaskUrl,
        watermarkCellSize: props.watermarkCellSize,
        watermarkIconSize: props.watermarkIconSize,
      })
    })
  }, [cardId])

  // Register canvas with scheduler (only once - canvas can only be transferred once)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || transferredRef.current) return

    transferredRef.current = true
    registeredRef.current = true
    hologramScheduler.register(cardId, canvas)

    // Note: 不 unregister 因为：
    // 1. canvas 只能 transfer 一次，cleanup 后无法重新注册
    // 2. React Strict Mode 会 mount → unmount → mount
    // 3. Worker 会保持引用，但组件卸载后不再收到 state 更新，自然停止渲染
  }, [cardId])

  // Observe size changes
  useEffect(() => {
    const parent = canvasRef.current?.parentElement
    if (!parent) return

    const updateSize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(3, window.devicePixelRatio || 1)
      sizeRef.current = {
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
        dpr,
      }
    }

    const ro = new ResizeObserver(() => {
      updateSize()
      scheduleUpdate()
    })
    ro.observe(parent)
    updateSize()
    // Initial update after size is set
    scheduleUpdate()

    return () => ro.disconnect()
  }, [scheduleUpdate])

  // Preload watermark image
  useEffect(() => {
    if (watermarkMaskUrl) {
      hologramScheduler.loadWatermark(watermarkMaskUrl, watermarkMaskUrl)
    }
  }, [watermarkMaskUrl])

  // Update state when props change
  useEffect(() => {
    scheduleUpdate()
  }, [
    scheduleUpdate,
    priority,
    mode,
    pointerX,
    pointerY,
    active,
    themeHue,
    enabledPattern,
    enabledWatermark,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 size-full"
      data-testid="wallet-card-hologram-canvas"
      data-pattern-enabled={enabledPattern ? 'true' : 'false'}
      data-watermark-enabled={enabledWatermark ? 'true' : 'false'}
      data-mode={mode}
      data-priority={priority}
    />
  )
}
