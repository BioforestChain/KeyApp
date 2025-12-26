/**
 * ContactAvatar - 联系人头像组件
 * 支持格式：
 * - avatar:HASH - Avataaars 编码（8字符 base64）
 * - https://... - 外部图片 URL
 * - emoji - 单个表情符号
 * 如需从地址生成头像，请使用 generateAvatarFromAddress(address, seed)
 */

import { useMemo } from 'react'
import Avatar from '@gamepark/avataaars'
import { renderToStaticMarkup } from 'react-dom/server'
import { decodeAvatar } from '@/lib/avatar-codec'
import { IconUser } from '@tabler/icons-react'

interface ContactAvatarProps {
  /** 头像源：avatar:HASH / http(s) URL / emoji */
  src?: string | undefined
  size?: number | undefined
  className?: string | undefined
}

/** 解析 avatar URL */
function parseAvatarSrc(src: string): { type: 'hash' | 'url' | 'emoji'; value: string } {
  try {
    const url = new URL(src)
    if (url.protocol === 'avatar:') {
      return { type: 'hash', value: url.pathname }
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return { type: 'url', value: src }
    }
  } catch {
    // 不是有效 URL，当作 emoji
  }
  return { type: 'emoji', value: src }
}

const DROP_SHADOW = 'drop-shadow(0 8px 16px color-mix(in oklch, var(--primary) 30%, transparent))'

/** 生成 Avataaars SVG data URL */
function generateAvatarDataUrl(hash: string): string {
  const config = decodeAvatar(hash)
  const svgMarkup = renderToStaticMarkup(
    <Avatar
      style={{ width: 64, height: 64 }}
      circle
      topType={config.topType as never}
      accessoriesType={config.accessoriesType as never}
      hairColor={config.hairColor}
      facialHairType={config.facialHairType as never}
      facialHairColor={config.facialHairColor}
      clotheType={config.clotheType as never}
      clotheColor={config.clotheColor}
      graphicType={config.graphicType as never}
      eyeType={config.eyeType as never}
      eyebrowType={config.eyebrowType as never}
      mouthType={config.mouthType as never}
      skinColor={config.skinColor}
    />
  )
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
}

export function ContactAvatar({ src, size = 64, className }: ContactAvatarProps) {
  const parsed = useMemo(() => src ? parseAvatarSrc(src) : null, [src])
  
  const imgSrc = useMemo(() => {
    if (!parsed) return null
    if (parsed.type === 'hash') return generateAvatarDataUrl(parsed.value)
    if (parsed.type === 'url') return parsed.value
    return null
  }, [parsed])

  // 无头像或 emoji
  if (!imgSrc) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, filter: DROP_SHADOW }}
      >
        <div className="bg-primary flex aspect-square size-full items-center justify-center rounded-full">
          {parsed?.type === 'emoji' ? (
            <span style={{ fontSize: size * 0.618 }}>{parsed.value}</span>
          ) : (
            <IconUser className="text-primary-foreground" style={{ width: size * 0.618, height: size * 0.618 }} />
          )}
        </div>
      </div>
    )
  }

  // 图片（hash 或 URL）
  return (
    <div
      className={className}
      style={{ width: size, height: size, filter: DROP_SHADOW }}
    >
      <img
        src={imgSrc}
        alt="avatar"
        className="aspect-square size-full rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
