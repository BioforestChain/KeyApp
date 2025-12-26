/**
 * QR Scanner 类型定义
 */

/** 扫描结果 */
export interface ScanResult {
  /** 解码内容 */
  content: string
  /** 扫描耗时 (ms) */
  duration: number
  /** 检测位置（可选） */
  location?: QRLocation
}

/** QR 码位置信息 */
export interface QRLocation {
  topLeftCorner: Point
  topRightCorner: Point
  bottomLeftCorner: Point
  bottomRightCorner: Point
}

export interface Point {
  x: number
  y: number
}

/** Worker 消息类型 */
export type WorkerMessage =
  | { type: 'scan'; id: number; imageData: ImageData }
  | { type: 'scanBatch'; id: number; frames: ImageData[] }
  | { type: 'terminate' }

/** Worker 响应类型 */
export type WorkerResponse =
  | { type: 'result'; id: number; result: ScanResult | null; error?: string }
  | { type: 'batchResult'; id: number; results: (ScanResult | null)[]; error?: string }
  | { type: 'ready' }

/** 帧源接口 - 统一不同输入源 */
export interface FrameSource {
  /** 获取当前帧的 ImageData */
  getFrame(): ImageData | null
  /** 是否有下一帧 */
  hasNextFrame(): boolean
  /** 前进到下一帧（视频/序列图片） */
  nextFrame(): Promise<boolean>
  /** 重置到第一帧 */
  reset(): void
  /** 销毁资源 */
  destroy(): void
  /** 帧宽度 */
  readonly width: number
  /** 帧高度 */
  readonly height: number
}

/** Mock 帧源配置 */
export interface MockFrameSourceConfig {
  /** 单张图片 URL 或 Blob */
  image?: string | Blob
  /** 多张图片 URLs 或 Blobs */
  images?: (string | Blob)[]
  /** 视频 URL 或 Blob */
  video?: string | Blob
  /** 帧率（用于视频采样，默认 10fps） */
  frameRate?: number
  /** 图片序列帧间隔（ms，默认 100） */
  frameInterval?: number
}

/** Scanner 配置 */
export interface ScannerConfig {
  /** 扫描间隔（ms，默认 100） */
  scanInterval?: number
  /** 是否启用多线程（默认 true） */
  useWorker?: boolean
  /** Worker 数量（默认 1） */
  workerCount?: number
}
