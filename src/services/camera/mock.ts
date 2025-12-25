/**
 * 相机服务 - Mock 实现
 * 
 * 支持多种输入源模拟：
 * - 静态结果（默认）
 * - 单张图片
 * - 多张图片序列
 * - 视频
 */

import { cameraServiceMeta, type ScanResult } from './types'
import type { FrameSource, MockFrameSourceConfig } from '@/lib/qr-scanner/types'
import { createFrameSource, MockCameraView } from '@/lib/qr-scanner/mock-frame-source'
import { createQRScanner, type QRScanner } from '@/lib/qr-scanner'

let mockScanResult: ScanResult = { content: 'mock-qr-content', format: 'QR_CODE' }
let mockPermission = true
let mockFrameSource: FrameSource | null = null
let mockCameraView: MockCameraView | null = null
let mockScanner: QRScanner | null = null

export const cameraService = cameraServiceMeta.impl({
  async scanQRCode() {
    // 如果有帧源，从帧源扫描
    if (mockFrameSource && mockScanner) {
      const frame = mockFrameSource.getFrame()
      if (frame) {
        const result = await mockScanner.scan(frame)
        if (result) {
          return { content: result.content, format: 'QR_CODE' }
        }
      }
      // 尝试下一帧
      const hasNext = await mockFrameSource.nextFrame()
      if (hasNext) {
        const nextFrame = mockFrameSource.getFrame()
        if (nextFrame) {
          const result = await mockScanner.scan(nextFrame)
          if (result) {
            return { content: result.content, format: 'QR_CODE' }
          }
        }
      }
    }
    // 回退到静态结果
    return mockScanResult
  },

  async checkPermission() {
    return mockPermission
  },

  async requestPermission() {
    return mockPermission
  },
})

/** Mock 控制器 - 增强版 */
export const cameraMockController = {
  /** 设置静态扫描结果 */
  setScanResult: (result: ScanResult) => { 
    mockScanResult = result 
  },
  
  /** 设置权限状态 */
  setPermission: (permission: boolean) => { 
    mockPermission = permission 
  },
  
  /** 设置帧源（单图片/多图片/视频） */
  setFrameSource: async (config: MockFrameSourceConfig) => {
    // 清理旧资源
    mockCameraView?.destroy()
    mockFrameSource?.destroy()
    
    // 创建新帧源
    mockFrameSource = await createFrameSource(config)
    mockCameraView = new MockCameraView(mockFrameSource)
    
    // 确保有 scanner
    if (!mockScanner) {
      mockScanner = createQRScanner({ useWorker: false })
    }
  },
  
  /** 获取 MockCameraView（可用于在 UI 中显示） */
  getCameraView: () => mockCameraView,
  
  /** 获取当前帧的 Canvas */
  getCanvas: () => mockCameraView?.getCanvas() ?? null,
  
  /** 前进到下一帧 */
  nextFrame: async () => {
    if (mockFrameSource) {
      return mockFrameSource.nextFrame()
    }
    return false
  },
  
  /** 重置帧源到起始位置 */
  resetFrameSource: () => {
    mockFrameSource?.reset()
  },
  
  /** 重置所有 Mock 状态 */
  reset: () => {
    mockScanResult = { content: 'mock-qr-content', format: 'QR_CODE' }
    mockPermission = true
    mockCameraView?.destroy()
    mockFrameSource?.destroy()
    mockScanner?.destroy()
    mockCameraView = null
    mockFrameSource = null
    mockScanner = null
  },
}
