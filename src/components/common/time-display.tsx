import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type TimeFormat = 'relative' | 'date' | 'datetime' | 'time'

interface TimeDisplayProps {
  value: Date | string | number
  format?: TimeFormat
  className?: string
}

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  return new Date(value)
}

// 获取当前语言的 locale
function getLocale(lang: string): string {
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'en': 'en-US',
    'ar': 'ar-SA',
  }
  return localeMap[lang] || lang
}

export function TimeDisplay({
  value,
  format = 'relative',
  className,
}: TimeDisplayProps) {
  const { t, i18n } = useTranslation()
  const date = toDate(value)
  const locale = getLocale(i18n.language)
  
  // 无效日期
  if (isNaN(date.getTime())) {
    return <span className={cn('text-muted', className)}>--</span>
  }

  let formatted: string
  
  switch (format) {
    case 'relative':
      formatted = formatRelativeTime(date, t)
      break
    case 'date':
      formatted = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      break
    case 'datetime':
      formatted = date.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      break
    case 'time':
      formatted = date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
      break
  }

  const titleText = date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <time 
      dateTime={date.toISOString()} 
      title={titleText}
      className={className}
    >
      {formatted}
    </time>
  )
}

// 相对时间格式化（支持 i18n）
function formatRelativeTime(
  date: Date, 
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0
  
  if (absDiff < 60000) return t('time.justNow')
  
  if (absDiff < 3600000) {
    const count = Math.floor(absDiff / 60000)
    return isFuture 
      ? t('time.minutesLater', { count }) 
      : t('time.minutesAgo', { count })
  }
  
  if (absDiff < 86400000) {
    const count = Math.floor(absDiff / 3600000)
    return isFuture 
      ? t('time.hoursLater', { count }) 
      : t('time.hoursAgo', { count })
  }
  
  if (absDiff < 604800000) {
    const count = Math.floor(absDiff / 86400000)
    return isFuture 
      ? t('time.daysLater', { count }) 
      : t('time.daysAgo', { count })
  }
  
  // 超过一周显示日期
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 导出工具函数（用于非组件场景）
export function formatDate(date: Date, locale = 'zh-CN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date, locale = 'zh-CN'): string {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date, locale = 'zh-CN'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export { toDate }
