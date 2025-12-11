import { type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SettingsItemProps {
  /** 左侧图标 */
  icon?: ReactNode | undefined
  /** 主标签 */
  label: string
  /** 右侧显示值 */
  value?: string | undefined
  /** 是否显示箭头（导航类项目） */
  showChevron?: boolean | undefined
  /** 是否禁用 */
  disabled?: boolean | undefined
  /** 点击回调 */
  onClick?: (() => void) | undefined
  /** 自定义右侧内容 */
  trailing?: ReactNode | undefined
  /** 额外 className */
  className?: string | undefined
}

export function SettingsItem({
  icon,
  label,
  value,
  showChevron = true,
  disabled = false,
  onClick,
  trailing,
  className,
}: SettingsItemProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl bg-background px-4 py-3.5',
        'transition-colors',
        onClick && !disabled && 'hover:bg-muted/50 active:bg-muted',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {trailing ?? (
        <>
          {value && (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
          {showChevron && onClick && (
            <ChevronRight className="size-5 text-muted-foreground/50" />
          )}
        </>
      )}
    </Component>
  )
}
