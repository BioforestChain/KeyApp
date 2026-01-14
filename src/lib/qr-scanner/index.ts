/**
 * QR Scanner - 高性能二维码扫描器
 * 
 * 特性：
 * - Web Worker 后台解码，不阻塞 UI
 * - 支持单帧和批量扫描
 * - 自动管理 Worker 生命周期
 */

import type { ScanResult, ScannerConfig, WorkerMessage, WorkerResponse } from './types'

export type { ScanResult, ScannerConfig, FrameSource, MockFrameSourceConfig } from './types'

/** 默认配置 */
const DEFAULT_CONFIG: Required<ScannerConfig> = {
  scanInterval: 100,
  useWorker: true,
  workerCount: 1,
}

/** 请求 ID 计数器 */
let requestId = 0

/** 待处理的请求回调 */
type PendingCallback = {
  resolve: (result: ScanResult | null) => void
  reject: (error: Error) => void
}

type BatchPendingCallback = {
  resolve: (results: (ScanResult | null)[]) => void
  reject: (error: Error) => void
}

/**
 * QR Scanner 类
 */
export class QRScanner {
  private worker: Worker | null = null
  private config: Required<ScannerConfig>
  private pendingRequests = new Map<number, PendingCallback>()
  private batchPendingRequests = new Map<number, BatchPendingCallback>()
  private _ready = false
  private readyPromise: Promise<void>
  private readyResolve: (() => void) | null = null

  constructor(config: ScannerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve
    })

    if (this.config.useWorker && typeof Worker !== 'undefined') {
      this.initWorker()
    } else {
      this._ready = true
      this.readyResolve?.()
    }
  }

  /** 初始化 Worker */
  private initWorker() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data

      switch (response.type) {
        case 'ready':
          this._ready = true
          this.readyResolve?.()
          break

        case 'result': {
          const callback = this.pendingRequests.get(response.id)
          if (callback) {
            this.pendingRequests.delete(response.id)
            if (response.error) {
              callback.reject(new Error(response.error))
            } else {
              callback.resolve(response.result)
            }
          }
          break
        }

        case 'batchResult': {
          const callback = this.batchPendingRequests.get(response.id)
          if (callback) {
            this.batchPendingRequests.delete(response.id)
            if (response.error) {
              callback.reject(new Error(response.error))
            } else {
              callback.resolve(response.results)
            }
          }
          break
        }
      }
    }

    this.worker.onerror = (_error) => {

      // 回退到主线程模式
      this.worker?.terminate()
      this.worker = null
      this._ready = true
      this.readyResolve?.()
    }
  }

  /** 检查 Scanner 是否就绪 */
  get isReady(): boolean {
    return this._ready
  }

  /** 等待 Scanner 就绪 */
  async waitReady(): Promise<void> {
    return this.readyPromise
  }

  /** 扫描单帧 ImageData */
  async scan(imageData: ImageData): Promise<ScanResult | null> {
    await this.readyPromise

    if (this.worker) {
      return this.scanWithWorker(imageData)
    }
    return this.scanMainThread(imageData)
  }

  /** 通过 Worker 扫描 */
  private scanWithWorker(imageData: ImageData): Promise<ScanResult | null> {
    return new Promise((resolve, reject) => {
      const id = ++requestId
      this.pendingRequests.set(id, { resolve, reject })

      const message: WorkerMessage = { type: 'scan', id, imageData }
      this.worker!.postMessage(message, [imageData.data.buffer])
    })
  }

  /** 主线程扫描（降级方案） */
  private async scanMainThread(imageData: ImageData): Promise<ScanResult | null> {
    const { default: jsQR } = await import('jsqr')
    const start = performance.now()

    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (!result) return null

    return {
      content: result.data,
      duration: performance.now() - start,
      location: {
        topLeftCorner: result.location.topLeftCorner,
        topRightCorner: result.location.topRightCorner,
        bottomLeftCorner: result.location.bottomLeftCorner,
        bottomRightCorner: result.location.bottomRightCorner,
      },
    }
  }

  /** 批量扫描多帧 */
  async scanBatch(frames: ImageData[]): Promise<(ScanResult | null)[]> {
    await this.readyPromise

    if (this.worker && frames.length > 0) {
      return this.scanBatchWithWorker(frames)
    }
    return Promise.all(frames.map(f => this.scanMainThread(f)))
  }

  /** 通过 Worker 批量扫描 */
  private scanBatchWithWorker(frames: ImageData[]): Promise<(ScanResult | null)[]> {
    return new Promise((resolve, reject) => {
      const id = ++requestId
      this.batchPendingRequests.set(id, { resolve, reject })

      const message: WorkerMessage = { type: 'scanBatch', id, frames }
      const transfers = frames.map(f => f.data.buffer)
      this.worker!.postMessage(message, transfers)
    })
  }

  /** 从 Video 元素扫描 */
  async scanFromVideo(video: HTMLVideoElement, canvas?: HTMLCanvasElement): Promise<ScanResult | null> {
    const width = video.videoWidth
    const height = video.videoHeight

    if (width === 0 || height === 0) return null

    const cvs = canvas ?? document.createElement('canvas')
    cvs.width = width
    cvs.height = height

    const ctx = cvs.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)

    return this.scan(imageData)
  }

  /** 从 Canvas 扫描 */
  async scanFromCanvas(canvas: HTMLCanvasElement): Promise<ScanResult | null> {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return this.scan(imageData)
  }

  /** 销毁 Scanner，释放资源 */
  destroy() {
    if (this.worker) {
      const message: WorkerMessage = { type: 'terminate' }
      this.worker.postMessage(message, self.location.origin)
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
    this.batchPendingRequests.clear()
  }
}

/** 创建 Scanner 实例 */
export function createQRScanner(config?: ScannerConfig): QRScanner {
  return new QRScanner(config)
}

// 导出默认单例（按需使用）
let defaultScanner: QRScanner | null = null

export function getDefaultScanner(): QRScanner {
  if (!defaultScanner) {
    defaultScanner = new QRScanner()
  }
  return defaultScanner
}
