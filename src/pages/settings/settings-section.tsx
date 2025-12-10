import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SettingsSectionProps {
  /** 分组标题 */
  title?: string
  /** 子项 */
  children: ReactNode
  /** 额外 className */
  className?: string
}

export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={cn('space-y-1', className)}>
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
