export type Priority = 'high' | 'medium' | 'low'

export type RenderMode = 'static' | 'dynamic'

export interface RenderState {
  cardId: string
  priority: Priority
  mode: RenderMode
  width: number
  height: number
  dpr: number
  pointer: { x: number; y: number }
  active: boolean
  themeHue: number
  enabledPattern: boolean
  enabledWatermark: boolean
  watermarkMaskUrl: string | null | undefined
  watermarkCellSize: number | undefined
  watermarkIconSize: number | undefined
}

// Main → Worker
export type WorkerMessage =
  | { type: 'register'; cardId: string; canvas: OffscreenCanvas }
  | { type: 'unregister'; cardId: string }
  | { type: 'update'; states: RenderState[] }
  | { type: 'setTriangleMask'; bitmap: ImageBitmap }
  | { type: 'loadWatermark'; key: string; url: string }

// Worker → Main
export type MainMessage = { type: 'ready' } | { type: 'rendered'; cardId: string; timestamp: number }
