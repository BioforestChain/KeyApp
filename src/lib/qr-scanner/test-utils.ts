/**
 * QR Scanner 测试工具
 * 用于生成和变换 QR 码图片进行可靠性测试
 */

import QRCode from 'qrcode'

/** QR 码生成选项 */
export interface QRGenerateOptions {
  /** 容错级别 */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  /** 图片尺寸 */
  width?: number
  /** 边距 */
  margin?: number
  /** 前景色 */
  color?: { dark: string; light: string }
}

/** 图像变换选项 */
export interface TransformOptions {
  /** 缩放比例 (0.1 - 2.0) */
  scale?: number
  /** 旋转角度 (度) */
  rotate?: number
  /** 高斯噪声强度 (0 - 50) */
  noise?: number
  /** 模糊半径 (0 - 10) */
  blur?: number
  /** 亮度调整 (-100 to 100) */
  brightness?: number
  /** 对比度调整 (0 - 2) */
  contrast?: number
}

/**
 * 生成 QR 码为 Canvas
 */
export async function generateQRCanvas(
  content: string,
  options: QRGenerateOptions = {}
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  
  await QRCode.toCanvas(canvas, content, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
    width: options.width ?? 200,
    margin: options.margin ?? 2,
    color: options.color ?? { dark: '#000000', light: '#ffffff' },
  })
  
  return canvas
}

/**
 * 生成 QR 码为 ImageData
 */
export async function generateQRImageData(
  content: string,
  options: QRGenerateOptions = {}
): Promise<ImageData> {
  const canvas = await generateQRCanvas(content, options)
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * 生成 QR 码为 Data URL
 */
export async function generateQRDataURL(
  content: string,
  options: QRGenerateOptions = {}
): Promise<string> {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
    width: options.width ?? 200,
    margin: options.margin ?? 2,
    color: options.color ?? { dark: '#000000', light: '#ffffff' },
  })
}

/**
 * 对 Canvas 应用变换
 */
export function transformCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: TransformOptions
): HTMLCanvasElement {
  const { scale = 1, rotate = 0, noise = 0, blur = 0, brightness = 0, contrast = 1 } = options
  
  // 计算变换后的尺寸
  const radians = (rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  
  const originalWidth = sourceCanvas.width
  const originalHeight = sourceCanvas.height
  
  const rotatedWidth = originalWidth * cos + originalHeight * sin
  const rotatedHeight = originalWidth * sin + originalHeight * cos
  
  const finalWidth = Math.ceil(rotatedWidth * scale)
  const finalHeight = Math.ceil(rotatedHeight * scale)
  
  // 创建目标 Canvas
  const targetCanvas = document.createElement('canvas')
  targetCanvas.width = finalWidth
  targetCanvas.height = finalHeight
  
  const ctx = targetCanvas.getContext('2d')!
  
  // 应用滤镜
  const filters: string[] = []
  if (blur > 0) filters.push(`blur(${blur}px)`)
  if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`)
  if (contrast !== 1) filters.push(`contrast(${contrast * 100}%)`)
  if (filters.length > 0) ctx.filter = filters.join(' ')
  
  // 变换矩阵
  ctx.translate(finalWidth / 2, finalHeight / 2)
  ctx.rotate(radians)
  ctx.scale(scale, scale)
  ctx.translate(-originalWidth / 2, -originalHeight / 2)
  
  // 绘制原图
  ctx.drawImage(sourceCanvas, 0, 0)
  
  // 添加噪声
  if (noise > 0) {
    addNoise(ctx, finalWidth, finalHeight, noise)
  }
  
  return targetCanvas
}

/**
 * 添加高斯噪声
 */
function addNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 2
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    data[i] = Math.max(0, Math.min(255, r + noise))     // R
    data[i + 1] = Math.max(0, Math.min(255, g + noise)) // G
    data[i + 2] = Math.max(0, Math.min(255, b + noise)) // B
  }
  
  ctx.putImageData(imageData, 0, 0)
}

/**
 * 生成并变换 QR 码
 */
export async function generateTransformedQR(
  content: string,
  qrOptions: QRGenerateOptions = {},
  transformOptions: TransformOptions = {}
): Promise<HTMLCanvasElement> {
  const originalCanvas = await generateQRCanvas(content, qrOptions)
  return transformCanvas(originalCanvas, transformOptions)
}

/**
 * 获取 Canvas 的 ImageData
 */
export function getCanvasImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * 批量生成测试用例
 */
export interface TestCase {
  name: string
  content: string
  qrOptions?: QRGenerateOptions
  transformOptions?: TransformOptions
}

export const STANDARD_TEST_CASES: TestCase[] = [
  // 基础测试
  { name: 'simple-text', content: 'Hello World' },
  { name: 'url', content: 'https://example.com/path?query=value' },
  { name: 'ethereum-address', content: 'ethereum:0x1234567890123456789012345678901234567890' },
  { name: 'bitcoin-address', content: 'bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' },
  
  // 不同容错级别
  { name: 'ecc-L', content: 'Error Correction L', qrOptions: { errorCorrectionLevel: 'L' } },
  { name: 'ecc-M', content: 'Error Correction M', qrOptions: { errorCorrectionLevel: 'M' } },
  { name: 'ecc-Q', content: 'Error Correction Q', qrOptions: { errorCorrectionLevel: 'Q' } },
  { name: 'ecc-H', content: 'Error Correction H', qrOptions: { errorCorrectionLevel: 'H' } },
  
  // 不同尺寸
  { name: 'size-100', content: 'Small QR', qrOptions: { width: 100 } },
  { name: 'size-200', content: 'Medium QR', qrOptions: { width: 200 } },
  { name: 'size-400', content: 'Large QR', qrOptions: { width: 400 } },
  
  // 变换测试
  { name: 'scale-0.5', content: 'Scaled Down', transformOptions: { scale: 0.5 } },
  { name: 'scale-1.5', content: 'Scaled Up', transformOptions: { scale: 1.5 } },
  { name: 'rotate-15', content: 'Rotated 15deg', transformOptions: { rotate: 15 } },
  { name: 'rotate-45', content: 'Rotated 45deg', transformOptions: { rotate: 45 } },
  { name: 'rotate-90', content: 'Rotated 90deg', transformOptions: { rotate: 90 } },
  { name: 'noise-10', content: 'Low Noise', transformOptions: { noise: 10 } },
  { name: 'noise-30', content: 'High Noise', transformOptions: { noise: 30 } },
  { name: 'blur-1', content: 'Slight Blur', transformOptions: { blur: 1 } },
  { name: 'blur-2', content: 'Medium Blur', transformOptions: { blur: 2 } },
  { name: 'brightness-low', content: 'Dark Image', transformOptions: { brightness: -30 } },
  { name: 'brightness-high', content: 'Bright Image', transformOptions: { brightness: 30 } },
  { name: 'contrast-low', content: 'Low Contrast', transformOptions: { contrast: 0.7 } },
  { name: 'contrast-high', content: 'High Contrast', transformOptions: { contrast: 1.3 } },
  
  // 组合变换
  { name: 'combined-easy', content: 'Easy Combined', transformOptions: { scale: 0.8, rotate: 5, noise: 5 } },
  { name: 'combined-medium', content: 'Medium Combined', transformOptions: { scale: 0.6, rotate: 15, noise: 15, blur: 1 } },
  { name: 'combined-hard', content: 'Hard Combined', transformOptions: { scale: 0.5, rotate: 30, noise: 25, blur: 1.5 } },
]

/**
 * 运行可靠性测试并生成报告
 */
export interface ReliabilityReport {
  totalCases: number
  passed: number
  failed: number
  passRate: number
  avgScanTime: number
  results: Array<{
    name: string
    passed: boolean
    expectedContent: string
    actualContent: string | null
    scanTime: number | null
    error?: string
  }>
}

export async function runReliabilityTest(
  scanner: { scan: (imageData: ImageData) => Promise<{ content: string; duration: number } | null> },
  testCases: TestCase[] = STANDARD_TEST_CASES
): Promise<ReliabilityReport> {
  const results: ReliabilityReport['results'] = []
  let totalScanTime = 0
  let passedCount = 0
  
  for (const testCase of testCases) {
    try {
      const canvas = await generateTransformedQR(
        testCase.content,
        testCase.qrOptions,
        testCase.transformOptions
      )
      const imageData = getCanvasImageData(canvas)
      
      const result = await scanner.scan(imageData)
      
      const passed = result?.content === testCase.content
      if (passed) {
        passedCount++
        totalScanTime += result!.duration
      }
      
      results.push({
        name: testCase.name,
        passed,
        expectedContent: testCase.content,
        actualContent: result?.content ?? null,
        scanTime: result?.duration ?? null,
      })
    } catch (error) {
      results.push({
        name: testCase.name,
        passed: false,
        expectedContent: testCase.content,
        actualContent: null,
        scanTime: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  return {
    totalCases: testCases.length,
    passed: passedCount,
    failed: testCases.length - passedCount,
    passRate: passedCount / testCases.length,
    avgScanTime: passedCount > 0 ? totalScanTime / passedCount : 0,
    results,
  }
}
