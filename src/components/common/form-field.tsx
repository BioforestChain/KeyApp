import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface FormFieldProps {
  /** 字段标签 */
  label?: string
  /** 帮助文本 */
  hint?: string
  /** 错误信息 */
  error?: string
  /** 是否必填 */
  required?: boolean
  /** 子元素 (input, select 等) */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="-mt-0.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
