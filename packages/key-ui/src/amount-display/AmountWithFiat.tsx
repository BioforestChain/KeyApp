'use client'
import * as React from 'react'
import { cn, formatAmount } from '@biochain/key-utils'
import { AmountDisplay } from './AmountDisplay'
import type { AmountDisplayProps } from './AmountDisplay'

export interface AmountWithFiatProps extends AmountDisplayProps {
  fiatValue?: string | number
  fiatSymbol?: string
  fiatDecimals?: number
  layout?: 'vertical' | 'horizontal'
}

export const AmountWithFiat = React.forwardRef(function AmountWithFiat(
  props: AmountWithFiatProps,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const {
    fiatValue,
    fiatSymbol = '$',
    fiatDecimals = 2,
    layout = 'vertical',
    className,
    ...amountProps
  } = props

  const fiatFormatted =
    fiatValue !== undefined ? formatAmount(fiatValue, { decimals: fiatDecimals }).formatted : null

  if (layout === 'horizontal') {
    return (
      <span className={cn('inline-flex items-baseline gap-2', className)}>
        <AmountDisplay ref={forwardedRef} {...amountProps} />
        {fiatFormatted && (
          <span className="text-muted-foreground text-sm">
            ≈ {fiatSymbol}
            {fiatFormatted}
          </span>
        )}
      </span>
    )
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      <AmountDisplay ref={forwardedRef} {...amountProps} />
      {fiatFormatted && (
        <p className="text-muted-foreground text-sm">
          ≈ {fiatSymbol}
          {fiatFormatted}
        </p>
      )}
    </div>
  )
})

export namespace AmountWithFiat {
  export type Props = AmountWithFiatProps
}
