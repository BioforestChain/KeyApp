/**
 * QR Scanner Web Worker
 * 在后台线程执行 QR 码解码，避免阻塞主线程
 */

import jsQR from 'jsqr'
import type { WorkerMessage, WorkerResponse, ScanResult, QRLocation } from './types'

/** 执行单帧扫描 */
function scanFrame(imageData: ImageData): ScanResult | null {
  const start = performance.now()
  
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert', // 性能优化：只尝试正常模式
  })
  
  if (!result) return null
  
  const duration = performance.now() - start
  
  const location: QRLocation = {
    topLeftCorner: result.location.topLeftCorner,
    topRightCorner: result.location.topRightCorner,
    bottomLeftCorner: result.location.bottomLeftCorner,
    bottomRightCorner: result.location.bottomRightCorner,
  }
  
  return {
    content: result.data,
    duration,
    location,
  }
}

/** 处理消息 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  
  switch (message.type) {
    case 'scan': {
      try {
        const result = scanFrame(message.imageData)
        const response: WorkerResponse = { type: 'result', id: message.id, result }
        self.postMessage(response)
      } catch (error) {
        const response: WorkerResponse = {
          type: 'result',
          id: message.id,
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
        self.postMessage(response)
      }
      break
    }
    
    case 'scanBatch': {
      try {
        const results = message.frames.map(scanFrame)
        const response: WorkerResponse = { type: 'batchResult', id: message.id, results }
        self.postMessage(response)
      } catch (error) {
        const response: WorkerResponse = {
          type: 'batchResult',
          id: message.id,
          results: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        }
        self.postMessage(response)
      }
      break
    }
    
    case 'terminate': {
      self.close()
      break
    }
  }
}

// 通知主线程 Worker 已就绪
const readyResponse: WorkerResponse = { type: 'ready' }
self.postMessage(readyResponse)
