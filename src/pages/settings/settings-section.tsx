import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SettingsSectionProps {
  /** 分组标题 */
  title?: string
  /** 子项 */
  children: ReactNode
  /** 额外 className */
  className?: string
  /** 允许系统右键菜单（DWEB 开发模式） */
  allowContextMenu?: boolean
}

export function SettingsSection({
  title,
  children,
  className,
  allowContextMenu,
}: SettingsSectionProps) {
  return (
    <section
      className={cn('space-y-1', className)}
      data-allow-context-menu={allowContextMenu ? 'true' : undefined}
    >
      {title && (
        <h3 className="mb-2 px-1 text-xs font-medium uppercase text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {children}
      </div>
    </section>
  )
}
