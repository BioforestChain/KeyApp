import { useEffect, useMemo, useRef } from 'react'

type RenderMode = 'dynamic' | 'static'

export interface HologramCanvasProps {
  enabledPattern: boolean
  enabledWatermark: boolean
  mode?: RenderMode
  /**
   * 指针位置（-1~1）
   * - x: 左(-1) → 右(1)
   * - y: 上(-1) → 下(1)
   */
  pointerX: number
  pointerY: number
  active: boolean
  themeHue: number
  /**
   * 水印 mask（白色 + alpha），用于在 Canvas 内生成平铺 watermark。
   * 该 URL 通常来自 useMonochromeMask。
   */
  watermarkMaskUrl?: string | null
  /** 水印单元格尺寸（CSS px） */
  watermarkCellSize?: number
  /** 水印图标绘制尺寸（CSS px） */
  watermarkIconSize?: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function normalizeHueDegrees(value: number) {
  const mod = value % 360
  return mod < 0 ? mod + 360 : mod
}

function srgbEncode(linear: number) {
  const v = clamp(linear, 0, 1)
  if (v <= 0.0031308) return 12.92 * v
  return 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

function oklchToSrgbCssColor(L: number, C: number, H: number) {
  const hr = (normalizeHueDegrees(H) * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)

  // OKLab -> LMS (non-linear)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  // linear sRGB
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  const r = clamp(Math.round(srgbEncode(rLin) * 255), 0, 255)
  const g = clamp(Math.round(srgbEncode(gLin) * 255), 0, 255)
  const bb = clamp(Math.round(srgbEncode(bLin) * 255), 0, 255)

  return `rgb(${r}, ${g}, ${bb})`
}

// 纹理（mask）由业务方提供；这里使用 KeyApp 当前的三角纹理（等价于原 DOM mask）。
const TRIANGLE_MASK_DATA_URL =
  'data:image/svg+xml,%3Csvg%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2010%2010%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M0%2010%20L10%2010%20L10%200%20Z%27%20fill%3D%27black%27%2F%3E%3C%2Fsvg%3E'

interface SizeInfo {
  width: number
  height: number
  dpr: number
  pxW: number
  pxH: number
}

function resizeCanvasToContainer(canvas: HTMLCanvasElement): SizeInfo {
  const parent = canvas.parentElement
  if (!parent) return { width: 0, height: 0, dpr: 1, pxW: 0, pxH: 0 }

  const rect = parent.getBoundingClientRect()
  const dpr = typeof window === 'undefined' ? 1 : Math.max(1, Math.min(3, window.devicePixelRatio || 1))
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))

  // 重要：canvas 的 width/height attribute 是绘制缓冲区像素尺寸（device pixels），
  // 但 CSS 布局尺寸必须保持为未缩放的 CSS px，否则高 DPR 设备会“看起来被放大”。
  // 仅依赖 absolute/inset 在部分 Android WebView 上不够稳定，这里显式写入。
  const cssW = `${width}px`
  const cssH = `${height}px`
  if (canvas.style.width !== cssW) canvas.style.width = cssW
  if (canvas.style.height !== cssH) canvas.style.height = cssH

  const pxW = Math.max(1, Math.round(width * dpr))
  const pxH = Math.max(1, Math.round(height * dpr))

  if (canvas.width !== pxW) canvas.width = pxW
  if (canvas.height !== pxH) canvas.height = pxH

  return { width, height, dpr, pxW, pxH }
}

interface BackgroundStops {
  themeHue: number
  c0: string
  c1: string
  c2: string
}

function resolveBackgroundStops(themeHue: number): BackgroundStops | null {
  // themeHue 是 OKLCH 的 hue（0~360）。
  // 这里直接做 OKLCH -> sRGB 转换，避免依赖浏览器对 oklch() 的 computed-style 输出格式差异。
  return {
    themeHue,
    c0: oklchToSrgbCssColor(0.5, 0.2, themeHue),
    c1: oklchToSrgbCssColor(0.4, 0.22, themeHue + 20),
    c2: oklchToSrgbCssColor(0.3, 0.18, themeHue + 40),
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bg: BackgroundStops | null) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.filter = 'none'

  if (bg) {
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, bg.c0)
    grad.addColorStop(0.5, bg.c1)
    grad.addColorStop(1, bg.c2)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = 'rgb(0, 0, 0)'
  }

  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function centeredPatternOffset(containerPx: number, tilePx: number) {
  if (!(tilePx > 0)) return 0
  const halfTile = tilePx / 2
  const desired = containerPx / 2 - halfTile
  const mod = ((desired % tilePx) + tilePx) % tilePx
  return mod
}

function fillWithCenteredPattern(ctx: CanvasRenderingContext2D, pattern: CanvasPattern, w: number, h: number, tilePx: number) {
  const ox = centeredPatternOffset(w, tilePx)
  const oy = centeredPatternOffset(h, tilePx)

  ctx.save()
  ctx.translate(-ox, -oy)
  ctx.fillStyle = pattern
  // 多画一圈，避免偏移后边缘漏填
  ctx.fillRect(-tilePx, -tilePx, w + tilePx * 2, h + tilePx * 2)
  ctx.restore()
}

interface RefractionCornerConfig {
  corner: 'bottom-left' | 'top-right'
  sizeMultiplier: 5
  translateX: { base: number; xFactor: number; clamp: number }
  translateY: { yFactor: number; mode: 'max0' | 'min0' }
  scale: { base: number; xFactor: number }
}

const REFRACTION_CORNERS: RefractionCornerConfig[] = [
  {
    corner: 'bottom-left',
    sizeMultiplier: 5,
    translateX: { base: -0.1, xFactor: 0.1, clamp: 0.1 },
    translateY: { yFactor: -0.1, mode: 'max0' },
    scale: { base: 0.15, xFactor: 0.25 },
  },
  {
    corner: 'top-right',
    sizeMultiplier: 5,
    translateX: { base: 0.1, xFactor: 0.1, clamp: 0.1 },
    translateY: { yFactor: -0.1, mode: 'min0' },
    scale: { base: 0.15, xFactor: -0.65 },
  },
]

function getDemoGradientStops() {
  // DEMO：transparent 10% ... transparent 60%，中间 3 个颜色 stop 未指定位置 => 平均分布
  const start = 0.1
  const end = 0.6
  const step = (end - start) / 4

  return [
    { stop: start, color: 'rgba(0,0,0,0)' },
    // hsl(5 100% 80%), hsl(150 100% 60%), hsl(220 90% 70%)
    { stop: start + step * 1, color: 'rgb(255, 162, 153)' },
    { stop: start + step * 2, color: 'rgb(51, 255, 153)' },
    { stop: start + step * 3, color: 'rgb(110, 156, 247)' },
    { stop: end, color: 'rgba(0,0,0,0)' },
  ] as const
}

function drawRefraction(
  ctx: CanvasRenderingContext2D,
  config: RefractionCornerConfig,
  canvas: { w: number; h: number },
  pointer: { x: number; y: number },
  alpha: number,
) {
  if (!(alpha > 0)) return

  // 复刻 DEMO：refraction 宽度 500%（按容器宽度），并保持正方形
  const elementSide = canvas.w * config.sizeMultiplier
  // radial-gradient(circle ...) 默认 size = farthest-corner
  const radius = elementSide * Math.SQRT2

  const scale = Math.min(1, config.scale.base + pointer.x * config.scale.xFactor)

  const tx =
    clamp(config.translateX.base + pointer.x * config.translateX.xFactor, -config.translateX.clamp, config.translateX.clamp) *
    elementSide

  const rawTy = pointer.y * config.translateY.yFactor * elementSide
  const ty = config.translateY.mode === 'max0' ? Math.max(0, rawTy) : Math.min(0, rawTy)

  let originX = 0
  let originY = 0
  let elementBoxX = 0
  let elementBoxY = 0

  if (config.corner === 'bottom-left') {
    originX = 0
    originY = canvas.h
    // absolute bottom-0 left-0: box 从左下角向右上延伸
    elementBoxX = 0
    elementBoxY = -elementSide
  } else {
    originX = canvas.w
    originY = 0
    // absolute top-0 right-0: box 从右上角向左下延伸
    elementBoxX = -elementSide
    elementBoxY = 0
  }

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(originX, originY)
  ctx.translate(tx, ty)
  ctx.scale(scale, scale)
  // DEMO：单个 refraction 元素 filter:saturate(2)
  ctx.filter = 'saturate(2)'

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  for (const s of getDemoGradientStops()) grad.addColorStop(s.stop, s.color)

  ctx.fillStyle = grad
  ctx.fillRect(elementBoxX, elementBoxY, elementSide, elementSide)
  ctx.restore()
}

function ensureScaledPattern(
  ctx: CanvasRenderingContext2D,
  cache: { key: string; pattern: CanvasPattern; tilePx: number } | null,
  key: string,
  image: HTMLImageElement,
  tilePx: number,
) {
  if (cache && cache.key === key) return cache

  const tile = document.createElement('canvas')
  tile.width = tilePx
  tile.height = tilePx
  const tctx = tile.getContext('2d')
  if (!tctx) return null

  tctx.clearRect(0, 0, tile.width, tile.height)
  tctx.drawImage(image, 0, 0, tile.width, tile.height)

  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return null

  return { key, pattern, tilePx }
}

function ensureCenteredIconPattern(
  ctx: CanvasRenderingContext2D,
  cache: { key: string; pattern: CanvasPattern; tilePx: number } | null,
  key: string,
  image: HTMLImageElement,
  cellPx: number,
  iconPx: number,
) {
  if (cache && cache.key === key) return cache

  const tile = document.createElement('canvas')
  tile.width = cellPx
  tile.height = cellPx
  const tctx = tile.getContext('2d')
  if (!tctx) return null

  tctx.clearRect(0, 0, tile.width, tile.height)
  const offset = (cellPx - iconPx) / 2
  tctx.drawImage(image, offset, offset, iconPx, iconPx)

  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return null

  return { key, pattern, tilePx: cellPx }
}

function renderMaskedLayer(
  layerCtx: CanvasRenderingContext2D,
  canvas: { w: number; h: number },
  pointer: { x: number; y: number },
  refractionAlpha: number,
  baseFill: string,
  mask: { pattern: CanvasPattern; tilePx: number },
) {
  layerCtx.save()
  layerCtx.setTransform(1, 0, 0, 1, 0, 0)
  layerCtx.clearRect(0, 0, canvas.w, canvas.h)
  layerCtx.globalCompositeOperation = 'source-over'
  layerCtx.globalAlpha = 1
  layerCtx.filter = 'none'

  // DEMO：pattern/watermark 自身有 ::before 的纯色底
  layerCtx.fillStyle = baseFill
  layerCtx.fillRect(0, 0, canvas.w, canvas.h)

  for (const cfg of REFRACTION_CORNERS) {
    drawRefraction(layerCtx, cfg, canvas, pointer, refractionAlpha)
  }

  // 应用 mask（等价于 CSS mask）
  layerCtx.globalCompositeOperation = 'destination-in'
  layerCtx.globalAlpha = 1
  layerCtx.filter = 'none'
  fillWithCenteredPattern(layerCtx, mask.pattern, canvas.w, canvas.h, mask.tilePx)

  layerCtx.restore()
}

function drawSpotlight(
  ctx: CanvasRenderingContext2D,
  canvas: { w: number; h: number },
  pointer: { x: number; y: number },
  alpha: number,
) {
  if (!(alpha > 0)) return

  // 对齐 DEMO：spotlight::before width=500%（基于 card 宽度），translate(-50% + pointer*20%)
  const elementSide = canvas.w * 5
  const radius = (elementSide * Math.SQRT2) / 2

  const cx = canvas.w / 2 + pointer.x * canvas.w
  const cy = canvas.h / 2 + pointer.y * canvas.w

  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = alpha
  ctx.filter = 'brightness(1.2) contrast(1.2)'

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  grad.addColorStop(0, 'rgba(255,255,255,0.4)')
  grad.addColorStop(0.02, 'rgba(255,255,255,0.4)')
  grad.addColorStop(0.2, 'rgba(26,26,26,0.2)')
  grad.addColorStop(1, 'rgba(26,26,26,0.2)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.w, canvas.h)
  ctx.restore()
}

export function HologramCanvas({
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scheduleRenderRef = useRef<(() => void) | null>(null)

  const stablePointer = useMemo(() => {
    if (mode === 'static') return { x: 0, y: 0 }
    return { x: clamp(pointerX, -1, 1), y: clamp(pointerY, -1, 1) }
  }, [mode, pointerX, pointerY])

  const stableActive = mode === 'static' ? false : active
  const renderStateRef = useRef({
    enabledPattern,
    enabledWatermark,
    pointer: stablePointer,
    active: stableActive,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  })
  renderStateRef.current = {
    enabledPattern,
    enabledWatermark,
    pointer: stablePointer,
    active: stableActive,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  }

  const bgStopsRef = useRef<BackgroundStops | null>(null)
  useEffect(() => {
    bgStopsRef.current = resolveBackgroundStops(themeHue)
    scheduleRenderRef.current?.()
  }, [themeHue])

  const triangleMaskImageRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    let canceled = false
    const img = new Image()
    img.onload = () => {
      if (canceled) return
      triangleMaskImageRef.current = img
      scheduleRenderRef.current?.()
    }
    img.onerror = () => {
      if (canceled) return
      triangleMaskImageRef.current = null
      scheduleRenderRef.current?.()
    }
    img.src = TRIANGLE_MASK_DATA_URL
    return () => {
      canceled = true
    }
  }, [])

  const watermarkMaskImageRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!watermarkMaskUrl) {
      watermarkMaskImageRef.current = null
      scheduleRenderRef.current?.()
      return
    }

    let canceled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (canceled) return
      watermarkMaskImageRef.current = img
      scheduleRenderRef.current?.()
    }
    img.onerror = () => {
      if (canceled) return
      watermarkMaskImageRef.current = null
      scheduleRenderRef.current?.()
    }
    img.src = watermarkMaskUrl
    return () => {
      canceled = true
    }
  }, [watermarkMaskUrl])

  const patternLayerRef = useRef<HTMLCanvasElement | null>(null)
  const watermarkLayerRef = useRef<HTMLCanvasElement | null>(null)

  const patternMaskCacheRef = useRef<{ key: string; pattern: CanvasPattern; tilePx: number } | null>(null)
  const watermarkMaskCacheRef = useRef<{ key: string; pattern: CanvasPattern; tilePx: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number | null = null

    const render = () => {
      const state = renderStateRef.current
      const size = resizeCanvasToContainer(canvas)
      if (size.pxW <= 0 || size.pxH <= 0) return

      const w = size.pxW
      const h = size.pxH

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawBackground(ctx, w, h, bgStopsRef.current)

      const refractionAlpha = state.active ? 1 : 0

      // DEMO：pattern layer => mix-blend-mode:multiply + opacity:0.4 + filter:saturate/contrast/brightness
      if (state.enabledPattern) {
        const maskImg = triangleMaskImageRef.current
        if (maskImg) {
          const layer = patternLayerRef.current ?? document.createElement('canvas')
          if (patternLayerRef.current !== layer) patternLayerRef.current = layer
          if (layer.width !== w) layer.width = w
          if (layer.height !== h) layer.height = h
          const layerCtx = layer.getContext('2d')
          if (layerCtx) {
            const tilePx = Math.max(1, Math.round(24 * size.dpr))
            const maskKey = `triangle:${tilePx}`
            const nextCache = ensureScaledPattern(layerCtx, patternMaskCacheRef.current, maskKey, maskImg, tilePx)
            if (nextCache) {
              patternMaskCacheRef.current = nextCache

              renderMaskedLayer(
                layerCtx,
                { w, h },
                state.pointer,
                refractionAlpha,
                'rgb(204, 204, 204)',
                { pattern: nextCache.pattern, tilePx: nextCache.tilePx },
              )

              ctx.save()
              ctx.globalCompositeOperation = 'multiply'
              ctx.globalAlpha = 0.4
              ctx.filter = 'saturate(0.8) contrast(1) brightness(1)'
              ctx.drawImage(layer, 0, 0)
              ctx.restore()
            }
          }
        }
      }

      // DEMO：watermark layer => mix-blend-mode:hard-light + opacity:1 + filter:saturate/contrast/brightness
      if (state.enabledWatermark) {
        const maskImg = watermarkMaskImageRef.current
        const cellSize = state.watermarkCellSize ?? 40
        const iconSize = state.watermarkIconSize ?? 24

        if (maskImg && cellSize > 0 && iconSize > 0) {
          const layer = watermarkLayerRef.current ?? document.createElement('canvas')
          if (watermarkLayerRef.current !== layer) watermarkLayerRef.current = layer
          if (layer.width !== w) layer.width = w
          if (layer.height !== h) layer.height = h
          const layerCtx = layer.getContext('2d')
          if (layerCtx) {
            const cellPx = Math.max(1, Math.round(cellSize * size.dpr))
            const iconPx = Math.max(1, Math.round(iconSize * size.dpr))
            const maskKey = `cell:${state.watermarkMaskUrl ?? 'null'}:${cellPx}:${iconPx}`
            const nextCache = ensureCenteredIconPattern(layerCtx, watermarkMaskCacheRef.current, maskKey, maskImg, cellPx, iconPx)
            if (nextCache) {
              watermarkMaskCacheRef.current = nextCache

              renderMaskedLayer(layerCtx, { w, h }, state.pointer, refractionAlpha, 'rgba(255, 255, 255, 0.2)', {
                pattern: nextCache.pattern,
                tilePx: nextCache.tilePx,
              })

              ctx.save()
              ctx.globalCompositeOperation = 'hard-light'
              ctx.globalAlpha = 1
              ctx.filter = 'saturate(0.9) contrast(1.1) brightness(1.2)'
              ctx.drawImage(layer, 0, 0)
              ctx.restore()
            }
          }
        }
      }

      // DEMO：spotlight => mix-blend-mode: overlay（hover/tap 时出现）
      drawSpotlight(ctx, { w, h }, state.pointer, state.active ? 1 : 0)
    }

    const schedule = () => {
      if (rafId != null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        render()
      })
    }

    scheduleRenderRef.current = schedule

    const parent = canvas.parentElement
    const ro =
      typeof ResizeObserver !== 'undefined' && parent
        ? new ResizeObserver(() => {
            schedule()
          })
        : null

    ro?.observe(parent!)
    schedule()

    return () => {
      scheduleRenderRef.current = null
      if (rafId != null) window.cancelAnimationFrame(rafId)
      ro?.disconnect()
    }
  }, [])

  // props 变化时触发渲染（避免 effect 里创建新的 ResizeObserver）
  useEffect(() => {
    scheduleRenderRef.current?.()
  }, [
    enabledPattern,
    enabledWatermark,
    stableActive,
    stablePointer,
    themeHue,
    watermarkMaskUrl,
    watermarkCellSize,
    watermarkIconSize,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      data-testid="wallet-card-hologram-canvas"
      data-pattern-enabled={enabledPattern ? 'true' : 'false'}
      data-watermark-enabled={enabledWatermark ? 'true' : 'false'}
      data-mode={mode}
    />
  )
}
