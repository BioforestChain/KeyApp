import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useMonochromeMask } from '@/hooks/useMonochromeMask'
import { createRainbowHook } from '@/lib/canvas'
import { resolveBackgroundStops } from './refraction'

export type WalletMiniCardSize = 'xs' | 'sm' | 'md'

export interface WalletMiniCardProps {
  themeHue: number
  size?: WalletMiniCardSize
  /** 是否显示三角形纹理 */
  showPattern?: boolean
  /** 水印图标 URL（居中显示，彩虹渐变） */
  watermarkIconUrl?: string | undefined
  className?: string
}

// 固定纹理网格：5 列 x 3 行
const PATTERN_COLS = 5
const PATTERN_ROWS = 3

const sizeStyles: Record<WalletMiniCardSize, { width: number; height: number; radius: string; iconSize: number }> = {
  xs: { width: 20, height: 12, radius: 'rounded-[2px]', iconSize: 10 },
  sm: { width: 32, height: 20, radius: 'rounded-[3px]', iconSize: 16 },
  md: { width: 44, height: 28, radius: 'rounded-[4px]', iconSize: 22 },
}

/**
 * 生成固定 5x3 三角形纹理的 SVG data URL
 * 使用右下角三角形，与 WalletCard 的 HologramCanvas 一致
 */
function createTrianglePatternUrl(width: number, height: number): string {
  const cellW = width / PATTERN_COLS
  const cellH = height / PATTERN_ROWS
  
  let triangles = ''
  for (let row = 0; row < PATTERN_ROWS; row++) {
    for (let col = 0; col < PATTERN_COLS; col++) {
      const x = col * cellW
      const y = row * cellH
      // 右下角三角形
      triangles += `<path d="M${x},${y + cellH} L${x + cellW},${y + cellH} L${x + cellW},${y} Z" fill="rgba(255,255,255,0.15)"/>`
    }
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${triangles}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// 预定义彩虹渐变 pipeline
const RAINBOW_PIPELINE = [createRainbowHook(0.9)]

export function WalletMiniCard({
  themeHue,
  size = 'sm',
  showPattern = true,
  watermarkIconUrl,
  className,
}: WalletMiniCardProps) {
  const { c0, c1, c2 } = useMemo(() => resolveBackgroundStops(themeHue), [themeHue])
  const { width, height, radius, iconSize } = sizeStyles[size]

  const patternUrl = useMemo(
    () => (showPattern ? createTrianglePatternUrl(width, height) : null),
    [showPattern, width, height]
  )

  // 使用 pipeline 直接在 canvas 中渲染彩虹效果
  // clip: 裁剪透明区域，让图标填满空间
  // targetBrightness: 亮度锚定，确保不同图标显示效果一致
  const dpr = typeof window !== 'undefined' ? Math.min(3, window.devicePixelRatio || 1) : 2
  const rainbowIconUrl = useMonochromeMask(watermarkIconUrl, {
    size: Math.round(iconSize * dpr),
    invert: false,
    contrast: 1.8,
    targetBrightness: 0.85,
    pipeline: RAINBOW_PIPELINE,
  })

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden', radius, className)}
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${c0} 0%, ${c1} 50%, ${c2} 100%)`,
        boxShadow: `
          inset 0 0.5px 0.5px rgba(255,255,255,0.3),
          inset 0 -0.5px 0.5px rgba(0,0,0,0.15),
          0 1px 3px rgba(0,0,0,0.2)
        `,
        border: '0.5px solid rgba(255,255,255,0.2)',
      }}
      role="img"
      aria-label="wallet card"
    >
      {/* 三角形纹理层 - 固定 5x3 网格 */}
      {patternUrl && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: patternUrl,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'overlay',
          }}
          data-testid="pattern-layer"
          aria-hidden="true"
        />
      )}

      {/* 彩虹水印层 - 居中单图标（已在 canvas 中渲染好彩虹） */}
      {rainbowIconUrl && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${rainbowIconUrl})`,
            backgroundSize: `${iconSize}px`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          data-testid="watermark-layer"
          aria-hidden="true"
        />
      )}

      {/* 高光效果 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
