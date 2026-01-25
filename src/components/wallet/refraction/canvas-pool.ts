export type HologramCanvasEntry = {
  key: string
  cardId: string
  canvas: HTMLCanvasElement
  registered: boolean
}

const canvasPool = new Map<string, HologramCanvasEntry>()

export function getHologramCanvasEntry(key: string): HologramCanvasEntry {
  let entry = canvasPool.get(key)
  if (!entry) {
    const canvas = document.createElement("canvas")
    entry = {
      key,
      cardId: key,
      canvas,
      registered: false,
    }
    canvasPool.set(key, entry)
  }
  return entry
}
