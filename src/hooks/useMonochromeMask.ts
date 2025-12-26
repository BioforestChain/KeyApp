import { useState, useEffect } from 'react'

/**
 * 将图标转换为单色遮罩（用于防伪水印）
 * 
 * 原理：
 * 1. 加载图标到 canvas
 * 2. 转换为灰度
 * 3. 用亮度值作为 alpha 通道（白色=不透明，黑色=透明）
 * 4. 返回 data URL
 */
export function useMonochromeMask(
  iconUrl: string | undefined,
  options: {
    /** 输出图标尺寸 */
    size?: number
    /** 是否反转（黑变白，白变黑） */
    invert?: boolean
    /** 对比度增强（1=原始，2=高对比度） */
    contrast?: number
  } = {}
): string | null {
  const { size = 64, invert = false, contrast = 1.5 } = options
  const [maskUrl, setMaskUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!iconUrl) {
      setMaskUrl(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 绘制图标（居中）
      const scale = Math.min(size / img.width, size / img.height) * 0.8
      const w = img.width * scale
      const h = img.height * scale
      const x = (size - w) / 2
      const y = (size - h) / 2

      ctx.drawImage(img, x, y, w, h)

      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, size, size)
      const data = imageData.data

      // 第一遍：找到亮度范围（只考虑有 alpha 的像素）
      let minLum = 1
      let maxLum = 0
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]!
        if (a < 10) continue // 忽略几乎透明的像素
        
        const r = data[i]!
        const g = data[i + 1]!
        const b = data[i + 2]!
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        minLum = Math.min(minLum, lum)
        maxLum = Math.max(maxLum, lum)
      }
      
      // 防止除以零
      const lumRange = maxLum - minLum
      const hasRange = lumRange > 0.01

      // 第二遍：归一化并转换为遮罩
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!
        const g = data[i + 1]!
        const b = data[i + 2]!
        const a = data[i + 3]!

        // 计算亮度并归一化到 0~1
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        if (hasRange) {
          luminance = (luminance - minLum) / lumRange
        }

        // 应用对比度
        luminance = ((luminance - 0.5) * contrast + 0.5)
        luminance = Math.max(0, Math.min(1, luminance))

        // 反转
        if (invert) {
          luminance = 1 - luminance
        }

        // 结合原始 alpha
        const finalAlpha = luminance * (a / 255) * 255

        // 设置为白色 + 亮度作为 alpha
        data[i] = 255     // R
        data[i + 1] = 255 // G
        data[i + 2] = 255 // B
        data[i + 3] = finalAlpha // A = luminance
      }

      ctx.putImageData(imageData, 0, 0)
      setMaskUrl(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      setMaskUrl(null)
    }

    img.src = iconUrl
  }, [iconUrl, size, invert, contrast])

  return maskUrl
}
