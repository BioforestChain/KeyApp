/**
 * QR Scanner 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { QRScanner, createQRScanner } from '../index'

/** 创建模拟的 ImageData（jsdom 中不可用） */
function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  return {
    data,
    width,
    height,
    colorSpace: 'srgb',
  } as ImageData
}

describe('QRScanner', () => {
  let scanner: QRScanner

  beforeEach(() => {
    // 使用主线程模式（Worker 在 jsdom 中不可用）
    scanner = createQRScanner({ useWorker: false })
  })

  afterEach(() => {
    scanner.destroy()
  })

  describe('initialization', () => {
    it('should create scanner instance', () => {
      expect(scanner).toBeInstanceOf(QRScanner)
    })

    it('should be ready immediately in non-worker mode', async () => {
      await expect(scanner.waitReady()).resolves.toBeUndefined()
    })

    it('should expose isReady getter', () => {
      expect(scanner.isReady).toBe(true)
    })
  })

  describe('scan', () => {
    it('should return null for empty ImageData', async () => {
      const imageData = createMockImageData(100, 100)
      const result = await scanner.scan(imageData)
      expect(result).toBeNull()
    })

    it('should return null for random noise image', async () => {
      const imageData = createMockImageData(100, 100)
      // 填充随机数据
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.random() * 255
        imageData.data[i + 1] = Math.random() * 255
        imageData.data[i + 2] = Math.random() * 255
        imageData.data[i + 3] = 255
      }
      const result = await scanner.scan(imageData)
      expect(result).toBeNull()
    })
  })

  describe('scanBatch', () => {
    it('should handle empty batch', async () => {
      const results = await scanner.scanBatch([])
      expect(results).toEqual([])
    })

    it('should return results for each frame', async () => {
      const frames = [
        createMockImageData(100, 100),
        createMockImageData(100, 100),
        createMockImageData(100, 100),
      ]
      const results = await scanner.scanBatch(frames)
      expect(results).toHaveLength(3)
      expect(results.every(r => r === null)).toBe(true)
    })
  })

  describe('destroy', () => {
    it('should clean up resources', () => {
      scanner.destroy()
      // 应该能够多次调用 destroy
      expect(() => scanner.destroy()).not.toThrow()
    })
  })
})

describe('createQRScanner', () => {
  it('should create scanner with default config', () => {
    const scanner = createQRScanner()
    expect(scanner).toBeInstanceOf(QRScanner)
    scanner.destroy()
  })

  it('should create scanner with custom config', () => {
    const scanner = createQRScanner({
      scanInterval: 200,
      useWorker: false,
    })
    expect(scanner).toBeInstanceOf(QRScanner)
    scanner.destroy()
  })
})
