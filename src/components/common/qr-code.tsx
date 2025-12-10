import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface QRCodeProps {
  /** 要编码的内容 */
  value: string
  /** 尺寸 (px) */
  size?: number
  /** 背景色 */
  bgColor?: string
  /** 前景色 */
  fgColor?: string
  /** 容错级别 */
  level?: 'L' | 'M' | 'Q' | 'H'
  /** 是否包含边距 */
  includeMargin?: boolean
  /** 中心 Logo URL */
  logoUrl?: string
  /** Logo 尺寸 */
  logoSize?: number
  /** 自定义类名 */
  className?: string
}

export function QRCode({
  value,
  size = 200,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'M',
  includeMargin = true,
  logoUrl,
  logoSize = 40,
  className,
}: QRCodeProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl bg-white p-4',
        className
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
      />
      {logoUrl && (
        <div
          className="absolute rounded-lg bg-white p-1"
          style={{
            width: logoSize + 8,
            height: logoSize + 8,
          }}
        >
          <img
            src={logoUrl}
            alt="Logo"
            className="size-full object-contain"
            style={{ width: logoSize, height: logoSize }}
          />
        </div>
      )}
    </div>
  )
}

/** 地址二维码 - 带链标识 */
interface AddressQRCodeProps {
  address: string
  chain?: string
  size?: number
  className?: string
}

export function AddressQRCode({
  address,
  chain,
  size = 200,
  className,
}: AddressQRCodeProps) {
  // 根据链类型生成不同的 URI 格式
  const getQRValue = () => {
    switch (chain) {
      case 'ethereum':
        return `ethereum:${address}`
      case 'bitcoin':
        return `bitcoin:${address}`
      case 'tron':
        return address // Tron 通常直接用地址
      default:
        return address
    }
  }

  return (
    <QRCode
      value={getQRValue()}
      size={size}
      level="H" // 高容错，支持 Logo
      className={className}
    />
  )
}
