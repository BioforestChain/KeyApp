import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ChainIcon, type ChainType } from '../wallet/chain-icon'
import { AmountDisplay } from '../common'
import { currencies, useCurrency } from '@/stores'
import { getExchangeRate, useExchangeRate } from '@/hooks/use-exchange-rate'

function parseFiatNumber(input: string): number | null {
  const normalized = input.replaceAll(',', '').trim()
  if (normalized.length === 0) return null

  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export interface TokenInfo {
  symbol: string
  name: string
  balance: string
  fiatValue?: string | undefined
  chain: ChainType
  icon?: string | undefined
  change24h?: number | undefined
}

interface TokenItemProps {
  token: TokenInfo
  onClick?: (() => void) | undefined
  showChange?: boolean | undefined
  className?: string | undefined
}

export function TokenItem({ token, onClick, showChange = false, className }: TokenItemProps) {
  const isClickable = !!onClick
  const { t } = useTranslation()
  const currency = useCurrency()

  const shouldFetchRate = token.fiatValue !== undefined && currency !== 'USD'
  const { data: exchangeRateData, isLoading: exchangeRateLoading, error: exchangeRateError } =
    useExchangeRate('USD', shouldFetchRate ? [currency] : [])
  const exchangeRate = shouldFetchRate ? getExchangeRate(exchangeRateData, currency) : undefined

  const usdFiatValue = token.fiatValue !== undefined ? parseFiatNumber(token.fiatValue) : null
  const normalizedFiatValue =
    token.fiatValue !== undefined ? (usdFiatValue !== null ? String(usdFiatValue) : token.fiatValue) : undefined

  const canConvert = currency !== 'USD' && exchangeRate !== undefined && usdFiatValue !== null
  const fiatSymbol = canConvert ? currencies[currency].symbol : currencies.USD.symbol
  const displayFiatValue = canConvert && usdFiatValue !== null ? String(usdFiatValue * exchangeRate) : normalizedFiatValue

  const exchangeStatusMessage =
    shouldFetchRate && !canConvert
      ? exchangeRateError
        ? t('currency:exchange.error')
        : exchangeRateLoading
          ? t('currency:exchange.loading')
          : t('currency:exchange.unavailable')
      : null

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      aria-label={isClickable ? t('a11y.tokenDetails', { token: token.symbol }) : undefined}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors @container',
        isClickable && 'cursor-pointer hover:bg-muted/50 active:bg-muted',
        className
      )}
    >
      {/* Token Icon */}
      <div className="relative">
        {token.icon ? (
          <img
            src={token.icon}
            alt={token.symbol}
            className="w-10 aspect-square rounded-full @xs:w-12"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={cn(
          'w-10 aspect-square rounded-full bg-gradient-purple flex items-center justify-center text-white font-bold @xs:w-12',
          token.icon && 'hidden'
        )}>
          {token.symbol.charAt(0)}
        </div>
        {/* Chain badge */}
        <ChainIcon
          chain={token.chain}
          size="sm"
          className="absolute -bottom-0.5 -right-0.5 size-4 text-[8px] ring-2 ring-background"
        />
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate @xs:text-base">{token.symbol}</p>
        <p className="text-xs text-muted truncate @xs:text-sm">{token.name}</p>
      </div>

      {/* Balance */}
      <div className="text-right shrink-0">
        <AmountDisplay 
          value={token.balance} 
          weight="semibold" 
          size="sm"
          className="@xs:text-base"
        />
        {displayFiatValue && (
          <p className="text-xs text-muted @xs:text-sm" title={exchangeStatusMessage ?? undefined}>
            ≈ {fiatSymbol}<AmountDisplay value={displayFiatValue} size="xs" className="inline" />
            {showChange && token.change24h !== undefined && (
              <AmountDisplay
                value={token.change24h}
                sign="always"
                color="auto"
                size="xs"
                className="ml-1 inline"
              />
            )}
            {showChange && token.change24h !== undefined && '%'}
          </p>
        )}
      </div>
    </div>
  )
}
