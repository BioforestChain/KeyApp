/**
 * AnimatedNumber - Animated number display using @number-flow/react
 *
 * Features:
 * - Smooth digit-by-digit animation
 * - Loading state with pulse animation
 * - Configurable decimal places (default: 8 for bioforest chains)
 * - Monospace font for consistent width
 * - Full accessibility support with aria-label
 */

import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import { AmountDisplay } from './amount-display'

/** 小数位显示模式：false=隐藏尾随零, true=显示完整小数位, 'auto'=自适应容器宽度 */
type FixedDecimalsMode = boolean | 'auto';

interface AnimatedNumberProps {
  /** The number value to display */
  value: number
  /** Whether the value is still loading */
  loading?: boolean | undefined
  /** Decimal places to show (default: 8) */
  decimals?: number | undefined
  /** 小数位显示模式：false=隐藏尾随零, true=显示完整, 'auto'=自适应宽度 */
  fixedDecimals?: FixedDecimalsMode | undefined
  /** Formatting locale (default: en-US) */
  locale?: string | undefined
  /** Additional CSS classes */
  className?: string | undefined
}

function formatForA11y(value: number, decimals: number, fixedDecimals: boolean, locale: string): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: fixedDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
  })
}

export function AnimatedNumber({
  value,
  loading = false,
  decimals = 8,
  fixedDecimals = 'auto',
  locale = 'en-US',
  className,
}: AnimatedNumberProps) {
  // auto 模式：使用 AmountDisplay 的自适应逻辑
  if (fixedDecimals === 'auto') {
    return (
      <AmountDisplay
        value={value}
        decimals={decimals}
        fixedDecimals="auto"
        loading={loading}
        animated
        className={className}
      />
    )
  }

  const format = {
    minimumFractionDigits: fixedDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
  }

  // 加载状态：显示 0 配合呼吸动画
  if (loading) {
    return (
      <span
        className={cn('font-mono animate-pulse', className)}
        role="status"
        aria-label="Loading..."
      >
        <NumberFlow
          value={0}
          format={format}
          locales={locale}
          aria-hidden="true"
        />
      </span>
    )
  }

  const a11yLabel = formatForA11y(value, decimals, fixedDecimals, locale)

  return (
    <span
      className={cn('font-mono', className)}
      role="text"
      aria-label={a11yLabel}
    >
      <NumberFlow
        value={value}
        format={format}
        locales={locale}
        aria-hidden="true"
      />
    </span>
  )
}

/**
 * AnimatedAmount - Wrapper for string/number values
 *
 * Accepts both string and number values, parsing strings automatically.
 */
interface AnimatedAmountProps {
  /** The value to display (string or number) */
  value: string | number
  /** Whether the value is still loading */
  loading?: boolean | undefined
  /** Decimal places to show (default: 8) */
  decimals?: number | undefined
  /** 小数位显示模式：false=隐藏尾随零, true=显示完整, 'auto'=自适应宽度 */
  fixedDecimals?: FixedDecimalsMode | undefined
  /** Formatting locale (default: en-US) */
  locale?: string | undefined
  /** Additional CSS classes */
  className?: string | undefined
}

export function AnimatedAmount({
  value,
  loading = false,
  decimals = 8,
  fixedDecimals = 'auto',
  locale = 'en-US',
  className,
}: AnimatedAmountProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const safeValue = isNaN(numValue) ? 0 : numValue

  return (
    <AnimatedNumber
      value={safeValue}
      loading={loading}
      decimals={decimals}
      fixedDecimals={fixedDecimals}
      locale={locale}
      {...(className && { className })}
    />
  )
}
