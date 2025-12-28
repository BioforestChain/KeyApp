/**
 * Miniapp Icon Component
 * 
 * 统一的小程序图标渲染组件，遵循 iOS App Icon 设计规范
 * 
 * ## 图标规格标准
 * 
 * | Size   | Dimensions | Border Radius | Use Case                    |
 * |--------|------------|---------------|-----------------------------|
 * | xs     | 32x32      | 7px           | 列表紧凑模式、通知          |
 * | sm     | 40x40      | 9px           | 搜索结果、小列表            |
 * | md     | 48x48      | 10px          | 标准列表项                  |
 * | lg     | 60x60      | 13px          | iOS 桌面风格、网格          |
 * | xl     | 80x80      | 18px          | 详情页、精选卡片            |
 * | 2xl    | 120x120    | 27px          | 大型展示、启动页            |
 * 
 * ## 圆角计算公式
 * borderRadius = size * 0.22 (iOS 标准比例)
 * 
 * ## 设计规范
 * - 图标应为正方形
 * - 支持 SVG、PNG、WebP 格式
 * - 推荐尺寸：1024x1024 原图
 * - 背景不透明（iOS 风格）
 */

import { forwardRef, useState } from 'react'
import { IconApps, IconShieldCheck, IconSparkles } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

// ============================================
// 图标尺寸配置
// ============================================
export const MINIAPP_ICON_SIZES = {
  xs: { size: 32, radius: 7 },
  sm: { size: 40, radius: 9 },
  md: { size: 48, radius: 10 },
  lg: { size: 60, radius: 13 },
  xl: { size: 80, radius: 18 },
  '2xl': { size: 120, radius: 27 },
} as const

export type MiniappIconSize = keyof typeof MINIAPP_ICON_SIZES

// ============================================
// 徽章类型
// ============================================
export type MiniappBadge = 'verified' | 'beta' | 'new' | 'update' | 'none'

// ============================================
// Props
// ============================================
export interface MiniappIconProps {
  /** 图标 URL */
  src?: string | null
  /** 应用名称（用于 alt 和占位符） */
  name?: string
  /** 图标尺寸 */
  size?: MiniappIconSize
  /** 自定义尺寸（覆盖 size） */
  customSize?: number
  /** 徽章类型 */
  badge?: MiniappBadge
  /** 是否显示阴影 */
  shadow?: boolean | 'sm' | 'md' | 'lg'
  /** 是否显示边框 */
  border?: boolean
  /** 是否为玻璃态背景（用于深色/渐变背景上） */
  glass?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 禁用状态 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击事件 */
  onClick?: () => void
}

// ============================================
// 组件
// ============================================
export const MiniappIcon = forwardRef<HTMLDivElement, MiniappIconProps>(
  function MiniappIcon(
    {
      src,
      name = 'App',
      size = 'md',
      customSize,
      badge = 'none',
      shadow = false,
      border = true,
      glass = false,
      loading = false,
      disabled = false,
      className,
      onClick,
    },
    ref
  ) {
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // 计算实际尺寸
    const sizeConfig = MINIAPP_ICON_SIZES[size]
    const actualSize = customSize ?? sizeConfig.size
    const actualRadius = customSize 
      ? Math.round(customSize * 0.22) 
      : sizeConfig.radius

    // 阴影类名
    const shadowClass = shadow === true || shadow === 'md'
      ? 'shadow-lg shadow-black/10 dark:shadow-black/30'
      : shadow === 'sm'
      ? 'shadow-md shadow-black/5 dark:shadow-black/20'
      : shadow === 'lg'
      ? 'shadow-xl shadow-black/15 dark:shadow-black/40'
      : ''

    // 是否显示占位符
    const showPlaceholder = !src || imageError

    // 徽章位置和大小（基于图标尺寸）
    const badgeSize = Math.max(16, actualSize * 0.3)
    const badgeOffset = -badgeSize * 0.2

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0",
          onClick && "cursor-pointer",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        style={{ width: actualSize, height: actualSize }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* 主图标容器 */}
        <div
          className={cn(
            "size-full overflow-hidden",
            border && !glass && "ring-1 ring-black/5 dark:ring-white/10",
            shadowClass,
            // 玻璃态：白色半透明背景 + 粗白边框 + 模糊
            glass && "bg-white/25 backdrop-blur-md ring-2 ring-white/50 shadow-lg",
            !glass && !showPlaceholder && "bg-muted",
            showPlaceholder && "bg-gradient-to-br from-muted to-muted/60"
          )}
          style={{ borderRadius: actualRadius }}
        >
          {/* 加载状态 */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div 
                className="animate-spin rounded-full border-2 border-primary border-t-transparent"
                style={{ width: actualSize * 0.4, height: actualSize * 0.4 }}
              />
            </div>
          )}

          {/* 图片 */}
          {src && !imageError && (
            <img
              src={src}
              alt={name}
              className={cn(
                "size-full object-cover transition-opacity duration-200",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              draggable={false}
            />
          )}

          {/* 占位符 */}
          {showPlaceholder && !loading && (
            <div className="size-full flex items-center justify-center">
              <IconApps 
                className="text-muted-foreground/60"
                style={{ width: actualSize * 0.5, height: actualSize * 0.5 }}
                stroke={1.5}
              />
            </div>
          )}
        </div>

        {/* 徽章 */}
        {badge !== 'none' && (
          <Badge 
            type={badge} 
            size={badgeSize} 
            offset={badgeOffset}
          />
        )}
      </div>
    )
  }
)

// ============================================
// 徽章组件
// ============================================
interface BadgeProps {
  type: Exclude<MiniappBadge, 'none'>
  size: number
  offset: number
}

function Badge({ type, size, offset }: BadgeProps) {
  const configs = {
    verified: {
      icon: IconShieldCheck,
      bg: 'bg-emerald-500',
      color: 'text-white',
    },
    beta: {
      label: 'β',
      bg: 'bg-amber-500',
      color: 'text-white',
    },
    new: {
      icon: IconSparkles,
      bg: 'bg-blue-500',
      color: 'text-white',
    },
    update: {
      label: '!',
      bg: 'bg-red-500',
      color: 'text-white',
    },
  }

  const config = configs[type]

  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full",
        "ring-2 ring-background",
        config.bg,
        config.color
      )}
      style={{
        width: size,
        height: size,
        top: offset,
        right: offset,
        fontSize: size * 0.6,
        fontWeight: 700,
      }}
    >
      {'icon' in config ? (
        <config.icon style={{ width: size * 0.65, height: size * 0.65 }} stroke={2} />
      ) : (
        config.label
      )}
    </div>
  )
}

// ============================================
// 带标签的图标组件（iOS 桌面风格）
// ============================================
export interface MiniappIconWithLabelProps extends Omit<MiniappIconProps, 'size'> {
  /** 图标尺寸，默认 lg */
  size?: MiniappIconSize
  /** 应用名称 */
  name: string
  /** 最大行数 */
  maxLines?: 1 | 2
  /** 是否显示名称 */
  showLabel?: boolean
}

export function MiniappIconWithLabel({
  name,
  size = 'lg',
  maxLines = 2,
  showLabel = true,
  className,
  ...iconProps
}: MiniappIconWithLabelProps) {
  const sizeConfig = MINIAPP_ICON_SIZES[size]
  
  // 根据图标尺寸计算字体大小
  const fontSize = Math.max(10, Math.min(13, sizeConfig.size * 0.18))
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-1.5",
        className
      )}
    >
      <MiniappIcon 
        name={name} 
        size={size} 
        shadow="sm"
        {...iconProps} 
      />
      {showLabel && (
        <span
          className={cn(
            "text-center font-medium leading-tight",
            maxLines === 1 ? "truncate" : "line-clamp-2"
          )}
          style={{
            fontSize,
            maxWidth: sizeConfig.size + 16,
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}

// ============================================
// 图标网格组件
// ============================================
export interface MiniappIconGridProps {
  /** 列数 */
  columns?: 3 | 4 | 5 | 6
  /** 图标尺寸 */
  iconSize?: MiniappIconSize
  /** 间距 */
  gap?: 'sm' | 'md' | 'lg'
  /** 子元素 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}

export function MiniappIconGrid({
  columns = 4,
  iconSize = 'lg',
  gap = 'md',
  children,
  className,
}: MiniappIconGridProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap]

  return (
    <div
      className={cn(
        "grid justify-items-center",
        gapClass,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}
