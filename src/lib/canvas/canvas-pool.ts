/**
 * OffscreenCanvas 对象池
 * 复用 canvas 实例，避免频繁创建销毁
 */
export class CanvasPool {
  private pool: OffscreenCanvas[] = []
  private maxSize: number

  constructor(maxSize = 4) {
    this.maxSize = maxSize
  }

  /**
   * 获取一个指定尺寸的 OffscreenCanvas
   * 如果池中有可用的，会调整尺寸后返回；否则创建新的
   */
  acquire(size: number): OffscreenCanvas {
    const canvas = this.pool.pop()
    if (canvas) {
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }
      return canvas
    }
    return new OffscreenCanvas(size, size)
  }

  /**
   * 归还 canvas 到池中
   */
  release(canvas: OffscreenCanvas): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(canvas)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取当前池大小
   */
  get size(): number {
    return this.pool.length
  }
}

/** 全局 canvas 池实例 */
export const canvasPool = new CanvasPool()
