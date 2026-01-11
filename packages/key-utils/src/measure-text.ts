let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

export function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') {
    return text.length * 8
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }

  if (!measureCtx) {
    return text.length * 8
  }

  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export function getComputedFont(element: HTMLElement): string {
  const style = getComputedStyle(element)
  return `${style.fontSize} ${style.fontFamily}`
}
