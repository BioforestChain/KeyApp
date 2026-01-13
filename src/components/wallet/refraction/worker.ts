import { renderHologram, resolveBackgroundStops, type BackgroundStops, type PatternCache } from './renderer'
import type { WorkerMessage, RenderState, Priority } from './types'

interface CardResources {
  canvas: OffscreenCanvas
  ctx: OffscreenCanvasRenderingContext2D
  patternLayer: OffscreenCanvas
  watermarkLayer: OffscreenCanvas
  patternMaskCache: PatternCache | null
  watermarkMaskCache: PatternCache | null
  bgStops: BackgroundStops | null
  lastThemeHue: number
  // 静态模式缓存
  staticCache: ImageBitmap | null
  staticCacheKey: string | null
  // 上一次渲染的状态快照（用于跳过无变化的渲染）
  lastStateKey: string | null
}

/** 生成状态快照 key，用于检测变化 */
function stateKey(s: RenderState, w: number, h: number): string {
  return `${w}:${h}:${s.mode}:${s.pointer.x.toFixed(3)}:${s.pointer.y.toFixed(3)}:${s.active}:${s.themeHue}:${s.enabledPattern}:${s.enabledWatermark}:${s.watermarkMaskUrl}`
}

const cards = new Map<string, CardResources>()
const watermarkImages = new Map<string, ImageBitmap>()
let triangleMask: ImageBitmap | null = null

let frameCount = 0
const FRAME_DIVISOR: Record<Priority, number> = { high: 1, medium: 2, low: 4 }
// medium 和 low 使用固定 DPR 值
const FIXED_DPR: Record<Priority, number | null> = { high: null, medium: 1, low: 0.5 }

let pendingStates: RenderState[] = []
let rafId: number | null = null

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  switch (e.data.type) {
    case 'register': {
      const ctx = e.data.canvas.getContext('2d')
      if (ctx) {
        cards.set(e.data.cardId, {
          canvas: e.data.canvas,
          ctx,
          patternLayer: new OffscreenCanvas(1, 1),
          watermarkLayer: new OffscreenCanvas(1, 1),
          patternMaskCache: null,
          watermarkMaskCache: null,
          bgStops: null,
          lastThemeHue: -1,
          staticCache: null,
          staticCacheKey: null,
          lastStateKey: null,
        })
        // Trigger render after registration if we have pending states
        if (pendingStates.length > 0) {
          scheduleRender()
        }
      }
      break
    }
    case 'unregister': {
      const card = cards.get(e.data.cardId)
      if (card) {
        card.staticCache?.close() // 释放 ImageBitmap 资源
        cards.delete(e.data.cardId)
      }
      break
    }
    case 'update':
      pendingStates = e.data.states
      scheduleRender()
      break
    case 'setTriangleMask':
      triangleMask = e.data.bitmap
      // Trigger render after receiving triangle mask
      if (pendingStates.length > 0) {
        scheduleRender()
      }
      break
    case 'loadWatermark': {
      try {
        const res = await fetch(e.data.url)
        const blob = await res.blob()
        const bitmap = await createImageBitmap(blob)
        watermarkImages.set(e.data.key, bitmap)
        // Trigger render after watermark loads
        if (pendingStates.length > 0) {
          scheduleRender()
        }
      } catch {
        /* ignore load errors */
      }
      break
    }
  }
}

function scheduleRender() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(renderFrame)
}

function renderFrame() {
  rafId = null
  frameCount++

  // Sort by priority: high → medium → low
  const sorted = pendingStates.slice().toSorted((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority))

  for (const state of sorted) {
    // Frame rate division based on priority
    if (frameCount % FRAME_DIVISOR[state.priority] !== 0) continue

    const card = cards.get(state.cardId)
    if (!card) continue

    // high: 使用完整 devicePixelRatio, medium/low: 使用固定值
    const fixedDpr = FIXED_DPR[state.priority]
    const effectiveDpr = fixedDpr ?? state.dpr
    const w = Math.max(1, Math.round(state.width * effectiveDpr))
    const h = Math.max(1, Math.round(state.height * effectiveDpr))

    // 动态刷新优化：状态无变化时跳过渲染
    const currentStateKey = stateKey(state, w, h)
    if (card.lastStateKey === currentStateKey) {
      continue // 跳过无变化的帧
    }

    if (card.canvas.width !== w) card.canvas.width = w
    if (card.canvas.height !== h) card.canvas.height = h

    // 静态模式缓存：mode='static' 时只渲染一次
    if (state.mode === 'static' && card.staticCache && card.staticCacheKey === currentStateKey) {
      // 直接使用缓存
      card.ctx.drawImage(card.staticCache, 0, 0)
      card.lastStateKey = currentStateKey
      continue
    }

    // Update bgStops when themeHue changes
    if (card.lastThemeHue !== state.themeHue) {
      card.bgStops = resolveBackgroundStops(state.themeHue)
      card.lastThemeHue = state.themeHue
    }

    // Render
    const caches = renderHologram(
      card.ctx,
      { ...state, dpr: effectiveDpr },
      {
        bgStops: card.bgStops,
        triangleMask,
        watermarkMask: state.watermarkMaskUrl ? (watermarkImages.get(state.watermarkMaskUrl) ?? null) : null,
        patternLayer: card.patternLayer,
        watermarkLayer: card.watermarkLayer,
        patternMaskCache: card.patternMaskCache,
        watermarkMaskCache: card.watermarkMaskCache,
      },
    )

    card.patternMaskCache = caches.patternMaskCache
    card.watermarkMaskCache = caches.watermarkMaskCache
    card.lastStateKey = currentStateKey

    // 静态模式：缓存渲染结果
    if (state.mode === 'static') {
      card.staticCache?.close() // 释放旧缓存
      card.staticCache = card.canvas.transferToImageBitmap()
      card.staticCacheKey = currentStateKey
      // 重新绘制到 canvas（因为 transferToImageBitmap 会清空 canvas）
      card.ctx.drawImage(card.staticCache, 0, 0)
    }
  }

  // Continue rendering if any card is active (interactive)
  if (pendingStates.some((s) => s.active)) {
    scheduleRender()
  }
}

function priorityOrder(p: Priority) {
  return p === 'high' ? 0 : p === 'medium' ? 1 : 2
}

self.postMessage({ type: 'ready' }, self.location.origin)
