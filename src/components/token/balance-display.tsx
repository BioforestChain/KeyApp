import { cn } from '@/lib/utils'
import { AmountWithFiat, formatAmount } from '../common/amount-display'

interface BalanceDisplayProps {
  value: string | number
  symbol?: string | undefined
  decimals?: number | undefined
  fiatValue?: string | undefined
  fiatSymbol?: string | undefined
  hidden?: boolean | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  className?: string | undefined
}

const sizeMap = {
  sm: { size: 'sm' as const, fiatSize: 'xs' as const },
  md: { size: 'md' as const, fiatSize: 'sm' as const },
  lg: { size: 'lg' as const, fiatSize: 'sm' as const },
}

/**
 * @deprecated 请使用 AmountWithFiat 组件替代
 * @see AmountWithFiat from '@/components/common'
 */
export function BalanceDisplay({
  value,
  symbol,
  decimals = 4,
  fiatValue,
  fiatSymbol = '$',
  hidden = false,
  size = 'md',
  className,
}: BalanceDisplayProps) {
  const sizeConfig = sizeMap[size]

  // Build props conditionally to avoid passing undefined for optional properties
  const baseProps = {
    value,
    decimals,
    fiatSymbol,
    hidden,
    size: sizeConfig.size,
    weight: 'semibold' as const,
    className: cn(
      size === 'md' && '@xs:text-lg',
      size === 'lg' && '@xs:text-2xl',
      className
    ),
  }

  // Only add optional props if they have values
  if (symbol !== undefined && fiatValue !== undefined) {
    return <AmountWithFiat {...baseProps} symbol={symbol} fiatValue={fiatValue} />
  }
  if (symbol !== undefined) {
    return <AmountWithFiat {...baseProps} symbol={symbol} />
  }
  if (fiatValue !== undefined) {
    return <AmountWithFiat {...baseProps} fiatValue={fiatValue} />
  }
  return <AmountWithFiat {...baseProps} />
}

// 保持向后兼容
function formatNumber(value: string | number, decimals = 4): string {
  return formatAmount(value, decimals, false).formatted
}

export { formatNumber }
