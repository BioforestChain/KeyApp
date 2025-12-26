/**
 * Mock Frame Source - 模拟相机帧输入
 * 
 * 支持三种输入模式：
 * 1. 单张图片 - 持续返回同一帧
 * 2. 多张图片序列 - 按顺序返回帧
 * 3. 视频 - 从视频中采样帧
 */

import type { FrameSource, MockFrameSourceConfig } from './types'

/** 加载图片 */
async function loadImage(source: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = source instanceof Blob ? URL.createObjectURL(source) : source
    
    img.onload = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      resolve(img)
    }
    
    img.onerror = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

/** 加载视频 */
async function loadVideo(source: string | Blob): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = source instanceof Blob ? URL.createObjectURL(source) : source
    
    video.onloadedmetadata = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      resolve(video)
    }
    
    video.onerror = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load video'))
    }
    
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.src = url
    video.load()
  })
}

/**
 * 单图片帧源
 */
export class ImageFrameSource implements FrameSource {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private imageData: ImageData | null = null
  
  readonly width: number
  readonly height: number
  
  constructor(image: HTMLImageElement) {
    this.width = image.naturalWidth
    this.height = image.naturalHeight
    
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
    this.ctx.drawImage(image, 0, 0)
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height)
  }
  
  static async create(source: string | Blob): Promise<ImageFrameSource> {
    const image = await loadImage(source)
    return new ImageFrameSource(image)
  }
  
  getFrame(): ImageData | null {
    return this.imageData
  }
  
  hasNextFrame(): boolean {
    return false // 单图片没有下一帧
  }
  
  async nextFrame(): Promise<boolean> {
    return false
  }
  
  reset(): void {
    // 单图片不需要重置
  }
  
  destroy(): void {
    this.imageData = null
  }
}

/**
 * 图片序列帧源
 */
export class ImageSequenceFrameSource implements FrameSource {
  private images: HTMLImageElement[]
  private currentIndex = 0
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  
  readonly width: number
  readonly height: number
  
  constructor(images: HTMLImageElement[], private frameInterval: number = 100) {
    if (images.length === 0) {
      throw new Error('At least one image required')
    }
    
    this.images = images
    const firstImage = images[0]!
    this.width = firstImage.naturalWidth
    this.height = firstImage.naturalHeight
    
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }
  
  static async create(sources: (string | Blob)[], frameInterval?: number): Promise<ImageSequenceFrameSource> {
    const images = await Promise.all(sources.map(loadImage))
    return new ImageSequenceFrameSource(images, frameInterval)
  }
  
  getFrame(): ImageData | null {
    const image = this.images[this.currentIndex]
    if (!image) return null
    
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(image, 0, 0)
    return this.ctx.getImageData(0, 0, this.width, this.height)
  }
  
  hasNextFrame(): boolean {
    return this.currentIndex < this.images.length - 1
  }
  
  async nextFrame(): Promise<boolean> {
    if (!this.hasNextFrame()) return false
    
    await new Promise(resolve => setTimeout(resolve, this.frameInterval))
    this.currentIndex++
    return true
  }
  
  reset(): void {
    this.currentIndex = 0
  }
  
  destroy(): void {
    this.images = []
  }
}

/**
 * 视频帧源
 */
export class VideoFrameSource implements FrameSource {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private frameDuration: number
  
  readonly width: number
  readonly height: number
  
  constructor(private video: HTMLVideoElement, frameRate: number = 10) {
    this.width = video.videoWidth
    this.height = video.videoHeight
    this.frameDuration = 1000 / frameRate
    
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }
  
  static async create(source: string | Blob, frameRate?: number): Promise<VideoFrameSource> {
    const video = await loadVideo(source)
    return new VideoFrameSource(video, frameRate)
  }
  
  getFrame(): ImageData | null {
    if (this.video.readyState < 2) return null
    
    this.ctx.drawImage(this.video, 0, 0)
    return this.ctx.getImageData(0, 0, this.width, this.height)
  }
  
  hasNextFrame(): boolean {
    return !this.video.ended && this.video.currentTime < this.video.duration
  }
  
  async nextFrame(): Promise<boolean> {
    if (!this.hasNextFrame()) return false
    
    return new Promise((resolve) => {
      const targetTime = this.video.currentTime + this.frameDuration / 1000
      
      if (targetTime >= this.video.duration) {
        resolve(false)
        return
      }
      
      const onSeeked = () => {
        this.video.removeEventListener('seeked', onSeeked)
        resolve(true)
      }
      
      this.video.addEventListener('seeked', onSeeked)
      this.video.currentTime = targetTime
    })
  }
  
  reset(): void {
    this.video.currentTime = 0
  }
  
  destroy(): void {
    this.video.pause()
    this.video.src = ''
  }
  
  /** 开始播放（实时模式） */
  async play(): Promise<void> {
    await this.video.play()
  }
  
  /** 暂停播放 */
  pause(): void {
    this.video.pause()
  }
}

/**
 * 根据配置创建帧源
 */
export async function createFrameSource(config: MockFrameSourceConfig): Promise<FrameSource> {
  if (config.video) {
    return VideoFrameSource.create(config.video, config.frameRate)
  }
  
  if (config.images && config.images.length > 0) {
    return ImageSequenceFrameSource.create(config.images, config.frameInterval)
  }
  
  if (config.image) {
    return ImageFrameSource.create(config.image)
  }
  
  throw new Error('No valid source provided in config')
}

/**
 * Mock Camera Component - 渲染帧源到 Canvas
 * 提供类似真实相机的接口
 */
export class MockCameraView {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrameId: number | null = null
  private isRunning = false
  
  constructor(
    private frameSource: FrameSource,
    targetCanvas?: HTMLCanvasElement
  ) {
    this.canvas = targetCanvas ?? document.createElement('canvas')
    this.canvas.width = frameSource.width
    this.canvas.height = frameSource.height
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }
  
  /** 获取 Canvas 元素 */
  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }
  
  /** 获取当前帧数据 */
  getFrameData(): ImageData | null {
    return this.frameSource.getFrame()
  }
  
  /** 开始渲染循环 */
  start(onFrame?: (imageData: ImageData | null) => void): void {
    if (this.isRunning) return
    this.isRunning = true
    
    const render = () => {
      if (!this.isRunning) return
      
      const frame = this.frameSource.getFrame()
      if (frame) {
        this.ctx.putImageData(frame, 0, 0)
        onFrame?.(frame)
      }
      
      this.animationFrameId = requestAnimationFrame(render)
    }
    
    render()
  }
  
  /** 停止渲染循环 */
  stop(): void {
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
  
  /** 单步渲染（手动控制） */
  renderFrame(): ImageData | null {
    const frame = this.frameSource.getFrame()
    if (frame) {
      this.ctx.putImageData(frame, 0, 0)
    }
    return frame
  }
  
  /** 前进到下一帧 */
  async nextFrame(): Promise<boolean> {
    return this.frameSource.nextFrame()
  }
  
  /** 重置 */
  reset(): void {
    this.frameSource.reset()
  }
  
  /** 销毁 */
  destroy(): void {
    this.stop()
    this.frameSource.destroy()
  }
}
