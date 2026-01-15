import type { RenderState, WorkerMessage, MainMessage } from './types'

class HologramScheduler {
  private worker: Worker | null = null
  private ready = false
  private pendingRegistrations: Array<{ cardId: string; canvas: OffscreenCanvas }> = []
  private states = new Map<string, RenderState>()
  private loadedWatermarks = new Set<string>()
  private rafId: number | null = null
  private triangleMaskBitmap: ImageBitmap | null = null
  private triangleMaskSent = false
  private paused = false // 页面不可见时暂停渲染

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWorker()
      this.loadTriangleMask()
      this.initVisibilityListener()
    }
  }

  private initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause()
      } else {
        this.resume()
      }
    })
  }

  private pause() {
    this.paused = true
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private resume() {
    this.paused = false
    // 恢复时立即刷新一次
    if (this.states.size > 0) {
      this.scheduleFlush()
    }
  }

  private async loadTriangleMask() {
    try {
      // 生成高分辨率的 triangle mask，基于 devicePixelRatio
      const dpr = Math.min(3, window.devicePixelRatio || 1)
      const baseSize = 24
      const size = Math.round(baseSize * dpr)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 绘制三角形 (右下角)
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.moveTo(0, size)
      ctx.lineTo(size, size)
      ctx.lineTo(size, 0)
      ctx.closePath()
      ctx.fill()

      this.triangleMaskBitmap = await createImageBitmap(canvas)
      // Send to worker if ready
      this.sendTriangleMaskIfReady()
    } catch (e) {

    }
  }

  private sendTriangleMaskIfReady() {
    if (this.ready && this.worker && this.triangleMaskBitmap && !this.triangleMaskSent) {
      this.triangleMaskSent = true
      this.worker.postMessage(
        { type: 'setTriangleMask', bitmap: this.triangleMaskBitmap } satisfies WorkerMessage,
        [this.triangleMaskBitmap],
      )
    }
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = this.handleMessage
      this.worker.onerror = (_e) => {

      }
    } catch (e) {

    }
  }

  private handleMessage = (e: MessageEvent<MainMessage>) => {
    if (e.data.type === 'ready') {
      this.ready = true
      // Send pending canvas registrations
      for (const reg of this.pendingRegistrations) {
        this.worker!.postMessage({ type: 'register', ...reg } satisfies WorkerMessage, [reg.canvas])
      }
      this.pendingRegistrations = []
      // Send triangle mask if already loaded
      this.sendTriangleMaskIfReady()
      // Flush any pending states after worker is ready
      this.scheduleFlush()
    }
  }

  register(cardId: string, canvas: HTMLCanvasElement): () => void {
    if (!this.worker) {
      return () => { }
    }

    const offscreen = canvas.transferControlToOffscreen()

    if (this.ready) {
      this.worker.postMessage({ type: 'register', cardId, canvas: offscreen } satisfies WorkerMessage, [offscreen])
    } else {
      this.pendingRegistrations.push({ cardId, canvas: offscreen })
    }

    return () => this.unregister(cardId)
  }

  unregister(cardId: string) {
    this.states.delete(cardId)
    this.worker?.postMessage({ type: 'unregister', cardId } satisfies WorkerMessage)
  }

  update(state: RenderState) {
    this.states.set(state.cardId, state)
    this.scheduleFlush()
  }

  loadWatermark(key: string, url: string) {
    if (this.loadedWatermarks.has(key)) return
    this.loadedWatermarks.add(key)
    this.worker?.postMessage({ type: 'loadWatermark', key, url } satisfies WorkerMessage)
  }

  private scheduleFlush() {
    if (this.rafId !== null || this.paused) return
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      this.flush()
    })
  }

  private flush() {
    if (!this.ready || this.states.size === 0 || !this.worker) return
    this.worker.postMessage({
      type: 'update',
      states: [...this.states.values()],
    } satisfies WorkerMessage)
  }
}

export const hologramScheduler = new HologramScheduler()
