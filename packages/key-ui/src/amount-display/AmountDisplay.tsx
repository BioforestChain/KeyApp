'use client'
import * as React from 'react'
import NumberFlow from '@number-flow/react'
import { cn, formatAmount, getEffectiveDecimals } from '@biochain/key-utils'
import type { KeyUIComponentProps } from '../utils/types'

type AmountSign = 'auto' | 'always' | 'never'
type AmountColor = 'auto' | 'default' | 'positive' | 'negative'
type FixedDecimalsMode = boolean | 'auto'

export interface AmountDisplayState {
  isNegative: boolean
  isZero: boolean
  isLoading: boolean
  isHidden: boolean
}

export interface AmountDisplayProps
  extends Omit<KeyUIComponentProps<'span', AmountDisplayState>, 'children'> {
  value: string | number
  symbol?: string
  decimals?: number
  sign?: AmountSign
  color?: AmountColor
  compact?: boolean
  hidden?: boolean
  loading?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  mono?: boolean
  animated?: boolean
  fixedDecimals?: FixedDecimalsMode
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

export const AmountDisplay = React.forwardRef(function AmountDisplay(
  componentProps: AmountDisplayProps,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const {
    value,
    symbol,
    decimals = 8,
    sign = 'never',
    color = 'default',
    compact = false,
    hidden = false,
    loading = false,
    size = 'md',
    weight = 'normal',
    mono = true,
    animated = true,
    fixedDecimals = 'auto',
    className,
    style,
    ...elementProps
  } = componentProps

  const { isNegative, isZero, numValue, formatted } = formatAmount(value, { decimals, compact })

  const state: AmountDisplayState = React.useMemo(
    () => ({
      isNegative,
      isZero,
      isLoading: loading,
      isHidden: hidden,
    }),
    [isNegative, isZero, loading, hidden],
  )

  let signChar = ''
  if (sign === 'always' && !isZero) {
    signChar = isNegative ? '-' : '+'
  } else if (sign === 'auto' && isNegative) {
    signChar = '-'
  }

  const effectiveMinDecimals =
    fixedDecimals === 'auto'
      ? getEffectiveDecimals(numValue, decimals)
      : fixedDecimals === true
        ? decimals
        : 0

  const format = {
    minimumFractionDigits: effectiveMinDecimals,
    maximumFractionDigits: decimals,
  }

  const baseClassName = cn(
    sizeClasses[size],
    weightClasses[weight],
    mono && 'font-mono',
    typeof className === 'function' ? className(state) : className,
  )

  const resolvedStyle = typeof style === 'function' ? style(state) : style

  if (hidden) {
    return (
      <span ref={forwardedRef} className={baseClassName} style={resolvedStyle} {...elementProps}>
        ••••••
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    )
  }

  if (loading) {
    return (
      <span
        ref={forwardedRef}
        className={cn(baseClassName, 'animate-pulse')}
        style={resolvedStyle}
        role="status"
        aria-label="Loading..."
        {...elementProps}
      >
        <NumberFlow value={0} format={format} locales="en-US" aria-hidden="true" />
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    )
  }

  let colorClass = ''
  if (color === 'auto' && !isZero) {
    colorClass = isNegative ? 'text-destructive' : 'text-green-500'
  } else if (color === 'positive') {
    colorClass = 'text-green-500'
  } else if (color === 'negative') {
    colorClass = 'text-destructive'
  }

  const coloredClassName = cn(baseClassName, colorClass)
  const a11yLabel = `${signChar}${formatted}${symbol ? ` ${symbol}` : ''}`

  if (animated && !compact) {
    return (
      <span
        ref={forwardedRef}
        className={coloredClassName}
        style={resolvedStyle}
        role="img"
        aria-label={a11yLabel}
        {...elementProps}
      >
        {signChar}
        <NumberFlow
          value={Math.abs(numValue)}
          format={format}
          locales="en-US"
          aria-hidden="true"
        />
        {symbol && (
          <span className="text-muted-foreground ml-1 font-normal" aria-hidden="true">
            {symbol}
          </span>
        )}
      </span>
    )
  }

  return (
    <span ref={forwardedRef} className={coloredClassName} style={resolvedStyle} {...elementProps}>
      {signChar}
      {formatted}
      {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
    </span>
  )
})

export namespace AmountDisplay {
  export type State = AmountDisplayState
  export type Props = AmountDisplayProps
}
