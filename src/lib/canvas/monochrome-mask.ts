import { canvasPool } from './canvas-pool'

/**
 * 管道 Hook 定义
 * code 是函数体字符串，将在 canvas 处理后执行
 * 函数签名: (ctx: CanvasRenderingContext2D, imageData: ImageData, size: number, args: unknown) => void
 */
export interface PipelineHook {
  /** 函数体字符串 */
  code: string
  /** 自定义参数 */
  args?: unknown
}

export interface MonochromeMaskOptions {
  /** 输出图标尺寸 */
  size?: number
  /** 是否反转（黑变白，白变黑） */
  invert?: boolean
  /** 对比度增强（1=原始，2=高对比度） */
  contrast?: number
  /** 管道 hooks，按顺序执行 */
  pipeline?: PipelineHook[]
  /** 是否裁剪透明区域（先裁剪再处理），默认 true */
  clip?: boolean
  /** 亮度锚定目标值 (0-1)，裁剪后调整整体亮度到此值 */
  targetBrightness?: number
}

interface CacheEntry {
  url: string
  timestamp: number
}

// LRU 缓存
const cache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 50

// 进行中的请求（防止并发重复）
const pending = new Map<string, Promise<string | null>>()

// 加载失败的 URL（避免重试风暴）
const failedUrls = new Set<string>()
const FAILED_URL_EXPIRE = 60_000 // 1 分钟后可重试

/**
 * 简单的字符串 hash 函数 (djb2)
 */
function hashString(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

/**
 * 计算 pipeline hooks 的 hash
 */
function hashPipeline(pipeline: PipelineHook[] | undefined): string {
  if (!pipeline || pipeline.length === 0) return ''
  const str = JSON.stringify(pipeline.map(h => ({ code: h.code, args: h.args })))
  return hashString(str)
}

function getCacheKey(
  iconUrl: string,
  size: number,
  invert: boolean,
  contrast: number,
  pipeline?: PipelineHook[],
  clip?: boolean,
  targetBrightness?: number
): string {
  const pipelineHash = hashPipeline(pipeline)
  const clipStr = clip ? ':clip' : ''
  const brightnessStr = targetBrightness !== undefined ? `:tb${targetBrightness}` : ''
  return `${iconUrl}:${size}:${invert}:${contrast}${pipelineHash ? `:${pipelineHash}` : ''}${clipStr}${brightnessStr}`
}

function evictOldest(): void {
  if (cache.size < MAX_CACHE_SIZE) return

  let oldestKey: string | null = null
  let oldestTime = Infinity

  for (const [key, entry] of cache) {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp
      oldestKey = key
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * 编译 hook 函数字符串为可执行函数
 * 函数签名: (ctx, imageData, size, args) => void
 */
function compileHook(code: string): (
  ctx: Ctx2D,
  imageData: ImageData,
  size: number,
  args: unknown
) => void {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function('ctx', 'imageData', 'size', 'args', code) as (
    ctx: Ctx2D,
    imageData: ImageData,
    size: number,
    args: unknown
  ) => void
}

// Hook 函数缓存（避免重复编译）
const hookCache = new Map<string, ReturnType<typeof compileHook>>()

function getCompiledHook(code: string): ReturnType<typeof compileHook> {
  let fn = hookCache.get(code)
  if (!fn) {
    fn = compileHook(code)
    hookCache.set(code, fn)
  }
  return fn
}

/**
 * 计算非透明区域的边界框
 */
function getContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold = 10
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let found = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (data[idx + 3]! >= alphaThreshold) {
        found = true
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  return found ? { minX, minY, maxX, maxY } : null
}

/**
 * 核心算法：将 RGBA 像素数据转换为单色遮罩
 * 亮度 → 归一化 → 对比度增强 → 反转 → alpha
 */
function applyMonochromeTransform(
  data: Uint8ClampedArray,
  contrast: number,
  invert: boolean
): void {
  // 第一遍：找亮度范围
  let minLum = 1
  let maxLum = 0
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!
    if (a < 10) continue
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    minLum = Math.min(minLum, lum)
    maxLum = Math.max(maxLum, lum)
  }

  const lumRange = maxLum - minLum
  const hasRange = lumRange > 0.01

  // 第二遍：转换为单色遮罩
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const a = data[i + 3]!

    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    if (hasRange) {
      luminance = (luminance - minLum) / lumRange
    }
    luminance = (luminance - 0.5) * contrast + 0.5
    luminance = Math.max(0, Math.min(1, luminance))
    if (invert) {
      luminance = 1 - luminance
    }

    data[i] = 255
    data[i + 1] = 255
    data[i + 2] = 255
    data[i + 3] = luminance * (a / 255) * 255
  }
}

function processImageToMask(
  img: HTMLImageElement,
  size: number,
  invert: boolean,
  contrast: number,
  pipeline?: PipelineHook[],
  clip?: boolean,
  targetBrightness?: number
): string {
  const canvas = canvasPool.acquire(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvasPool.release(canvas)
    throw new Error('Failed to get 2d context')
  }

  // 清空画布
  ctx.clearRect(0, 0, size, size)

  // === Step 1: 初始绘制并应用核心算法 ===
  const initialScale = Math.min(size / img.width, size / img.height) * 0.85
  const initialW = img.width * initialScale
  const initialH = img.height * initialScale
  const initialX = (size - initialW) / 2
  const initialY = (size - initialH) / 2
  ctx.drawImage(img, initialX, initialY, initialW, initialH)

  let imageData = ctx.getImageData(0, 0, size, size)
  let data = imageData.data

  // 应用核心算法：亮度 → alpha
  applyMonochromeTransform(data, contrast, invert)

  // === Step 2: 基于单色遮罩计算 clip 边界并重绘 ===
  if (clip) {
    const bounds = getContentBounds(data, size, size, 20)
    if (bounds) {
      const padding = 1
      const clipX = Math.max(0, bounds.minX - padding)
      const clipY = Math.max(0, bounds.minY - padding)
      const clipW = Math.min(size - clipX, bounds.maxX - bounds.minX + 1 + padding * 2)
      const clipH = Math.min(size - clipY, bounds.maxY - bounds.minY + 1 + padding * 2)

      // 计算原图中对应的区域
      const srcX = (clipX - initialX) / initialScale
      const srcY = (clipY - initialY) / initialScale
      const srcW = clipW / initialScale
      const srcH = clipH / initialScale

      // 计算新的缩放，让裁剪内容填满画布
      const clipMaxDim = Math.max(clipW, clipH)
      const newScale = (size / clipMaxDim) * 0.95
      const finalW = clipW * newScale
      const finalH = clipH * newScale
      const finalX = (size - finalW) / 2
      const finalY = (size - finalH) / 2

      // 清空画布，从原图重新绘制
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, srcX, srcY, srcW, srcH, finalX, finalY, finalW, finalH)

      // 重新获取像素数据并应用核心算法
      imageData = ctx.getImageData(0, 0, size, size)
      data = imageData.data
      applyMonochromeTransform(data, contrast, invert)
    }
  }

  // === Step 3: 亮度锚定 ===
  if (targetBrightness !== undefined) {
    let sumAlpha = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]!
      if (a >= 10) {
        sumAlpha += a / 255
        count++
      }
    }

    if (count > 0) {
      const currentBrightness = sumAlpha / count
      if (currentBrightness > 0.01) {
        const multiplier = targetBrightness / currentBrightness
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3]!
          if (a >= 1) {
            data[i + 3] = Math.min(255, Math.max(0, a * multiplier))
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // 执行管道 hooks
  if (pipeline && pipeline.length > 0) {
    for (const hook of pipeline) {
      try {
        const fn = getCompiledHook(hook.code)
        // 重新获取 imageData（hook 可能已修改 canvas）
        imageData = ctx.getImageData(0, 0, size, size)
        fn(ctx, imageData, size, hook.args)
      } catch (e) {
        
      }
    }
  }

  // 转换为 Blob 再生成 URL（比 toDataURL 更高效）
  // 但 OffscreenCanvas 需要使用 convertToBlob
  // 为了兼容性，这里使用同步的方式：创建临时 canvas
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = size
  outputCanvas.height = size
  const outputCtx = outputCanvas.getContext('2d')
  if (outputCtx) {
    outputCtx.drawImage(canvas, 0, 0)
  }

  const dataUrl = outputCanvas.toDataURL('image/png')

  canvasPool.release(canvas)
  return dataUrl
}

/**
 * 创建单色遮罩
 * 使用缓存 + CanvasPool 优化性能
 * 支持管道 hooks 进行自定义后处理（如彩虹渐变）
 */
export async function createMonochromeMask(
  iconUrl: string,
  options: MonochromeMaskOptions = {}
): Promise<string | null> {
  const { size = 64, invert = false, contrast = 1.5, pipeline, clip = true, targetBrightness } = options
  const cacheKey = getCacheKey(iconUrl, size, invert, contrast, pipeline, clip, targetBrightness)

  // 1. 检查缓存
  const cached = cache.get(cacheKey)
  if (cached) {
    // 更新时间戳（LRU）
    cached.timestamp = Date.now()
    return cached.url
  }

  // 2. 检查是否有进行中的请求
  const pendingRequest = pending.get(cacheKey)
  if (pendingRequest) {
    return pendingRequest
  }

  // 3. 检查是否是失败过的 URL
  if (failedUrls.has(iconUrl)) {
    return null
  }

  // 4. 创建新请求
  const request = (async () => {
    try {
      const img = await loadImage(iconUrl)
      const dataUrl = processImageToMask(img, size, invert, contrast, pipeline, clip, targetBrightness)

      // 存入缓存
      evictOldest()
      cache.set(cacheKey, { url: dataUrl, timestamp: Date.now() })

      return dataUrl
    } catch {
      // 记录失败的 URL
      failedUrls.add(iconUrl)
      setTimeout(() => failedUrls.delete(iconUrl), FAILED_URL_EXPIRE)
      return null
    } finally {
      pending.delete(cacheKey)
    }
  })()

  pending.set(cacheKey, request)
  return request
}

/**
 * 清除缓存
 */
export function clearMonochromeMaskCache(): void {
  cache.clear()
  pending.clear()
  failedUrls.clear()
}

/**
 * 获取缓存统计信息
 */
export function getMonochromeMaskCacheStats(): { size: number; maxSize: number } {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE }
}

// ============================================================================
// 预定义的管道 Hooks
// ============================================================================

/**
 * 彩虹渐变 Hook
 * 将白色遮罩转换为彩虹色渐变
 * 模拟 CSS: conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)
 * args: { opacity?: number }
 */
export const RAINBOW_GRADIENT_HOOK: PipelineHook = {
  code: `
    var data = imageData.data;
    var cx = size / 2;
    var cy = size / 2;
    var opacity = (args && args.opacity) || 1;
    
    for (var i = 0; i < data.length; i += 4) {
      var a = data[i + 3];
      if (a < 10) continue;
      
      var px = (i / 4) % size;
      var py = Math.floor((i / 4) / size);
      
      // 计算角度 (0-360)，从顶部开始顺时针
      var angle = Math.atan2(px - cx, cy - py) * 180 / Math.PI + 180;
      
      // HSV to RGB (H = angle, S = 1, V = 1) - 纯正彩虹色
      var h = (angle % 360) / 60;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var r, g, b;
      
      // 纯彩虹色：S=1, V=1
      switch (hi) {
        case 0: r = 255; g = Math.round(f * 255); b = 0; break;
        case 1: r = Math.round((1 - f) * 255); g = 255; b = 0; break;
        case 2: r = 0; g = 255; b = Math.round(f * 255); break;
        case 3: r = 0; g = Math.round((1 - f) * 255); b = 255; break;
        case 4: r = Math.round(f * 255); g = 0; b = 255; break;
        default: r = 255; g = 0; b = Math.round((1 - f) * 255); break;
      }
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.round(a * opacity);
    }
    
    ctx.putImageData(imageData, 0, 0);
  `,
  args: { opacity: 1 },
}

/**
 * 创建自定义透明度的彩虹渐变 Hook
 */
export function createRainbowHook(opacity = 1): PipelineHook {
  return {
    ...RAINBOW_GRADIENT_HOOK,
    args: { opacity },
  }
}

/**
 * 纯色填充 Hook
 * 将白色遮罩填充为指定颜色
 * args: { r: number, g: number, b: number, opacity?: number }
 */
export const SOLID_COLOR_HOOK_CODE = `
  var data = imageData.data;
  var r = (args && args.r) || 255;
  var g = (args && args.g) || 255;
  var b = (args && args.b) || 255;
  var opacity = (args && args.opacity) || 1;
  
  for (var i = 0; i < data.length; i += 4) {
    var a = data[i + 3];
    if (a < 10) continue;
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(a * opacity);
  }
  
  ctx.putImageData(imageData, 0, 0);
`

/**
 * 创建纯色填充 Hook
 */
export function createSolidColorHook(
  r: number,
  g: number,
  b: number,
  opacity = 1
): PipelineHook {
  return {
    code: SOLID_COLOR_HOOK_CODE,
    args: { r, g, b, opacity },
  }
}
