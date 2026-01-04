import type { RenderState } from './types'

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

// ============================================================================
// 逻辑尺寸系统
// 设计空间使用逻辑单位，渲染时缩放到物理像素
// 卡片比例基于银行卡标准 85.6mm × 53.98mm ≈ 8:5
// ============================================================================
const LOGICAL_WIDTH = 16 // 逻辑宽度（选择能被常见间距整除的值）
const LOGICAL_HEIGHT = 10 // 逻辑高度（16:10 = 8:5）

// 纹理逻辑间距：16÷1=16, 10÷1=10 ✓ 完美整除
const PATTERN_LOGICAL_SPACING = 1

// 水印逻辑间距：16÷2=8, 10÷2=5 ✓ 完美整除
const WATERMARK_LOGICAL_SPACING = 2

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

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  const r = clamp(Math.round(srgbEncode(rLin) * 255), 0, 255)
  const g = clamp(Math.round(srgbEncode(gLin) * 255), 0, 255)
  const bb = clamp(Math.round(srgbEncode(bLin) * 255), 0, 255)

  return `rgb(${r}, ${g}, ${bb})`
}

export interface BackgroundStops {
  themeHue: number
  c0: string
  c1: string
  c2: string
}

export function resolveBackgroundStops(themeHue: number): BackgroundStops {
  return {
    themeHue,
    c0: oklchToSrgbCssColor(0.5, 0.2, themeHue),
    c1: oklchToSrgbCssColor(0.4, 0.22, themeHue + 20),
    c2: oklchToSrgbCssColor(0.3, 0.18, themeHue + 40),
  }
}

function drawBackground(ctx: Ctx, w: number, h: number, bg: BackgroundStops | null) {
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
  const start = 0.1
  const end = 0.6
  const step = (end - start) / 4

  return [
    { stop: start, color: 'rgba(0,0,0,0)' },
    { stop: start + step * 1, color: 'rgb(255, 162, 153)' },
    { stop: start + step * 2, color: 'rgb(51, 255, 153)' },
    { stop: start + step * 3, color: 'rgb(110, 156, 247)' },
    { stop: end, color: 'rgba(0,0,0,0)' },
  ] as const
}

function drawRefraction(
  ctx: Ctx,
  config: RefractionCornerConfig,
  canvas: { w: number; h: number },
  pointer: { x: number; y: number },
  alpha: number,
) {
  if (!(alpha > 0)) return

  const elementSide = canvas.w * config.sizeMultiplier
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
    elementBoxX = 0
    elementBoxY = -elementSide
  } else {
    originX = canvas.w
    originY = 0
    elementBoxX = -elementSide
    elementBoxY = 0
  }

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(originX, originY)
  ctx.translate(tx, ty)
  ctx.scale(scale, scale)
  ctx.filter = 'saturate(2)'

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  for (const s of getDemoGradientStops()) grad.addColorStop(s.stop, s.color)

  ctx.fillStyle = grad
  ctx.fillRect(elementBoxX, elementBoxY, elementSide, elementSide)
  ctx.restore()
}

export interface PatternCache {
  key: string
  pattern: CanvasPattern
  /** 逻辑空间中的间距 */
  logicalSpacing: number
  /** pattern tile 的物理尺寸 */
  tileSize: number
}

/**
 * 创建纹理 pattern（三角形）
 * tile 大小基于 source image，逻辑间距固定为 PATTERN_LOGICAL_SPACING
 */
function ensurePatternCache(
  ctx: Ctx,
  cache: PatternCache | null,
  key: string,
  image: ImageBitmap,
): PatternCache | null {
  if (cache && cache.key === key) return cache

  // 使用 source image 的原始尺寸作为 tile
  const tileSize = image.width // 假设是正方形
  const tile = new OffscreenCanvas(tileSize, tileSize)
  const tctx = tile.getContext('2d')
  if (!tctx) return null

  tctx.clearRect(0, 0, tile.width, tile.height)
  tctx.drawImage(image, 0, 0)

  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return null

  return { key, pattern, logicalSpacing: PATTERN_LOGICAL_SPACING, tileSize }
}

/**
 * 创建水印 pattern（菱形排布）
 * 使用 2x2 的 tile，在对角位置放置图标，重复后形成菱形网格
 * 逻辑间距固定为 WATERMARK_LOGICAL_SPACING
 * @param cellPx 单个 cell 的物理尺寸
 * @param iconPx 图标物理尺寸
 */
function ensureWatermarkCache(
  ctx: Ctx,
  cache: PatternCache | null,
  key: string,
  image: ImageBitmap,
  cellPx: number,
  iconPx: number,
): PatternCache | null {
  if (cache && cache.key === key) return cache

  // 创建 2x2 cell 大小的 tile，实现菱形排布
  const tileSize = cellPx * 2
  const tile = new OffscreenCanvas(tileSize, tileSize)
  const tctx = tile.getContext('2d')
  if (!tctx) return null

  tctx.clearRect(0, 0, tile.width, tile.height)

  // 图标在 cell 内居中的偏移量
  const iconOffset = (cellPx - iconPx) / 2

  // 位置 1: 左上 cell 的中心 (0.5, 0.5) in cell units
  tctx.drawImage(image, iconOffset, iconOffset, iconPx, iconPx)

  // 位置 2: 右下 cell 的中心 (1.5, 1.5) in cell units
  tctx.drawImage(image, cellPx + iconOffset, cellPx + iconOffset, iconPx, iconPx)

  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return null

  // 2x2 tile 需要 2x 的逻辑间距，保持与原来相同的图标密度
  return { key, pattern, logicalSpacing: WATERMARK_LOGICAL_SPACING * 2, tileSize }
}

function renderMaskedLayer(
  layerCtx: Ctx,
  canvas: { w: number; h: number },
  pointer: { x: number; y: number },
  refractionAlpha: number,
  baseFill: string,
  mask: { pattern: CanvasPattern; logicalSpacing: number; tileSize: number },
) {
  layerCtx.save()
  layerCtx.setTransform(1, 0, 0, 1, 0, 0)
  layerCtx.clearRect(0, 0, canvas.w, canvas.h)
  layerCtx.globalCompositeOperation = 'source-over'
  layerCtx.globalAlpha = 1
  layerCtx.filter = 'none'

  layerCtx.fillStyle = baseFill
  layerCtx.fillRect(0, 0, canvas.w, canvas.h)

  for (const cfg of REFRACTION_CORNERS) {
    drawRefraction(layerCtx, cfg, canvas, pointer, refractionAlpha)
  }

  layerCtx.globalCompositeOperation = 'destination-in'
  layerCtx.globalAlpha = 1
  layerCtx.filter = 'none'

  // 使用逻辑坐标系统填充 pattern
  // 计算目标物理尺寸：logicalSpacing 对应的物理像素
  const targetW = (mask.logicalSpacing / LOGICAL_WIDTH) * canvas.w
  const targetH = (mask.logicalSpacing / LOGICAL_HEIGHT) * canvas.h
  // pattern tile 需要缩放到目标尺寸
  const scaleX = targetW / mask.tileSize
  const scaleY = targetH / mask.tileSize

  const matrix = new DOMMatrix()
  matrix.scaleSelf(scaleX, scaleY)
  mask.pattern.setTransform(matrix)

  layerCtx.fillStyle = mask.pattern
  layerCtx.fillRect(0, 0, canvas.w, canvas.h)

  layerCtx.restore()
}

function drawSpotlight(ctx: Ctx, canvas: { w: number; h: number }, pointer: { x: number; y: number }, alpha: number) {
  if (!(alpha > 0)) return

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

export interface RenderResources {
  bgStops: BackgroundStops | null
  triangleMask: ImageBitmap | null
  watermarkMask: ImageBitmap | null
  patternLayer: OffscreenCanvas
  watermarkLayer: OffscreenCanvas
  patternMaskCache: PatternCache | null
  watermarkMaskCache: PatternCache | null
}

export interface RenderResult {
  patternMaskCache: PatternCache | null
  watermarkMaskCache: PatternCache | null
}

export function renderHologram(ctx: Ctx, state: RenderState, resources: RenderResources): RenderResult {
  const w = Math.round(state.width * state.dpr)
  const h = Math.round(state.height * state.dpr)

  if (w <= 0 || h <= 0) {
    return {
      patternMaskCache: resources.patternMaskCache,
      watermarkMaskCache: resources.watermarkMaskCache,
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w, h)

  drawBackground(ctx, w, h, resources.bgStops)

  const refractionAlpha = state.active ? 1 : 0
  let patternMaskCache = resources.patternMaskCache
  let watermarkMaskCache = resources.watermarkMaskCache

  // Pattern layer
  if (state.enabledPattern && resources.triangleMask) {
    const layer = resources.patternLayer
    if (layer.width !== w) layer.width = w
    if (layer.height !== h) layer.height = h
    const layerCtx = layer.getContext('2d')
    if (layerCtx) {
      // 使用 image 原始尺寸，缩放在渲染时通过逻辑坐标系统处理
      const maskKey = `triangle:${resources.triangleMask.width}`
      const nextCache = ensurePatternCache(layerCtx, patternMaskCache, maskKey, resources.triangleMask)
      if (nextCache) {
        patternMaskCache = nextCache
        renderMaskedLayer(layerCtx, { w, h }, state.pointer, refractionAlpha, 'rgb(204, 204, 204)', {
          pattern: nextCache.pattern,
          logicalSpacing: nextCache.logicalSpacing,
          tileSize: nextCache.tileSize,
        })

        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = 0.4
        ctx.filter = 'saturate(0.8) contrast(1) brightness(1)'
        ctx.drawImage(layer, 0, 0)
        ctx.restore()
      }
    }
  }

  // Watermark layer
  if (state.enabledWatermark && resources.watermarkMask) {
    const cellSize = state.watermarkCellSize ?? 40
    const iconSize = state.watermarkIconSize ?? 24

    if (cellSize > 0 && iconSize > 0) {
      const layer = resources.watermarkLayer
      if (layer.width !== w) layer.width = w
      if (layer.height !== h) layer.height = h
      const layerCtx = layer.getContext('2d')
      if (layerCtx) {
        // 计算物理像素尺寸（用于创建高清 tile）
        const cellPx = Math.max(1, Math.round(cellSize * state.dpr))
        const iconPx = Math.max(1, Math.round(iconSize * state.dpr))
        const maskKey = `watermark:${state.watermarkMaskUrl ?? 'null'}:${cellPx}:${iconPx}`
        const nextCache = ensureWatermarkCache(
          layerCtx,
          watermarkMaskCache,
          maskKey,
          resources.watermarkMask,
          cellPx,
          iconPx,
        )
        if (nextCache) {
          watermarkMaskCache = nextCache
          renderMaskedLayer(layerCtx, { w, h }, state.pointer, refractionAlpha, 'rgba(255, 255, 255, 0.2)', {
            pattern: nextCache.pattern,
            logicalSpacing: nextCache.logicalSpacing,
            tileSize: nextCache.tileSize,
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

  // Spotlight
  drawSpotlight(ctx, { w, h }, state.pointer, state.active ? 1 : 0)

  return { patternMaskCache, watermarkMaskCache }
}
