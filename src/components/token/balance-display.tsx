import { cn } from '@/lib/utils'
import { AmountWithFiat, formatAmount } from '../common/amount-display'

interface BalanceDisplayProps {
  value: string | number
  symbol?: string
  decimals?: number
  fiatValue?: string
  fiatSymbol?: string
  hidden?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
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
  
  return (
    <AmountWithFiat
      value={value}
      symbol={symbol}
      decimals={decimals}
      fiatValue={fiatValue}
      fiatSymbol={fiatSymbol}
      hidden={hidden}
      size={sizeConfig.size}
      weight="semibold"
      className={cn(
        size === 'md' && '@xs:text-lg',
        size === 'lg' && '@xs:text-2xl',
        className
      )}
    />
  )
}

// 保持向后兼容
function formatNumber(value: string | number, decimals = 4): string {
  return formatAmount(value, decimals, false).formatted
}

export { formatNumber }
