/**
 * MiniappSplashScreen - 小程序启动屏幕
 *
 * 使用基于应用 themeColor 的光晕渲染方案
 * 参考 IOSWallpaper 的实现，提供更柔和的启动体验
 */

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import styles from './miniapp-splash-screen.module.css'

export interface MiniappSplashScreenProps {
  /** 可选：用于埋点/调试/定位元素 */
  appId?: string
  /** 应用信息 */
  app: {
    name: string
    icon: string
    /** 主题色，支持 hex、rgb、oklch 或直接传 hue 数值 */
    themeColor?: string | number
  }
  /** 是否可见 */
  visible: boolean
  /** 是否播放呼吸动画 */
  animating?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 从颜色字符串中提取 hue 值
 * 支持：
 * - 纯数字（直接作为 hue）
 * - hex: #ff0000
 * - rgb: rgb(255, 0, 0)
 * - oklch: oklch(0.6 0.2 30)
 */
export function extractHue(color: string | number | undefined): number {
  if (color === undefined) return 280 // 默认紫色

  // 直接传数字
  if (typeof color === 'number') {
    return normalizeHue(color)
  }

  const str = color.trim().toLowerCase()

  // oklch(l c h) 格式
  if (str.startsWith('oklch')) {
    const match = str.match(/oklch\s*\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/)
    if (match?.[1]) {
      return normalizeHue(parseFloat(match[1]))
    }
  }

  // hsl(h, s%, l%) 格式
  if (str.startsWith('hsl')) {
    const match = str.match(/hsl\s*\(\s*([\d.]+)/)
    if (match?.[1]) {
      return normalizeHue(parseFloat(match[1]))
    }
  }

  // hex 格式
  if (str.startsWith('#')) {
    return hexToHue(str)
  }

  // rgb 格式
  if (str.startsWith('rgb')) {
    const match = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (match?.[1] && match[2] && match[3]) {
      return rgbToHue(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      )
    }
  }

  return 280 // 默认
}

/** 将 hue 标准化到 0-360 范围 */
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

/** hex 转 hue */
function hexToHue(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result?.[1] || !result[2] || !result[3]) return 280

  return rgbToHue(
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  )
}

/** RGB 转 hue */
function rgbToHue(r: number, g: number, b: number): number {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  if (d === 0) return 0

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return Math.round(h * 360)
}

/**
 * 生成三色光晕的 hue 值
 * @param baseHue 基础色相
 * @returns [主色, 邻近色1(+30°), 邻近色2(-30°)]
 */
export function generateGlowHues(baseHue: number): [number, number, number] {
  return [
    normalizeHue(baseHue),
    normalizeHue(baseHue + 30),
    normalizeHue(baseHue - 30),
  ]
}

export function MiniappSplashScreen({
  appId,
  app,
  visible,
  animating = true,
  onClose: _onClose,
  className,
}: MiniappSplashScreenProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // 计算光晕颜色
  const [huePrimary, hueSecondary, hueTertiary] = useMemo(() => {
    const baseHue = extractHue(app.themeColor)
    return generateGlowHues(baseHue)
  }, [app.themeColor])

  // 重置图片状态
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [app.icon])

  // CSS 变量样式
  const cssVars = {
    '--splash-hue-primary': huePrimary,
    '--splash-hue-secondary': hueSecondary,
    '--splash-hue-tertiary': hueTertiary,
  } as React.CSSProperties

  return (
    <div
      className={cn(styles.splashScreen, className)}
      style={cssVars}
      data-app-id={appId}
      data-visible={visible}
      data-animating={animating}
      data-testid="miniapp-splash-screen"
      role="status"
      aria-label={`${app.name} 正在加载`}
      aria-hidden={!visible}
    >
      {/* 光晕背景层 */}
      <div className={cn(styles.glowLayer, styles.glowPrimary)} />
      <div className={cn(styles.glowLayer, styles.glowSecondary)} />
      <div className={cn(styles.glowLayer, styles.glowTertiary)} />

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* 应用图标 */}
        <div className={styles.appIcon}>
          {!imageError && (
            <img
              src={app.icon}
              alt={app.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          )}
        </div>

        {/* 加载指示器 */}
        <div className={styles.spinner} aria-hidden="true" />
      </div>
    </div>
  )
}

export default MiniappSplashScreen
